import React, { useState, useEffect } from 'react';
import { tensesData, TenseData } from '../data/tensesData';
import Loader from '../components/Loader';
import { SpeakerIcon } from '../components/icons/Icons';

const PEXELS_API_KEY = 'BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq';

const Tenses: React.FC = () => {
    const [activeTense, setActiveTense] = useState<TenseData>(tensesData[0]);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);

    useEffect(() => {
        const fetchImage = async () => {
            if (!activeTense.pexelsQuery) {
                setImageUrl('');
                return;
            }
            setIsLoadingImage(true);
            try {
                const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(activeTense.pexelsQuery)}&per_page=1&orientation=landscape`, {
                    headers: { Authorization: PEXELS_API_KEY }
                });
                if (!response.ok) throw new Error('Pexels API error');
                const data = await response.json();
                if (data.photos && data.photos.length > 0) {
                    setImageUrl(data.photos[0].src.large2x);
                } else {
                    setImageUrl(''); // No image found
                }
            } catch (error) {
                console.error("Error fetching Pexels image:", error);
                setImageUrl('');
            } finally {
                setIsLoadingImage(false);
            }
        };

        fetchImage();
    }, [activeTense]);

    const speak = (text: string) => {
        if (typeof window.speechSynthesis === 'undefined') return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const TenseDetail: React.FC<{ tense: TenseData }> = ({ tense }) => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <h3 className="text-4xl font-bold text-adai-primary">{tense.name} <span className="text-3xl">{tense.emoji}</span></h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">{tense.explanation}</p>
            </div>
            
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                {isLoadingImage ? <Loader /> : imageUrl ? <img src={imageUrl} alt={tense.pexelsQuery} className="w-full h-full object-cover" /> : <p className="text-slate-500">Görsel bulunamadı.</p>}
            </div>

            <div>
                <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Kullanım Alanları</h4>
                <ul className="space-y-2">
                    {tense.usage.map((use, i) => (
                        <li key={i} className="flex items-start">
                             <span className="text-adai-primary mr-2 mt-1">✓</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">{use}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Formüller</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg"><span className="font-bold text-green-700 dark:text-green-300">(+)</span> <p className="text-sm font-mono mt-1">{tense.formula.positive}</p></div>
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg"><span className="font-bold text-red-700 dark:text-red-300">(-)</span> <p className="text-sm font-mono mt-1">{tense.formula.negative}</p></div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg"><span className="font-bold text-blue-700 dark:text-blue-300">(?)</span> <p className="text-sm font-mono mt-1">{tense.formula.question}</p></div>
                </div>
            </div>

            <div>
                <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Örnek Cümleler</h4>
                <div className="space-y-3">
                    <Example sentence={tense.examples.positive} type="(+)" />
                    <Example sentence={tense.examples.negative} type="(-)" />
                    <Example sentence={tense.examples.question} type="(?) " />
                </div>
            </div>
        </div>
    );
    
    const Example: React.FC<{ sentence: { en: string, tr: string }, type: string }> = ({ sentence, type }) => (
        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg flex items-start">
            <span className="font-bold text-slate-500 dark:text-slate-400 mr-3">{type}</span>
            <div className="flex-grow">
                <p className="text-slate-800 dark:text-slate-200">{sentence.en}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">{sentence.tr}</p>
            </div>
            <button onClick={() => speak(sentence.en)} className="text-xl p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 ml-2"><SpeakerIcon /></button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 mb-6">
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">Zamanlar (Tenses) Rehberi 🕒</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    İngilizcedeki 12 temel zamanı formülleri, kullanım alanları ve örnekleriyle keşfedin.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 h-fit md:sticky top-24">
                    <nav className="space-y-1">
                        {tensesData.map(tense => (
                            <button key={tense.id} onClick={() => setActiveTense(tense)}
                                className={`w-full text-left px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTense.id === tense.id ? 'bg-adai-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                {tense.name}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="md:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 min-h-[80vh]">
                    <TenseDetail tense={activeTense} />
                </div>
            </div>
        </div>
    );
};

export default Tenses;
