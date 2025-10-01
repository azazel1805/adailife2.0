import React, { useState, useEffect } from 'react';
import { getAffixOfTheDay } from '../services/geminiService';
import { AffixData } from '../types';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import { AffixIcon } from './icons/Icons';

const AffixOfTheDayWidget: React.FC = () => {
    const [data, setData] = useState<AffixData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAffix = async () => {
            setIsLoading(true);
            setError('');
            try {
                const today = new Date().toISOString().split('T')[0];
                const cachedData = localStorage.getItem('affixOfTheDay');
                if (cachedData) {
                    const { date, affix } = JSON.parse(cachedData);
                    if (date === today) {
                        setData(affix);
                        return;
                    }
                }
                const resultText = await getAffixOfTheDay();
                const resultJson: AffixData = JSON.parse(resultText);
                setData(resultJson);
                localStorage.setItem('affixOfTheDay', JSON.stringify({ date: today, affix: resultJson }));
            } catch (e: any) {
                setError("Günün Eki alınamadı.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAffix();
    }, []);
    
    const HighlightedAffix: React.FC<{ word: string; affix: string, type: 'Prefix' | 'Suffix' }> = ({ word, affix, type }) => {
        const cleanAffix = affix.replace('-', '');
        if (type === 'Prefix' && word.toLowerCase().startsWith(cleanAffix.toLowerCase())) {
            return (
                <>
                    <span className="font-bold text-adai-primary">{word.substring(0, cleanAffix.length)}</span>
                    {word.substring(cleanAffix.length)}
                </>
            );
        }
        if (type === 'Suffix' && word.toLowerCase().endsWith(cleanAffix.toLowerCase())) {
            return (
                <>
                    {word.substring(0, word.length - cleanAffix.length)}
                    <span className="font-bold text-adai-primary">{word.substring(word.length - cleanAffix.length)}</span>
                </>
            );
        }
        return <>{word}</>;
    };


    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <AffixIcon />
                <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50">Günün Eki (Prefix/Suffix)</h3>
            </div>
            {isLoading && <Loader />}
            <ErrorMessage message={error} />
            {data && (
                <div className="space-y-3 flex-grow flex flex-col justify-center">
                    <div>
                        <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-1 ${data.type === 'Prefix' ? 'bg-blue-200 text-blue-800' : 'bg-purple-200 text-purple-800'}`}>
                            {data.type}
                        </span>
                        <h4 className="text-2xl font-bold text-adai-primary">{data.affix}</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-400 italic">Anlamı: {data.meaning}</p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        {data.examples.map((ex, i) => (
                             <div key={i} className="bg-slate-100 dark:bg-slate-700 p-2 rounded-md text-sm">
                                <p className="text-slate-950 dark:text-slate-50 font-semibold">
                                    <HighlightedAffix word={ex.word} affix={data.affix} type={data.type} />
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                                    {ex.definition}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AffixOfTheDayWidget;