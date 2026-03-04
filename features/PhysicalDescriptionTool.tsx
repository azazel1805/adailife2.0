import React, { useState, useEffect } from 'react';
import { analyzeVisualDescription } from '../services/geminiService';
import { VisualDescriptionAnalysis } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const PEXELS_API_KEY = 'BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq';
const searchQueries = ['portrait', 'person face', 'man portrait', 'woman portrait', 'person smiling'];

const adjectives = {
    'Saç (Hair)': {
        'blonde': 'sarışın', 'brunette': 'esmer', 'redhead': 'kızıl saçlı', 'curly': 'kıvırcık', 'straight': 'düz', 'wavy': 'dalgalı', 'short': 'kısa', 'long': 'uzun', 'bald': 'kel'
    },
    'Gözler (Eyes)': {
        'blue': 'mavi', 'green': 'yeşil', 'brown': 'kahverengi', 'hazel': 'ela', 'big': 'büyük', 'small': 'küçük'
    },
    'Vücut Yapısı (Build)': {
        'slim': 'ince', 'thin': 'zayıf', 'plump': 'balık etli', 'muscular': 'kaslı', 'tall': 'uzun boylu', 'short': 'kısa boylu'
    },
    'Yaş (Age)': {
        'young': 'genç', 'middle-aged': 'orta yaşlı', 'elderly': 'yaşlı'
    },
    'Genel (General)': {
        'handsome': 'yakışıklı', 'beautiful': 'güzel', 'attractive': 'çekici', 'pale': 'solgun', 'tanned': 'bronzlaşmış', 'freckles': 'çiller', 'beard': 'sakal', 'mustache': 'bıyık'
    }
};

const PhysicalDescriptionTool: React.FC = () => {
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [description, setDescription] = useState('');
    const [analysis, setAnalysis] = useState<VisualDescriptionAnalysis | null>(null);

    const fetchImage = async () => {
        setIsLoadingImage(true);
        setError('');
        setAnalysis(null);
        setDescription('');
        try {
            const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
            const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=portrait`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            if (!response.ok) throw new Error(`Pexels API error: ${response.statusText}`);
            const data = await response.json();
            if (data.photos && data.photos.length > 0) {
                const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length)];
                setImageUrl(randomPhoto.src.large);
                setImageAlt(randomPhoto.alt || `A portrait of a person`);
            } else {
                throw new Error(`No images found for query: ${query}`);
            }
        } catch (e: any) {
            setError(e.message || 'Görsel yüklenirken bir hata oluştu.');
        } finally {
            setIsLoadingImage(false);
        }
    };

    useEffect(() => {
        fetchImage();
    }, []);

    const handleAnalyze = async () => {
        const sentenceCount = description.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        if (sentenceCount < 3) {
            setError('Lütfen kişiyi tanımlayan en az 3 cümle yazın.');
            return;
        }
        setIsLoadingAnalysis(true);
        setError('');
        setAnalysis(null);
        try {
            const resultText = await analyzeVisualDescription(description);
            const resultJson: VisualDescriptionAnalysis = JSON.parse(resultText);
            setAnalysis(resultJson);
        } catch (e: any) {
            setError(e.message || 'Aıklama analizi sırasında bir hata oluştu.');
        } finally {
            setIsLoadingAnalysis(false);
        }
    };
    
    const AnalysisDisplay = () => {
        if (!analysis) return null;
        return (
             <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-adai-primary">Analysis Results</h2>
                
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Overall Feedback</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md">{analysis.overallFeedback}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Descriptive Strengths</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md">{analysis.descriptiveStrengths}</p>
                </div>

                {analysis.improvementSuggestions?.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Improvement Suggestions 💡</h3>
                        <div className="space-y-4">
                            {analysis.improvementSuggestions.map((item, index) => (
                                <div key={index} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border-l-4 border-adai-secondary">
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.suggestion}</h4>
                                    <p className="text-md italic text-slate-700 dark:text-slate-300 my-2">"{item.example}"</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        <strong className="text-adai-secondary">Why:</strong> {item.explanation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {analysis.grammar?.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Grammar Corrections</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 rounded-l-lg">Error</th>
                                        <th scope="col" className="px-4 py-2">Correction</th>
                                        <th scope="col" className="px-4 py-2 rounded-r-lg">Explanation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analysis.grammar.map((item, index) => (
                                        <tr key={index} className="border-b border-slate-200 dark:border-slate-800">
                                            <td className="px-4 py-2 text-red-600 line-through">{item.error}</td>
                                            <td className="px-4 py-2 text-green-600 font-semibold">{item.correction}</td>
                                            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{item.explanation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">Fiziksel Betimleme 🧑‍🎨</h2>
                <p className="mb-4 text-slate-500 dark:text-slate-400">
                    Aşağıdaki kişinin nasıl göründüğünü İngilizce olarak tanımlayın. Yandaki kelime listesi size yardımcı olacaktır.
                </p>
                <button
                    onClick={fetchImage}
                    disabled={isLoadingImage || isLoadingAnalysis}
                    className="w-full bg-adai-secondary text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-slate-400"
                >
                    {isLoadingImage ? 'Yükleniyor...' : 'Yeni Kişi Getir'}
                </button>
            </div>
            
            <ErrorMessage message={error} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                         <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-50">What does he/she look like?</h3>
                         {isLoadingImage ? <div className="h-96 flex items-center justify-center"><Loader /></div> : (
                            <div className="w-full overflow-hidden rounded-lg shadow-md mb-6 bg-slate-100 flex items-center justify-center">
                                <img src={imageUrl} alt={imageAlt} className="w-full h-auto max-h-[600px] object-contain" />
                            </div>
                        )}
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the person in at least 3 sentences..."
                            className="w-full h-40 p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none"
                            disabled={isLoadingAnalysis}
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoadingAnalysis || description.trim().length === 0}
                            className="mt-4 w-full bg-adai-primary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-400 flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            {isLoadingAnalysis ? 'Analyzing...' : 'Analyze My Description'}
                        </button>
                     </div>
                     {isLoadingAnalysis && <Loader />}
                     {analysis && <AnalysisDisplay />}
                </div>
                <div className="lg:col-span-1">
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 lg:sticky top-6">
                         <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Yardımcı Sıfatlar</h3>
                         <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-3">
                             {Object.entries(adjectives).map(([category, words]) => (
                                 <div key={category}>
                                     <h4 className="font-semibold text-adai-primary border-b-2 border-adai-primary/20 pb-1 mb-2">{category}</h4>
                                     <ul className="text-sm">
                                        {Object.entries(words).map(([en, tr]) => (
                                            <li key={en} className="flex justify-between items-baseline py-1.5 border-b border-slate-100 dark:border-slate-800">
                                                <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">{en}</span>
                                                <span className="italic text-slate-500 dark:text-slate-400">{tr}</span>
                                            </li>
                                        ))}
                                     </ul>
                                 </div>
                             ))}
                         </div>
                     </div>
                </div>
            </div>

        </div>
    );
};

export default PhysicalDescriptionTool;
