import React, { useState } from 'react';
import { getWritingTopic, analyzeWrittenText, improveParagraph } from '../services/geminiService';
import { WritingAnalysis, ParagraphImprovementResult } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { useChallenge } from '../context/ChallengeContext';


const WritingAssistant: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [text, setText] = useState('');
    const [isLoadingTopic, setIsLoadingTopic] = useState(false);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [error, setError] = useState('');
    const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
    const [paragraphs, setParagraphs] = useState<string[]>([]);
    const [improvements, setImprovements] = useState<{ [key: number]: ParagraphImprovementResult }>({});
    const [improvingIndex, setImprovingIndex] = useState<number | null>(null);
    const { trackAction } = useChallenge();


    const handleGetTopic = async () => {
        setIsLoadingTopic(true);
        setError('');
        setAnalysis(null);
        setText('');
        setParagraphs([]);
        setImprovements({});
        try {
            const newTopic = await getWritingTopic();
            setTopic(newTopic);
        } catch (e: any) {
            setError(e.message || 'Konu alınamadı.');
        } finally {
            setIsLoadingTopic(false);
        }
    };
    
    const handleAnalyze = async () => {
        if (!text.trim() || !topic) {
            setError('Lütfen önce bir konu seçin ve metninizi yazın.');
            return;
        }
        setIsLoadingAnalysis(true);
        setError('');
        setAnalysis(null);
        setParagraphs([]);
        setImprovements({});
        try {
            const resultText = await analyzeWrittenText(topic, text);
            const resultJson: WritingAnalysis = JSON.parse(resultText);
            setAnalysis(resultJson);
            setParagraphs(text.split('\n').filter(p => p.trim() !== ''));
            trackAction('writing');
        } catch (e: any) {
            setError(e.message || 'Metin analizi sırasında bir hata oluştu.');
        } finally {
            setIsLoadingAnalysis(false);
        }
    };

    const handleImproveParagraph = async (paragraph: string, index: number) => {
        setImprovingIndex(index);
        setError('');
        try {
            const resultText = await improveParagraph(paragraph);
            const resultJson: ParagraphImprovementResult = JSON.parse(resultText);
            setImprovements(prev => ({ ...prev, [index]: resultJson }));
        } catch (e: any) {
            setError(`Paragraf ${index + 1} için iyileştirme alınamadı: ${e.message}`);
        } finally {
            setImprovingIndex(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">Yazma Asistanı</h2>
                <p className="mb-4 text-slate-500 dark:text-slate-400">Yazma becerilerinizi geliştirmek için AI'dan geri bildirim alın.</p>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">Adım 1: Kompozisyon Konusu Alın</h3>
                    <button
                        onClick={handleGetTopic}
                        disabled={isLoadingTopic || isLoadingAnalysis}
                        className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-400 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        {isLoadingTopic ? 'Konu Getiriliyor...' : 'Yeni Konu Getir'}
                    </button>
                    {topic && !isLoadingTopic && (
                        <div className="mt-4 bg-slate-200 dark:bg-slate-700 p-3 rounded-lg">
                            <p className="text-slate-800 dark:text-slate-200"><strong className="text-brand-primary">Konu:</strong> {topic}</p>
                        </div>
                    )}
                </div>
            </div>

            {topic && (
                 <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">Adım 2: Metninizi Yazın</h3>
                     <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Metninizi buraya yazın..."
                        className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-slate-800 dark:text-slate-200 resize-y transition-colors"
                        disabled={isLoadingAnalysis}
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoadingAnalysis || !text.trim()}
                        className="mt-4 w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-400 flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        {isLoadingAnalysis ? 'Analiz Ediliyor...' : 'Metni Analiz Et'}
                    </button>
                 </div>
            )}
            
            {(isLoadingTopic || isLoadingAnalysis) && <Loader />}
            <ErrorMessage message={error} />
            
            {analysis && (
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 space-y-6">
                    <h2 className="text-xl font-bold text-brand-primary">Analiz Sonuçları</h2>
                    
                    {/* Interactive Paragraph Improver */}
                    {paragraphs.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Paragraf İyileştirici</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Her paragrafı ayrı ayrı analiz edip daha iyi bir versiyonunu görebilirsiniz.</p>
                            <div className="space-y-4">
                                {paragraphs.map((p, index) => (
                                    <div key={index} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{p}"</p>
                                        <button
                                            onClick={() => handleImproveParagraph(p, index)}
                                            disabled={improvingIndex === index}
                                            className="mt-3 text-sm bg-brand-secondary hover:bg-brand-primary text-white font-semibold py-1 px-3 rounded-lg transition-all duration-200 disabled:bg-slate-400 shadow-sm hover:shadow-md hover:-translate-y-px"
                                        >
                                            {improvingIndex === index ? 'İyileştiriliyor...' : 'Bu Paragrafı İyileştir'}
                                        </button>
                                        {improvements[index] && (
                                            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h5 className="font-bold text-sm text-red-600">Orijinal Versiyon</h5>
                                                        <p className="text-xs mt-1 bg-red-100 dark:bg-red-900/20 p-2 rounded">{improvements[index].originalParagraph}</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-sm text-green-600">İyileştirilmiş Versiyon</h5>
                                                        <p className="text-xs mt-1 bg-green-100 dark:bg-green-900/20 p-2 rounded">{improvements[index].improvedParagraph}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <h5 className="font-bold text-sm text-slate-600 dark:text-slate-400">Yapılan Değişiklikler</h5>
                                                    <ul className="list-disc list-inside space-y-1 text-xs mt-1 text-slate-600 dark:text-slate-400">
                                                        {improvements[index].explanation.map((exp, i) => (
                                                            <li key={i}><strong>{exp.change}:</strong> {exp.reason}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Overall Feedback */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Genel Değerlendirme</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md">{analysis.overallFeedback}</p>
                    </div>

                    {/* Structure and Cohesion */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Yapı ve Tutarlılık</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md">{analysis.structureAndCohesion}</p>
                    </div>
                    
                    {/* Grammar Feedback */}
                    {analysis.grammar && analysis.grammar.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Gramer Düzeltmeleri</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase">
                                        <tr>
                                            <th scope="col" className="px-4 py-2 rounded-l-lg">Hata</th>
                                            <th scope="col" className="px-4 py-2">Düzeltme</th>
                                            <th scope="col" className="px-4 py-2 rounded-r-lg">Açıklama</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysis.grammar.map((item, index) => (
                                            <tr key={index} className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                                <td className="px-4 py-2 text-red-600 line-through">{item.error}</td>
                                                <td className="px-4 py-2 text-green-600 font-semibold">{item.correction}</td>
                                                <td className="px-4 py-2">{item.explanation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Vocabulary Suggestions */}
                    {analysis.vocabulary && analysis.vocabulary.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Kelime Önerileri</h3>
                             <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase">
                                        <tr>
                                            <th scope="col" className="px-4 py-2 rounded-l-lg">Orijinal Kelime</th>
                                            <th scope="col" className="px-4 py-2">Öneri</th>
                                            <th scope="col" className="px-4 py-2 rounded-r-lg">Neden</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysis.vocabulary.map((item, index) => (
                                            <tr key={index} className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                                <td className="px-4 py-2 text-yellow-600">{item.original}</td>
                                                <td className="px-4 py-2 text-teal-600 font-semibold">{item.suggestion}</td>
                                                <td className="px-4 py-2">{item.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default WritingAssistant;