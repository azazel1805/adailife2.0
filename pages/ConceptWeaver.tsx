import React, { useState, useMemo } from 'react';
import { generateConceptWeaverWords, analyzeConceptWeaverStory } from '../services/geminiService';
import { ConceptWeaverAnalysis } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { ConceptWeaverIcon } from '../components/icons/Icons';

type GameState = 'setup' | 'playing' | 'analyzing' | 'results';

interface ConceptWord {
    word: string;
    meaning: string;
}

const StoryDisplay: React.FC<{ story: string; words: ConceptWord[] }> = ({ story, words }) => {
    const storyParts = useMemo(() => {
        if (!words || words.length === 0) {
            return [{ type: 'text', content: story }];
        }
        const wordMap = new Map(words.map(item => [item.word.toLowerCase(), item]));
        const wordRegex = new RegExp(`\\b(${words.map(item => item.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
        
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = wordRegex.exec(story)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ type: 'text', content: story.substring(lastIndex, match.index) });
            }
            const matchedWord = match[0];
            const wordItem = wordMap.get(matchedWord.toLowerCase());
            parts.push({ type: 'word', content: matchedWord, meaning: wordItem?.meaning || 'N/A' });
            lastIndex = match.index + matchedWord.length;
        }

        if (lastIndex < story.length) {
            parts.push({ type: 'text', content: story.substring(lastIndex) });
        }

        return parts;
    }, [story, words]);

    return (
        <p className="italic text-slate-800 dark:text-slate-200">
            "{storyParts.map((part, index) => {
                if (part.type === 'word') {
                    return (
                        <span key={index} className="relative group">
                            <strong className="text-adai-primary font-bold bg-adai-primary/10 px-1 rounded cursor-pointer not-italic">
                                {part.content}
                            </strong>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                {part.meaning}
                                <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                            </span>
                        </span>
                    );
                }
                return <span key={index}>{part.content}</span>;
            })}"
        </p>
    );
};

const ConceptWeaver: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('setup');
    const [words, setWords] = useState<ConceptWord[]>([]);
    const [story, setStory] = useState('');
    const [analysis, setAnalysis] = useState<ConceptWeaverAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleStartGame = async () => {
        setIsLoading(true);
        setError('');
        setStory('');
        setAnalysis(null);
        try {
            const newWords = await generateConceptWeaverWords();
            setWords(newWords);
            setGameState('playing');
        } catch (e: any) {
            setError(e.message || 'Failed to start game.');
            setGameState('setup');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitStory = async () => {
        if (story.trim().length < 10) {
            setError('Please write a short story of at least 10 characters.');
            return;
        }
        setGameState('analyzing');
        setError('');
        try {
            const resultText = await analyzeConceptWeaverStory(words.map(w => w.word), story);
            const resultJson: ConceptWeaverAnalysis = JSON.parse(resultText);
            setAnalysis(resultJson);
            setGameState('results');
        } catch (e: any) {
            setError(e.message || 'Failed to analyze story.');
            setGameState('playing'); // Revert to let user try again
        }
    };

    const handlePlayAgain = () => {
        setGameState('setup');
        setWords([]);
        setStory('');
        setAnalysis(null);
        setError('');
    };

    const renderSetup = () => (
        <div className="text-center">
            <p className="mb-6 text-slate-500 dark:text-slate-400">
                You will be given three random English words. Your task is to write a short, coherent story (2-3 sentences) that uses all of them. Let's test your creativity!
            </p>
            <button
                onClick={handleStartGame}
                disabled={isLoading}
                className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-transform transform hover:scale-105 text-xl shadow-lg disabled:bg-slate-400"
            >
                {isLoading ? 'Starting...' : 'Start New Game'}
            </button>
            {isLoading && <Loader />}
        </div>
    );

    const renderPlaying = () => (
        <div>
            <div className="mb-6 text-center">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Use these 3 words in your story:</h3>
                <div className="flex justify-center gap-4 mt-2">
                    {words.map((wordItem, index) => (
                         <span key={index} className="relative group px-4 py-2 bg-adai-primary/10 text-adai-primary font-bold rounded-full text-lg cursor-pointer">
                            {wordItem.word}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                {wordItem.meaning}
                                <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                            </span>
                        </span>
                    ))}
                </div>
            </div>
            <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Write your short story here..."
                className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none"
            />
            <button
                onClick={handleSubmitStory}
                className="mt-4 w-full bg-adai-primary hover:bg-adai-secondary text-white font-bold py-3 px-4 rounded-lg shadow-md"
            >
                Submit Story for Analysis
            </button>
        </div>
    );

    const renderAnalyzing = () => (
        <div className="text-center py-10">
            <h3 className="text-2xl font-bold mb-4">Analyzing your story...</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Alex is reading your work and preparing feedback.</p>
            <Loader />
        </div>
    );

    const renderResults = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-green-500">Analysis Complete! 🎉</h3>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">Your Story with Words [{words.map(w => w.word).join(', ')}]:</h4>
                <StoryDisplay story={story} words={words} />
            </div>
            
            {analysis && (
                <div className="space-y-6">
                    <div className="flex flex-col items-center text-center p-4 bg-adai-primary/10 rounded-lg">
                        <label className="text-sm font-semibold text-adai-primary">Creativity Score</label>
                        <p className="text-7xl font-bold text-adai-primary">{analysis.creativityScore}<span className="text-3xl">/10</span></p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{analysis.creativityFeedback}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Overall Feedback</h4>
                        <p className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-slate-600 dark:text-slate-300">{analysis.overallFeedback}</p>
                    </div>

                    {analysis.grammarFeedback.length > 0 && (
                         <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Grammar Suggestions</h4>
                            <div className="space-y-2">
                                {analysis.grammarFeedback.map((item, index) => (
                                    <div key={index} className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                                        <p><span className="text-red-600 dark:text-red-400 line-through">{item.error}</span> &rarr; <span className="text-green-600 dark:text-green-400 font-semibold">{item.correction}</span></p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1"><strong>Reason:</strong> {item.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {analysis.vocabularySuggestions.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Vocabulary Suggestions</h4>
                             <div className="space-y-2">
                                {analysis.vocabularySuggestions.map((item, index) => (
                                     <div key={index} className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                                        <p>Instead of <span className="text-yellow-600">'{item.original}'</span>, try <span className="text-teal-600 font-semibold">'{item.suggestion}'</span>.</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1"><strong>Reason:</strong> {item.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <button onClick={handlePlayAgain} className="w-full bg-adai-secondary hover:bg-adai-primary text-white font-bold py-3 px-6 rounded-lg shadow-md">
                Play Again
            </button>
        </div>
    );

    const renderContent = () => {
        switch (gameState) {
            case 'playing': return renderPlaying();
            case 'analyzing': return renderAnalyzing();
            case 'results': return renderResults();
            case 'setup':
            default: return renderSetup();
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50">Concept Weaver <ConceptWeaverIcon /></h2>
                </div>
                <ErrorMessage message={error} />
                {renderContent()}
            </div>
        </div>
    );
};

export default ConceptWeaver;
