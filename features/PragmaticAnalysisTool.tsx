import React, { useState } from 'react';
import { analyzePragmatics } from '../services/geminiService';
import { PragmaticAnalysisResult } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const PragmaticAnalysisTool: React.FC = () => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<PragmaticAnalysisResult | null>(null);

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError('Analiz etmek için lütfen bir metin girin.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const resultText = await analyzePragmatics(text);
            const resultJson: PragmaticAnalysisResult = JSON.parse(resultText);
            setResult(resultJson);
        } catch (e: any) {
            setError(e.message || 'An error occurred during pragmatic analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-lg font-bold text-brand-primary">{value}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-200">Pragmatik Analiz Aracı ⚖️</h2>
                <p className="mb-4 text-slate-500 dark:text-slate-400">
                    Bir metnin sadece ne söylediğini değil, nasıl söylediğini de analiz edin. Metnin tonunu, amacını, resmiyet düzeyini ve farklı bağlamlarda nasıl ifade edilebileceğini öğrenin.
                </p>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Analiz edilecek İngilizce metni buraya yapıştırın. (e.g., 'Hey, I need that report ASAP.')..."
                    className="w-full h-32 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none text-slate-900 dark:text-slate-200 resize-y"
                    disabled={isLoading}
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="mt-4 w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? 'Analiz yapılıyor...' : 'Metin analizi yap'}
                </button>
            </div>

            {isLoading && <Loader />}
            <ErrorMessage message={error} />

            {result && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg space-y-6 animate-fade-in">
                    <div>
                        <h3 className="text-xl font-bold text-brand-primary mb-3">Pragmatik Analiz</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <InfoCard label="Formality" value={result.formality} />
                            <InfoCard label="Tone" value={result.tone} />
                            <InfoCard label="Intent" value={result.intent} />
                            <InfoCard label="Audience" value={result.audience} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-brand-primary mb-3">Farklı İfadeler</h3>
                        <div className="space-y-4">
                            {result.alternatives.map((alt, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border-l-4 border-brand-secondary">
                                    <h4 className="font-bold text-slate-900 dark:text-slate-200">{alt.type}</h4>
                                    <p className="text-lg italic text-slate-900 dark:text-slate-200 my-2">"{alt.text}"</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        <strong className="text-brand-secondary">Reason:</strong> {alt.explanation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PragmaticAnalysisTool;
