import React, { useState, useEffect, useCallback } from 'react';
import { hangmanWords } from '../data/hangmanWords';
import { DIFFICULTY_LEVELS } from '../constants';

const HANGMAN_PARTS = [
    <circle key="head" cx="250" cy="90" r="40" stroke="currentColor" strokeWidth="8" fill="none" />,
    <line key="body" x1="250" y1="130" x2="250" y2="250" stroke="currentColor" strokeWidth="8" />,
    <line key="l-arm" x1="250" y1="170" x2="200" y2="220" stroke="currentColor" strokeWidth="8" />,
    <line key="r-arm" x1="250" y1="170" x2="300" y2="220" stroke="currentColor" strokeWidth="8" />,
    <line key="l-leg" x1="250" y1="250" x2="200" y2="300" stroke="currentColor" strokeWidth="8" />,
    <line key="r-leg" x1="250" y1="250" x2="300" y2="300" stroke="currentColor" strokeWidth="8" />,
];

const MAX_WRONG_GUESSES = HANGMAN_PARTS.length;

const Hangman: React.FC = () => {
    const [gameState, setGameState] = useState<'setup' | 'playing' | 'won' | 'lost'>('setup');
    const [difficulty, setDifficulty] = useState<string>(DIFFICULTY_LEVELS[1]);
    const [wordToGuess, setWordToGuess] = useState('');
    const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
    const [hintUsed, setHintUsed] = useState(false);
    
    const incorrectGuesses = [...guessedLetters].filter(letter => !wordToGuess.includes(letter)).length;

    const chooseWord = useCallback((level: string): string => {
        const wordList = hangmanWords[level];
        return wordList[Math.floor(Math.random() * wordList.length)];
    }, []);

    const startGame = useCallback(() => {
        const newWord = chooseWord(difficulty);
        setWordToGuess(newWord);
        setGuessedLetters(new Set());
        setHintUsed(false);
        setGameState('playing');
    }, [difficulty, chooseWord]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const isWon = wordToGuess.split('').every(letter => guessedLetters.has(letter));
        if (isWon) {
            setGameState('won');
        } else if (incorrectGuesses >= MAX_WRONG_GUESSES) {
            setGameState('lost');
        }
    }, [guessedLetters, wordToGuess, incorrectGuesses, gameState]);

    const handleGuess = (letter: string) => {
        if (gameState !== 'playing' || guessedLetters.has(letter)) return;
        setGuessedLetters(prev => new Set(prev).add(letter));
    };

    const handleHint = () => {
        if (gameState !== 'playing' || hintUsed) return;

        const unguessedLetters = wordToGuess
            .split('')
            .filter(letter => !guessedLetters.has(letter));
        
        if (unguessedLetters.length > 0) {
            const hintLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
            setGuessedLetters(prev => new Set(prev).add(hintLetter));
            setHintUsed(true);
        }
    };
    
    const handlePlayAgain = () => {
        setGameState('setup');
    };

    const renderWord = () => (
        <div className="flex justify-center gap-2 sm:gap-4">
            {wordToGuess.split('').map((letter, index) => (
                <span key={index} className="flex items-center justify-center w-10 h-12 sm:w-12 sm:h-16 bg-slate-200 dark:bg-slate-700 rounded-lg text-2xl sm:text-4xl font-bold">
                    {guessedLetters.has(letter) ? letter : ''}
                </span>
            ))}
        </div>
    );
    
    const renderKeyboard = () => (
        <div className="flex flex-wrap justify-center gap-2 mt-8">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                const isGuessed = guessedLetters.has(letter);
                const isCorrect = wordToGuess.includes(letter);
                
                let buttonClass = 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600';
                if (isGuessed) {
                    buttonClass = isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white opacity-50';
                }
                
                return (
                    <button key={letter} onClick={() => handleGuess(letter)} disabled={isGuessed || gameState !== 'playing'}
                        className={`w-10 h-12 sm:w-12 sm:h-14 font-bold text-lg rounded-lg transition-all duration-200 disabled:cursor-not-allowed ${buttonClass}`}>
                        {letter}
                    </button>
                );
            })}
        </div>
    );

    const renderSetup = () => (
        <div className="text-center">
             <p className="mb-6 text-slate-500 dark:text-slate-400">
                A classic word-guessing game. Choose a difficulty to start.
            </p>
            <div className="mb-6">
                <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Difficulty Level</h3>
                <div className="flex justify-center gap-2">
                    {DIFFICULTY_LEVELS.map(level => (
                        <button key={level} onClick={() => setDifficulty(level)}
                            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${difficulty === level ? 'bg-adai-primary text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'}`}>
                            {level}
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={startGame} 
                className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-transform transform hover:scale-105 text-xl shadow-lg">
                Start Game
            </button>
        </div>
    );
    
    const renderGame = () => (
        <div className="relative">
            {(gameState === 'won' || gameState === 'lost') && (
                <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-10 rounded-lg animate-fade-in">
                    <h3 className={`text-5xl font-bold mb-4 ${gameState === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                        {gameState === 'won' ? 'You Won! 🎉' : 'Game Over'}
                    </h3>
                    {gameState === 'lost' && <p className="text-white text-lg">The word was: <strong className="text-yellow-400">{wordToGuess}</strong></p>}
                    <button onClick={startGame} className="mt-6 bg-adai-primary hover:bg-adai-secondary text-white font-bold py-3 px-6 rounded-lg">Play Again</button>
                    <button onClick={handlePlayAgain} className="mt-2 text-sm text-slate-300 hover:underline">Change Difficulty</button>
                </div>
            )}
            <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="w-full max-w-xs lg:max-w-sm">
                    <svg viewBox="0 0 350 350" className="text-slate-800 dark:text-slate-200">
                        {/* Gallows */}
                        <line x1="20" y1="330" x2="150" y2="330" stroke="currentColor" strokeWidth="8" />
                        <line x1="85" y1="330" x2="85" y2="20" stroke="currentColor" strokeWidth="8" />
                        <line x1="85" y1="20" x2="250" y2="20" stroke="currentColor" strokeWidth="8" />
                        <line x1="250" y1="20" x2="250" y2="50" stroke="currentColor" strokeWidth="8" />
                        {/* Hangman parts */}
                        {HANGMAN_PARTS.slice(0, incorrectGuesses)}
                    </svg>
                </div>
                <div className="w-full flex-grow">
                    {renderWord()}
                    <div className="text-center my-4">
                        <button
                            onClick={handleHint}
                            disabled={gameState !== 'playing' || hintUsed || wordToGuess.split('').every(letter => guessedLetters.has(letter))}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed shadow-md"
                        >
                            💡 Hint (1 per game)
                        </button>
                    </div>
                    {renderKeyboard()}
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                 <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Hangman 🧍</h2>
                </div>
                {gameState === 'setup' ? renderSetup() : renderGame()}
            </div>
        </div>
    );
};

export default Hangman;
