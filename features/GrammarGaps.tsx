import React, { useState, useCallback, useRef } from 'react';
import { generateGrammarGapsStory } from '../services/geminiService';
import { DIFFICULTY_LEVELS } from '../constants';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

type GameState = 'setup' | 'playing' | 'finished';

const parsePlaceholder = (placeholder: string): string => {
    const content = placeholder.replace(/[\[\]]/g, '');
    const [partOfSpeech, description] = content.split(':');
    let prompt = partOfSpeech.charAt(0).toUpperCase() + partOfSpeech.slice(1).toLowerCase();
    if (description) {
        prompt += ` (${description.trim()})`;
    }
    return prompt;
};

const GrammarGaps: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('setup');
    const [difficulty, setDifficulty] = useState<string>(DIFFICULTY_LEVELS[1]); // Orta
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [storyTemplate, setStoryTemplate] = useState('');
    const [placeholders, setPlaceholders] = useState<string[]>([]);
    const [userWords, setUserWords] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [finalStory, setFinalStory] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleStartGame = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const template = await generateGrammarGapsStory(difficulty);
            const foundPlaceholders = template.match(/\[(.*?)\]/g);
            if (!foundPlaceholders || foundPlaceholders.length === 0) {
                throw new Error("Generated story template did not contain any placeholders. Please try again.");
            }
            setStoryTemplate(template);
            setPlaceholders(foundPlaceholders);
            setUserWords(new Array(foundPlaceholders.length).fill(''));
            setCurrentStep(0);
            setGameState('playing');
        } catch (e: any) {
            setError(e.message);
            setGameState('setup');
        } finally {
            setIsLoading(false);
        }
    }, [difficulty]);

    const handleWordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const word = inputRef.current?.value || '';
        if (word.trim() === '') return;

        const newWords = [...userWords];
        newWords[currentStep] = word.trim();
        setUserWords(newWords);

        if (currentStep < placeholders.length - 1) {
            setCurrentStep(currentStep + 1);
            if (inputRef.current) {
                inputRef.current.value = '';
                inputRef.current.focus();
            }
        } else {
            // Last word, generate story
            let story = storyTemplate;
            placeholders.forEach((ph, index) => {
                // Use a regex with 'g' flag to replace all occurrences if a placeholder appears more than once.
                const regex = new RegExp(ph.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                story = story.replace(regex, `<strong class="text-adai-primary bg-adai-primary/10 px-1 rounded-md">${newWords[index]}</strong>`);
            });
            setFinalStory(story);
            setGameState('finished');
        }
    };

    const handlePlayAgain = () => {
        setGameState('setup');
        setStoryTemplate('');
        setPlaceholders([]);
        setUserWords([]);
        setCurrentStep(0);
        setFinalStory('');
        setError('');
    };

    const renderSetup = () => (
        <div className="text-center">
            <p className="mb-6 text-slate-500 dark:text-slate-400">
                Dilbilgisi pratiği yapabileceğiniz bir 'Mad Libs' tarzı oyun. Bir zorluk seviyesi seçin, sizin doldurmanız için boşlukları olan bir hikaye oluşturalım.
            </p>
            <div className="mb-6">
                <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Zorluk</h3>
                <div className="flex justify-center gap-2">
                    {DIFFICULTY_LEVELS.map(level => (
                        <button key={level} onClick={() => setDifficulty(level)}
                            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${difficulty === level ? 'bg-adai-primary text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'}`}>
                            {level}
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={handleStartGame} disabled={isLoading}
                className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-transform transform hover:scale-105 text-xl shadow-lg disabled:bg-slate-400">
                {isLoading ? 'Generating Story...' : 'Start Game'}
            </button>
            {isLoading && <Loader />}
        </div>
    );

    const renderPlaying = () => (
        <div>
            <div className="text-center mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">Step {currentStep + 1} of {placeholders.length}</p>
                <label htmlFor="word-input" className="block text-2xl font-bold mt-2 text-adai-secondary">
                    Enter a {parsePlaceholder(placeholders[currentStep])}
                </label>
            </div>
            <form onSubmit={handleWordSubmit} className="flex gap-2">
                <input
                    ref={inputRef}
                    id="word-input"
                    type="text"
                    autoFocus
                    autoComplete="off"
                    className="w-full p-3 text-center text-xl font-bold bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none"
                />
                <button type="submit" className="bg-adai-primary hover:bg-adai-secondary text-white font-bold py-3 px-6 rounded-lg">
                    Next
                </button>
            </form>
        </div>
    );

    const renderFinished = () => (
        <div className="text-center">
            <h3 className="text-3xl font-bold mb-4 text-green-500">Here's your story! 🎉</h3>
            <div
                className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg text-left text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: finalStory.replace(/\n/g, '<br />') }}
            />
            <button onClick={handlePlayAgain} className="mt-6 bg-adai-primary hover:bg-adai-secondary text-white font-bold py-3 px-6 rounded-lg shadow-md">
                Play Again
            </button>
        </div>
    );

    const renderContent = () => {
        switch (gameState) {
            case 'playing': return renderPlaying();
            case 'finished': return renderFinished();
            case 'setup':
            default: return renderSetup();
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50">Dilbigisel Boşluklar ✏️</h2>
                </div>
                <ErrorMessage message={error} />
                {renderContent()}
            </div>
        </div>
    );
};

export default GrammarGaps;
