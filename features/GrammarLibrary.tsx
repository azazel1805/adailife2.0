import React, { useState, useEffect } from 'react';
import { getGrammarTopicDetails, checkUserGrammarSentence } from '../services/geminiService';
import { GrammarTopicDetails, InteractiveExample, MiniTestQuestion, GrammarSentenceFeedback } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { GrammarLibraryIcon, TutorIcon } from '../components/icons/Icons';
import { useExamHistory } from '../context/ExamHistoryContext';

interface GrammarLibraryProps {
    onAskTutor: (context: string) => void;
}

const grammarTopics = {
    "Başlangıç (A1-A2)": ["Present Simple", "Present Continuous", "Past Simple", "Future Tenses (will vs. going to)", "Frequency Adverbs", "Articles (a, an, the)", "Prepositions of Place", "Verb 'to be'", "Quantifiers", "Comparatives", "Superlatives", "Modals (can, must, have to, should)", "Adverbs of Manner"],
    "Orta (B1-B2)": ["Present Perfect", "Present Perfect Continuous", "Past Continuous", "Used To", "Conditionals (Type 1 & 2)", "Relative Clauses (defining)", "Passive Voice (Simple Tenses)", "Gerunds and Infinitives", "Reported Speech"],
    "İleri (C1-C2)": [ "Past Perfect", "Future Perfect", "Causatives", "Conditionals (Type 3 & Mixed)", "Advanced Modals (might have, should have)", "Reported Speech", "Subjunctive Mood"]
};

const InteractiveSentence: React.FC<{ example: InteractiveExample }> = ({ example }) => {
    const parts = example.sentence.split(new RegExp(`(${example.interactivePart})`, 'gi'));
    return (
        <p className="text-lg text-slate-700 dark:text-slate-300">
            {parts.map((part, index) =>
                part.toLowerCase() === example.interactivePart.toLowerCase() ? (
                    <span key={index} className="relative group">
                        <span className="font-bold text-adai-primary bg-adai-primary/10 px-1 rounded-md cursor-pointer">
                            {part}
                        </span>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            {example.explanation}
                            <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                        </span>
                    </span>
                ) : (
                    part
                )
            )}
        </p>
    );
};

