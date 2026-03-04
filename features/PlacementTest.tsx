import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { PlacementTestContent, PlacementTestReport, SkillReport } from '../types';
import { generatePlacementTest, evaluatePlacementTest } from '../services/geminiService';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { SpeakerIcon, StopIcon } from '../components/icons/Icons';

type TestState = 'intro' | 'generating' | 'testing' | 'analyzing' | 'results';

const CEFR_LEVELS: { [key: string]: number } = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
const SKILL_ORDER: (keyof PlacementTestContent)[] = ['grammar', 'listening', 'reading', 'writing'];

const RadarChart: React.FC<{ report: PlacementTestReport }> = ({ report }) => {
    const size = 300;
    const center = size / 2;
    const skills = report.skillReports;
    const numAxes = skills.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    const points = skills.map((skill, i) => {
        const level = CEFR_LEVELS[skill.cefrLevel] || 1;
        const value = (level / 6) * (center * 0.8);
        const x = center + value * Math.cos(angleSlice * i - Math.PI / 2);
        const y = center + value * Math.sin(angleSlice * i - Math.PI / 2);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background grids */}
            {[...Array(6)].map((_, i) => (
                <circle
                    key={i}
                    cx={center}
                    cy={center}
                    r={((i + 1) / 6) * (center * 0.8)}
                    fill="none"
                    stroke="rgba(100, 116, 139, 0.2)"
                />
            ))}
            {/* Axes and labels */}
            {skills.map((skill, i) => {
                const x = center + (center * 0.95) * Math.cos(angleSlice * i - Math.PI / 2);
                const y = center + (center * 0.95) * Math.sin(angleSlice * i - Math.PI / 2);
                return (
                    <g key={i}>
                        <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(100, 116, 139, 0.2)" />
                        <text x={x} y={y} textAnchor="middle" dy={y > center ? "1.2em" : "-0.5em"} fontSize="12" className="fill-slate-600 dark:fill-slate-400 font-semibold">{skill.skill}</text>
                    </g>
                );
            })}
            {/* Data polygon */}
            <polygon points={points} className="fill-adai-primary/40 stroke-adai-primary stroke-2" />
        </svg>
    );
};


