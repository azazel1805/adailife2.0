
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { extractExamFromPDF } from '../services/geminiService';
import { MockExamQuestion, MockExamResultData } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { useExamHistory } from '../context/ExamHistoryContext';
import { usePdfExam } from '../context/PdfExamContext';

type ImporterState = 'idle' | 'processing' | 'quiz' | 'finished';
const EXAM_DURATION_MINUTES = 90; // Default duration for imported exams

interface PDFImporterProps {
    onExamFinish: (result: MockExamResultData) => void;
    onAskTutor: (context: string) => void;
}

const PDFImporter: React.FC<PDFImporterProps> = ({ onExamFinish, onAskTutor }) => {
    const [importerState, setImporterState] = useState<ImporterState>('idle');
    const [error, setError] = useState('');
    const [processingMessage, setProcessingMessage] = useState('');
    
    const { addExamResult } = useExamHistory();
    const { examState, startExam, updateAnswer, setTime, endExam } = usePdfExam();
    const { questions, userAnswers, timeLeft, isActive } = examState;

    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // If there's an active exam in context, switch to quiz view
    useEffect(() => {
        if (isActive) {
            setImporterState('quiz');
        } else {
            setImporterState('idle');
        }
    }, [isActive]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setImporterState('processing');
        setError('');
        setProcessingMessage('PDF yükleniyor ve analiz için hazırlanıyor...');

        try {
            const resultText = await extractExamFromPDF(file);
            setProcessingMessage('Sorular ayrıştırılıyor...');
            const resultJson = JSON.parse(resultText);

            if (!resultJson.questions || resultJson.questions.length === 0) {
                throw new Error("PDF'den geçerli soru ayrıştırılamadı. Lütfen dosya formatını kontrol edin.");
            }

            const sortedQuestions = resultJson.questions.sort((a: MockExamQuestion, b: MockExamQuestion) => a.questionNumber - b.questionNumber);
            
            questionRefs.current = Array(sortedQuestions.length).fill(null);
            
            // Start the exam using context
            startExam(sortedQuestions, EXAM_DURATION_MINUTES * 60);

        } catch (e: any) {
            setError(e.message || "PDF işlenirken bir hata oluştu.");
            setImporterState('idle');
        }
    };

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    const handleSubmit = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        setImporterState('finished');

        let score = 0;
        const performanceByType: MockExamResultData['performanceByType'] = {};

        questions.forEach(q => {
            const type = q.questionType || 'Bilinmeyen Tip';
            if (!performanceByType[type]) {
                performanceByType[type] = { correct: 0, total: 0 };
            }
            performanceByType[type].total += 1;

            if (userAnswers[q.questionNumber] === q.correctAnswer) {
                score += 1;
                performanceByType[type].correct += 1;
            }
        });

        const resultData: MockExamResultData = {
            id: new Date().toISOString(),
            timestamp: new Date().toLocaleString('tr-TR'),
            questions,
            userAnswers,
            timeTaken: (EXAM_DURATION_MINUTES * 60) - timeLeft,
            score,
            totalQuestions: questions.length,
            performanceByType,
        };

        addExamResult(resultData);
        onExamFinish(resultData);
        endExam(); // Clear the exam from context

    }, [questions, userAnswers, timeLeft, addExamResult, onExamFinish, endExam]);

     useEffect(() => {
        if (importerState === 'quiz' && isActive) {
            timerIntervalRef.current = setInterval(() => {
                setTime(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timerIntervalRef.current!);
                        handleSubmit();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else if (timerIntervalRef.current) {
             clearInterval(timerIntervalRef.current);
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [importerState, isActive, handleSubmit, setTime]);

    const handleAnswerChange = (questionNumber: number, answer: string) => {
        updateAnswer(questionNumber, answer);
    };

    const scrollToQuestion = (index: number) => {
        questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0];
        if (file && file.type === 'application/pdf') {
            processFile(file);
        } else {
            setError('Lütfen sadece PDF formatında bir dosya yükleyin.');
        }
    };

    if (importerState === 'idle') {
        return (
            <div className="max-w-3xl mx-auto text-center bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <h2 className="text-3xl font-bold text-brand-primary mb-4">PDF Sınav Yükleyici</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Elinizdeki deneme sınavı PDF'lerini yükleyerek interaktif bir sınava dönüştürün. Yapay zeka, soruları ve cevap anahtarını sizin için otomatik olarak ayrıştıracaktır.
                </p>
                <div
                    className="mt-4 p-10 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-brand-primary hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center">
                         <span className="text-5xl">📄</span>
                        <p className="mt-2 text-slate-900 dark:text-slate-200 font-semibold">PDF Dosyasını Buraya Sürükleyin veya Tıklayın</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maks. dosya boyutu: 10MB</p>
                    </div>
                </div>
                <ErrorMessage message={error} />
            </div>
        );
    }

    if (importerState === 'processing') {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-4">Sınav Hazırlanıyor...</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{processingMessage}</p>
                <Loader />
            </div>
        );
    }

    // Quiz in Progress
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 order-2 lg:order-1">
                {questions.map((q, index) => {
                    const prevQuestion = index > 0 ? questions[index - 1] : null;
                    const showPassage = q.passage && q.passage !== prevQuestion?.passage;

                    return (
                        <div key={q.questionNumber} ref={el => { questionRefs.current[index] = el; }} className="mb-8 p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg scroll-mt-20 border-2 border-slate-200 dark:border-slate-800">
                           {showPassage && (
                                <div className="mb-6 bg-gray-100 dark:bg-slate-800 p-4 rounded-md">
                                    <h4 className="font-semibold text-brand-primary mb-2">Okuma Parçası</h4>
                                    <p className="text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{q.passage}</p>
                                </div>
                            )}

                            <p className="font-semibold text-slate-900 dark:text-slate-200 mb-4">
                                <span className="text-brand-primary">{q.questionNumber}.</span> {q.questionText}
                            </p>
                            <div className="space-y-3">
                                {q.options.map(opt => {
                                    const isSelected = userAnswers[q.questionNumber] === opt.key;
                                    return (
                                        <label key={opt.key} className={`flex items-center p-3 rounded-md transition-all duration-200 border-2 ${isSelected ? 'border-brand-primary bg-brand-secondary/10' : 'border-transparent bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'} cursor-pointer`}>
                                            <input
                                                type="radio"
                                                name={`question-${q.questionNumber}`}
                                                value={opt.key}
                                                checked={isSelected}
                                                onChange={() => handleAnswerChange(q.questionNumber, opt.key)}
                                                className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 focus:ring-brand-primary ring-offset-bg-secondary hidden"
                                            />
                                            <span className="font-bold mr-3 text-brand-primary">{opt.key})</span>
                                            <span className="dark:text-slate-300">{opt.value}</span>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-slate-700 text-right">
                                <button
                                    onClick={() => {
                                        const optionsText = q.options.map(opt => `${opt.key}) ${opt.value}`).join('\n');
                                        const context = `Lütfen aşağıdaki soru hakkında yardımcı ol:\n\nSoru ${q.questionNumber}: ${q.questionText}\n\nSeçenekler:\n${optionsText}\n\nKullanıcının Seçtiği Cevap: ${userAnswers[q.questionNumber] || 'Henüz cevaplanmadı.'}`;
                                        onAskTutor(context);
                                    }}
                                    className="text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors py-1 px-3 rounded-md hover:bg-brand-secondary/10"
                                >
                                    🎓 Bu Soruya Yardım İste
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <aside className="lg:col-span-1 order-1 lg:order-2 lg:sticky top-20 h-fit">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border-2 border-slate-200 dark:border-slate-800">
                    <div className="text-center border-b border-gray-200 dark:border-slate-700 pb-4 mb-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Kalan Süre</p>
                        <p className={`text-4xl font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-slate-200'}`}>{formatTime(timeLeft)}</p>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-200 mb-3 text-center">Sorular ({questions.length})</h4>
                    <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                        {questions.map((q, index) => (
                            <button
                                key={q.questionNumber}
                                onClick={() => scrollToQuestion(index)}
                                className={`w-full aspect-square text-sm font-bold rounded-md transition-colors ${userAnswers[q.questionNumber] ? 'bg-brand-primary text-white' : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                            >
                                {q.questionNumber}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleSubmit} className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition duration-300">
                        Sınavı Bitir
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default PDFImporter;
