import React from 'react';
import { MockExamResultData } from '../types';

interface MockExamResultDisplayProps {
    result: MockExamResultData;
    onAskTutor: (context: string) => void;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}dk ${secs}sn`;
};

const MockExamResultDisplay: React.FC<MockExamResultDisplayProps> = ({ result, onAskTutor }) => {
    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-brand-primary mb-3">Sınav Sonucu</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Doğru Sayısı</p>
                        <p className="text-2xl font-bold text-green-600">{result.score}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Soru</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{result.totalQuestions}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Başarı</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{((result.score / result.totalQuestions) * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Süre</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{formatTime(result.timeTaken)}</p>
                    </div>
                </div>
            </div>

            {/* Performance by Type */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Konu Analizi</h3>
                <div className="space-y-3">
                    {Object.entries(result.performanceByType).map(([type, stats]) => (
                        <div key={type} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{type}</span>
                                <span className="text-slate-500 dark:text-slate-400">{stats.correct} / {stats.total}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${(stats.correct / stats.total) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Question Review */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Soru Detayları</h3>
                <div className="space-y-4">
                    {result.questions.map((q, index) => {
                        const userAnswer = result.userAnswers[q.questionNumber];
                        const isCorrect = userAnswer === q.correctAnswer;

                        return (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                                <p className="font-semibold text-slate-900 dark:text-slate-200 mb-2">
                                    <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{q.questionNumber}.</span> {q.questionText}
                                </p>
                                <div className="space-y-2 text-sm">
                                    {q.options.map(opt => {
                                        const isUserAnswer = opt.key === userAnswer;
                                        const isCorrectAnswer = opt.key === q.correctAnswer;
                                        let classes = "text-slate-600 dark:text-slate-400";
                                        if (isCorrectAnswer) classes = "font-bold text-green-700 dark:text-green-300";
                                        if (isUserAnswer && !isCorrect) classes = "font-bold text-red-700 dark:text-red-300 line-through";
                                        return (
                                            <p key={opt.key} className={classes}>
                                                {opt.key}) {opt.value}
                                                {isCorrectAnswer && ' (Doğru Cevap)'}
                                                {isUserAnswer && !isCorrect && ' (Senin Cevabın)'}
                                            </p>
                                        );
                                    })}
                                    {!userAnswer && <p className="text-slate-500 dark:text-slate-400 italic">Boş bırakıldı.</p>}
                                </div>
                                {!isCorrect && (
                                     <div className="mt-3 text-right">
                                        <button
                                            onClick={() => {
                                                const optionsText = q.options.map(opt => `${opt.key}) ${opt.value}`).join('\n');
                                                const context = `Merhaba Onur, deneme sınavındaki bu soruyu yanlış yaptım. Bana nedenini açıklayabilir misin?\n\n---SORU---\nSoru ${q.questionNumber}: ${q.questionText}\n\nSeçenekler:\n${optionsText}\n\n---CEVAPLARIM---\nBenim Cevabım: ${userAnswer || 'Boş'}\nDoğru Cevap: ${q.correctAnswer}`;
                                                onAskTutor(context);
                                            }}
                                            className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
                                        >
                                            Neden yanlış yaptığımı Onur'a sor
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MockExamResultDisplay;
