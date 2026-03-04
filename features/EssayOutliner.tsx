import React, { useState } from 'react';
import { generateEssayOutline, writeFullEssayFromOutline } from '../services/geminiService';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { OutlineIcon } from '../components/icons/Icons';

type EssayType = 'Argumentative' | 'Expository' | 'Narrative' | 'Descriptive' | 'Compare and Contrast' | 'Cause and Effect' | 'Persuasive' | 'Process' | 'Problem-Solution';
const essayTypes: EssayType[] = ['Argumentative', 'Expository', 'Narrative', 'Descriptive', 'Compare and Contrast', 'Cause and Effect', 'Persuasive', 'Process', 'Problem-Solution'];


const EssayOutliner: React.FC = () => {
    const [essayType, setEssayType] = useState<EssayType | ''>('');
    const [topic, setTopic] = useState('');
    const [outline, setOutline] = useState<string | null>(null);
    const [fullEssay, setFullEssay] = useState<string | null>(null);
    const [isLoadingOutline, setIsLoadingOutline] = useState(false);
    const [isLoadingEssay, setIsLoadingEssay] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateOutline = async () => {
        if (!essayType || !topic.trim()) {
            setError('Please select an essay type and enter a topic.');
            return;
        }
        setIsLoadingOutline(true);
        setError('');
        setOutline(null);
        setFullEssay(null);

        try {
            const generatedOutline = await generateEssayOutline(essayType, topic);
            setOutline(generatedOutline);
        } catch (e: any) {
            setError(e.message || 'Failed to generate outline.');
        } finally {
            setIsLoadingOutline(false);
        }
    };

    const handleWriteFullEssay = async () => {
        if (!topic || !outline) return;

        setIsLoadingEssay(true);
        setError('');
        setFullEssay(null);

        try {
            const generatedEssay = await writeFullEssayFromOutline(topic, outline);
            setFullEssay(generatedEssay);
        } catch (e: any) {
            setError(e.message || 'Failed to write full essay.');
        } finally {
            setIsLoadingEssay(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50 flex items-center justify-center gap-3">
                        <OutlineIcon /> Essay Taslağı
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Kompozisyonunuz için yapılandırılmış bir taslak oluşturun, ardından yapay zekanın sizin için tam metni yazmasını sağlayın.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">1. Kompozisyon Türünü Seçin:</label>
                        <div className="flex flex-wrap gap-2">
                            {essayTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setEssayType(type)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                                        essayType === type ? 'bg-adai-primary text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">2. Konunuzu Girin:</label>
                        <input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Örn: 'The importance of renewable energy'"
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none"
                        />
                    </div>
                </div>
                
                <ErrorMessage message={error} />
                
                <button
                    onClick={handleGenerateOutline}
                    disabled={isLoadingOutline || isLoadingEssay || !essayType || !topic.trim()}
                    className="mt-6 w-full bg-adai-primary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-400 flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    {isLoadingOutline ? 'Taslak Oluşturuluyor...' : 'Taslak Oluştur'}
                </button>
            </div>

            {isLoadingOutline && <Loader />}
            
            {outline && (
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 animate-fade-in">
                    <h3 className="text-xl font-bold text-adai-primary mb-4">Oluşturulan Taslak</h3>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg prose dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm">{outline}</pre>
                    </div>

                    <button
                        onClick={handleWriteFullEssay}
                        disabled={isLoadingEssay}
                        className="mt-6 w-full bg-adai-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-400 flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        {isLoadingEssay ? 'Kompozisyon Yazılıyor...' : 'Tam Kompozisyonu Yaz'}
                    </button>
                </div>
            )}
            
            {isLoadingEssay && <Loader />}

            {fullEssay && (
                 <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 animate-fade-in">
                    <h3 className="text-xl font-bold text-green-600 mb-4">Tamamlanan Kompozisyon</h3>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg prose dark:prose-invert max-w-none text-base">
                         <p className="whitespace-pre-wrap">{fullEssay}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EssayOutliner;