const GrammarLibrary: React.FC<GrammarLibraryProps> = ({ onAskTutor }) => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [topicDetails, setTopicDetails] = useState<GrammarTopicDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Mini Test State
    const [miniTestAnswers, setMiniTestAnswers] = useState<{ [key: number]: string }>({});
    const [showMiniTestResults, setShowMiniTestResults] = useState(false);
    const { trackSingleQuestionResult } = useExamHistory();

    // Try it Yourself State
    const [userSentence, setUserSentence] = useState('');
    const [sentenceFeedback, setSentenceFeedback] = useState<GrammarSentenceFeedback | null>(null);
    const [isCheckingSentence, setIsCheckingSentence] = useState(false);

    useEffect(() => {
        if (selectedTopic) {
            const fetchDetails = async () => {
                setIsLoading(true);
                setError('');
                setTopicDetails(null);
                // Reset sub-component states
                setMiniTestAnswers({});
                setShowMiniTestResults(false);
                setUserSentence('');
                setSentenceFeedback(null);
                
                try {
                    const resultText = await getGrammarTopicDetails(selectedTopic);
                    const resultJson: GrammarTopicDetails = JSON.parse(resultText);
                    setTopicDetails(resultJson);
                } catch (e: any) {
                    setError(e.message || 'Konu yüklenirken bir hata oluştu.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetails();
        }
    }, [selectedTopic]);
    
    const handleCheckMiniTest = () => {
        if (!topicDetails) return;

        topicDetails.miniTest.forEach((q, i) => {
            const userAnswer = miniTestAnswers[i];
            const isCorrect = userAnswer === q.correctAnswer;
            trackSingleQuestionResult('Gramer Kütüphanesi', isCorrect);
        });

        setShowMiniTestResults(true);
    };

    const handleCheckSentence = async () => {
        if (!userSentence.trim() || !selectedTopic) return;
        setIsCheckingSentence(true);
        setSentenceFeedback(null);
        setError('');
        try {
            const resultText = await checkUserGrammarSentence(userSentence, selectedTopic);
            const resultJson: GrammarSentenceFeedback = JSON.parse(resultText);
            setSentenceFeedback(resultJson);
        } catch(e: any) {
            setError(e.message || 'Cümle kontrol edilirken bir hata oluştu.');
        } finally {
            setIsCheckingSentence(false);
        }
    };

    if (selectedTopic && (isLoading || topicDetails)) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                 <button onClick={() => setSelectedTopic(null)} className="text-sm font-semibold text-adai-primary hover:underline mb-4">&larr; Tüm Konulara Geri Dön</button>
                 {isLoading && <Loader />}
                 <ErrorMessage message={error} />
                 {topicDetails && (
                    <div className="space-y-8 animate-fade-in">
                        {/* 1. Explanation */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                            <h2 className="text-3xl font-bold text-adai-primary mb-2 text-center">{topicDetails.topicName}</h2>
                            <p className="text-slate-600 dark:text-slate-300 text-center italic">{topicDetails.simpleExplanation}</p>
                        </div>
                        
                        {/* 2. Interactive Examples */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Etkileşimli Örnekler 💡</h3>
                             <div className="space-y-4">
                                {topicDetails.interactiveExamples.map((ex, i) => <InteractiveSentence key={i} example={ex} />)}
                             </div>
                        </div>

                        {/* 3. Mini Test */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Anladım mı? Testi 🤔</h3>
                             <div className="space-y-6">
                                {topicDetails.miniTest.map((q, i) => {
                                    const userAnswer = miniTestAnswers[i];
                                    const isCorrect = userAnswer === q.correctAnswer;
                                    return (
                                        <div key={i}>
                                            <p className="font-semibold mb-2">{i+1}. {q.question}</p>
                                            <div className="space-y-2">
                                                {q.options.map((opt, j) => {
                                                    const isSelected = userAnswer === opt;
                                                    const isCorrectOption = q.correctAnswer === opt;
                                                    let stateClass = "border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700";
                                                    if (showMiniTestResults) {
                                                        if (isCorrectOption) stateClass = "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
                                                        else if (isSelected) stateClass = "border-red-500 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
                                                    } else if (isSelected) {
                                                        stateClass = "border-adai-primary bg-adai-primary/10";
                                                    }
                                                    return (
                                                        <label key={j} className={`block p-3 rounded-lg border-2 cursor-pointer transition-colors ${stateClass}`}>
                                                            <input type="radio" name={`q-${i}`} value={opt} checked={isSelected} onChange={() => setMiniTestAnswers(prev => ({...prev, [i]: opt}))} disabled={showMiniTestResults} className="sr-only" />
                                                            {opt}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                             </div>
                             {!showMiniTestResults && <button onClick={handleCheckMiniTest} className="mt-6 w-full bg-adai-secondary text-white font-bold py-2 rounded-lg">Cevapları Kontrol Et</button>}
                        </div>

                        {/* 4. Try it Yourself */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Kendin Dene ✍️</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Bu kuralla kendi cümleni yaz ve anında geri bildirim al.</p>
                            <div className="flex gap-2">
                                <input type="text" value={userSentence} onChange={e => setUserSentence(e.target.value)} placeholder="Your sentence..." className="flex-grow p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none"/>
                                <button onClick={handleCheckSentence} disabled={isCheckingSentence || !userSentence.trim()} className="px-6 bg-adai-primary text-white font-bold rounded-lg disabled:bg-slate-400">{isCheckingSentence ? '...' : 'Kontrol Et'}</button>
                            </div>
                            {sentenceFeedback && (
                                <div className={`mt-4 p-3 rounded-lg text-sm ${sentenceFeedback.isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                    {sentenceFeedback.isCorrect ? '✅ ' : '🤔 '}
                                    {sentenceFeedback.feedback}
                                </div>
                            )}
                        </div>
                        
                        {/* 5. Ask Tutor */}
                        <div className="text-center">
                             <button
                                onClick={() => onAskTutor(`Merhaba Onur, "${topicDetails.topicName}" konusuyla ilgili bir sorum var...`)}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                            >
                                <TutorIcon />
                                Bu konuda daha fazla yardım iste
                            </button>
                        </div>
                    </div>
                 )}
            </div>
        );
    }
    
    // Main Topic Selection View
    return (
        <div className="max-w-6xl mx-auto space-y-6">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 text-center">
                <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50">Gramer Kütüphanesi 🏛️</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    İngilizce dilbilgisinin temellerinden ileri düzey konularına kadar her şeyi interaktif derslerle öğrenin. Başlamak için bir konu seçin.
                </p>
            </div>
            <div className="space-y-8">
                {Object.entries(grammarTopics).map(([level, topics]) => (
                    <div key={level}>
                        <h3 className="text-xl font-bold text-adai-primary mb-3">{level}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {topics.map(topic => (
                                <button key={topic} onClick={() => setSelectedTopic(topic)} className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-md border-2 border-slate-200 dark:border-slate-800 text-left font-semibold text-slate-700 dark:text-slate-300 hover:border-adai-primary hover:text-adai-primary transition-colors">
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GrammarLibrary;