const PlacementTest: React.FC = () => {
    const { user } = useAuth();
    const reportKey = user ? `placement-test-report-${user}` : 'placement-test-report-guest';
    const [report, setReport] = useLocalStorage<PlacementTestReport | null>(reportKey, null);

    const [testState, setTestState] = useState<TestState>('intro');
    const [error, setError] = useState('');
    const [testContent, setTestContent] = useState<PlacementTestContent | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: any }>({ grammar: {}, listening: {}, reading: {}, writing: '' });
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

    // Audio state for listening section
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (report) {
            setTestState('results');
        }
        // Cleanup speech synthesis on unmount
        return () => window.speechSynthesis.cancel();
    }, [report]);

    const handleStartTest = async () => {
        setTestState('generating');
        setError('');
        try {
            const resultText = await generatePlacementTest();
            const resultJson: PlacementTestContent = JSON.parse(resultText);
            setTestContent(resultJson);
            setCurrentSectionIndex(0);
            setUserAnswers({ grammar: {}, listening: {}, reading: {}, writing: '' });
            setTestState('testing');
        } catch (e: any) {
            setError(e.message || 'Sınav oluşturulurken bir hata oluştu.');
            setTestState('intro');
        }
    };

    const handleSubmitTest = async () => {
        if (!testContent) return;
        setTestState('analyzing');
        setError('');
        try {
            const resultText = await evaluatePlacementTest(testContent, userAnswers);
            const resultJson: PlacementTestReport = JSON.parse(resultText);
            setReport(resultJson);
            setTestState('results');
        } catch (e: any) {
            setError(e.message || 'Sınav değerlendirilirken bir hata oluştu.');
            setTestState('testing'); // Go back to test if analysis fails
        }
    };

    const handleAnswerChange = (section: keyof PlacementTestContent, questionIndex: number, answer: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [section]: { ...prev[section], [questionIndex]: answer }
        }));
    };
    
    const handleWritingChange = (text: string) => {
        setUserAnswers(prev => ({...prev, writing: text }));
    };

    const handlePlayAudio = (script: string) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(script);
        utterance.lang = 'en-US';
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const handleRetakeTest = () => {
        setReport(null);
        setTestContent(null);
        setTestState('intro');
    };

    const currentSectionKey = SKILL_ORDER[currentSectionIndex];
    const currentSectionData = testContent ? testContent[currentSectionKey] : null;

    const renderIntro = () => (
        <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-50">Seviye Tespit Sınavı 🧭</h2>
            <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 mb-6">
                Mevcut İngilizce seviyenizi CEFR ölçeğine göre belirlemek için bu kapsamlı sınava girin. Sınav, Dilbilgisi, Dinleme, Okuma ve Yazma becerilerinizi ölçecektir. Yaklaşık 15-20 dakika sürecektir.
            </p>
            <button onClick={handleStartTest} className="bg-adai-primary text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Sınavı Başlat
            </button>
        </div>
    );
    
    const renderTesting = () => {
        if (!testContent || !currentSectionData) return null;
        const isLastSection = currentSectionIndex === SKILL_ORDER.length - 1;

        return (
            <div className="animate-fade-in">
                <div className="mb-6">
                    <div className="flex justify-between text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
                        <span>Bölüm {currentSectionIndex + 1} / {SKILL_ORDER.length}</span>
                        <span>{currentSectionData.title}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-adai-primary h-2.5 rounded-full" style={{ width: `${((currentSectionIndex + 1) / SKILL_ORDER.length) * 100}%` }}></div>
                    </div>
                </div>

                {currentSectionData.script && (
                     <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-6">
                        <button onClick={() => handlePlayAudio(currentSectionData.script!)} className="text-3xl p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-adai-primary hover:bg-slate-300 transition-colors">
                           {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
                        </button>
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                            {isSpeaking ? 'Metin okunuyor...' : 'Dinleme metnini çalmak için butona tıklayın.'}
                        </p>
                    </div>
                )}
                 {currentSectionData.passage && (
                     <div className="mb-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-md max-h-60 overflow-y-auto">
                        <h4 className="font-semibold text-adai-primary mb-2">Okuma Parçası</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{currentSectionData.passage}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {currentSectionData.questions?.map((q, i) => (
                        <div key={i}>
                            <p className="font-semibold mb-2 text-slate-800 dark:text-slate-200">{i + 1}. {q.question}</p>
                            <div className="space-y-2">
                                {q.options.map((opt, j) => (
                                    <label key={j} className={`block p-3 rounded-lg border-2 cursor-pointer transition-colors ${userAnswers[currentSectionKey][i] === opt ? 'border-adai-primary bg-adai-primary/10' : 'border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                        <input type="radio" name={`q-${i}`} value={opt} checked={userAnswers[currentSectionKey][i] === opt} onChange={() => handleAnswerChange(currentSectionKey, i, opt)} className="sr-only" />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    {currentSectionData.writingPrompt && (
                        <div>
                             <p className="font-semibold mb-2 text-slate-800 dark:text-slate-200">{currentSectionData.writingPrompt}</p>
                             <textarea 
                                value={userAnswers.writing}
                                onChange={(e) => handleWritingChange(e.target.value)}
                                placeholder="Write your response here (around 50-100 words)..."
                                className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-8">
                    <button onClick={() => setCurrentSectionIndex(i => i - 1)} disabled={currentSectionIndex === 0} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg disabled:opacity-50">Geri</button>
                    {isLastSection ? (
                        <button onClick={handleSubmitTest} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Değerlendirme için Gönder</button>
                    ) : (
                        <button onClick={() => setCurrentSectionIndex(i => i + 1)} className="px-6 py-2 bg-adai-primary text-white font-bold rounded-lg">İleri</button>
                    )}
                </div>
            </div>
        );
    };
    
    const renderResults = () => {
        if (!report) return null;
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Seviye Tespit Sonucun</h2>
                    <p className="text-7xl font-bold text-adai-primary my-4">{report.overallCefrLevel}</p>
                    <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400">{report.detailedFeedback}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="flex justify-center">
                        <RadarChart report={report} />
                    </div>
                    <div className="space-y-4">
                        {report.skillReports.map(skillReport => (
                            <div key={skillReport.skill} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{skillReport.skill}</h4>
                                    <span className="font-bold text-adai-primary px-2 py-1 bg-adai-primary/10 rounded-full text-sm">{skillReport.cefrLevel}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{skillReport.feedback}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-4">
                     <button onClick={handleRetakeTest} className="bg-adai-secondary text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        Sınavı Yeniden Çöz
                    </button>
                </div>
            </div>
        );
    };

    const renderLoading = (message: string) => (
         <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-50">{message}</h2>
            <Loader />
        </div>
    );

    const renderContent = () => {
        switch(testState) {
            case 'intro': return renderIntro();
            case 'generating': return renderLoading('Kişiselleştirilmiş sınavınız oluşturuluyor...');
            case 'testing': return renderTesting();
            case 'analyzing': return renderLoading('Sonuçlarınız yapay zeka tarafından değerlendiriliyor...');
            case 'results': return renderResults();
            default: return renderIntro();
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <ErrorMessage message={error} />
                {renderContent()}
            </div>
        </div>
    );
};

export default PlacementTest;
