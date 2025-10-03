import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { wordSprintData } from '../data/wordSprintData';
import { DIFFICULTY_LEVELS } from '../constants';
import Loader from '../components/Loader';
import { useExamHistory } from '../context/ExamHistoryContext';

type GameState = 'setup' | 'playing' | 'finished';

interface Question {
    type: 'word-to-meaning' | 'meaning-to-word';
    questionText: string;
    options: string[];
    correctAnswer: string;
}

const GAME_TIME = 60; // seconds

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const WordSprint: React.FC = () => {
    const { user } = useAuth();
    const [gameState, setGameState] = useState<GameState>('setup');
    const [difficulty, setDifficulty] = useState<string>(DIFFICULTY_LEVELS[1]);
    
    const highScoreKey = user ? `word-sprint-highscore-${user}-${difficulty}` : `word-sprint-highscore-guest-${difficulty}`;
    const [highScore, setHighScore] = useLocalStorage<number>(highScoreKey, 0);

    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [userChoice, setUserChoice] = useState<string | null>(null);
    const { trackSingleQuestionResult } = useExamHistory();

    const generateQuestions = useCallback(() => {
        const wordList = wordSprintData[difficulty];
        if (!wordList || wordList.length < 4) return [];

        return shuffleArray(wordList).map((wordItem) => {
            // FIX: Explicitly type `type` to match the Question interface.
            const type: 'word-to-meaning' | 'meaning-to-word' = Math.random() < 0.5 ? 'word-to-meaning' : 'meaning-to-word';
            const questionText = type === 'word-to-meaning' ? wordItem.word : wordItem.meaning;
            const correctAnswer = type === 'word-to-meaning' ? wordItem.meaning : wordItem.word;

            const distractors = shuffleArray(wordList.filter(w => w.word !== wordItem.word))
                .slice(0, 3)
                .map(w => type === 'word-to-meaning' ? w.meaning : w.word);
            
            const options = shuffleArray([correctAnswer, ...distractors]);
            
            return { type, questionText, options, correctAnswer };
        });
    }, [difficulty]);

    const startGame = useCallback(() => {
        setQuestions(generateQuestions());
        setScore(0);
        setTimeLeft(GAME_TIME);
        setCurrentQuestionIndex(0);
        setFeedback(null);
        setUserChoice(null);
        setGameState('playing');
    }, [generateQuestions]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        if (timeLeft <= 0) {
            setGameState('finished');
            if (score > highScore) {
                setHighScore(score);
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, timeLeft, score, highScore, setHighScore]);
    
    const handleAnswer = (answer: string) => {
        if (feedback) return;

        setUserChoice(answer);
        const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
        
        trackSingleQuestionResult('Word Sprint', isCorrect);

        if (isCorrect) {
            setScore(prev => prev + 10);
            setTimeLeft(prev => Math.min(GAME_TIME + 10, prev + 2));
            setFeedback('correct');
        } else {
            setScore(prev => Math.max(0, prev - 5));
            setTimeLeft(prev => Math.max(0, prev - 3));
            setFeedback('incorrect');
        }

        setTimeout(() => {
            setFeedback(null);
            setUserChoice(null);
            // Loop through questions if we reach the end
            setCurrentQuestionIndex(prev => (prev + 1) >= questions.length ? 0 : prev + 1);
        }, 700);
    };

    const renderSetup = () => (
        <div className="text-center">
            <h2 className="text-4xl font-bold mb-2 text-adai-primary">Word Sprint 🏃</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">60 saniyede en yüksek skoru yapmaya çalış!</p>
            
            <div className="mb-6">
                <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Zorluk Seviyesi Seç</h3>
                <div className="flex justify-center gap-2">
                    {DIFFICULTY_LEVELS.map(level => (
                        <button key={level} onClick={() => setDifficulty(level)}
                            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${difficulty === level ? 'bg-adai-primary text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'}`}>
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-8 text-lg">
                <p className="text-slate-600 dark:text-slate-400">En Yüksek Skor ({difficulty}): <span className="font-bold text-adai-secondary">{highScore}</span></p>
            </div>
            
            <button onClick={startGame} className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-transform transform hover:scale-105 text-xl shadow-lg">
                BAŞLA
            </button>
        </div>
    );
    
    const renderPlaying = () => {
        const currentQ = questions[currentQuestionIndex];
        if (!currentQ) return <Loader />;

        const questionPrompt = currentQ.type === 'word-to-meaning'
            ? 'Aşağıdaki kelimenin doğru anlamı hangisidir?'
            : 'Aşağıdaki anlama gelen doğru kelime hangisidir?';

        return (
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">SKOR</span>
                        <p className="text-3xl font-bold text-adai-primary">{score}</p>
                    </div>
                    <div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">SÜRE</span>
                        <p className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-slate-200'}`}>{timeLeft}</p>
                    </div>
                </div>

                <div className="text-center bg-slate-100 dark:bg-slate-800 p-8 rounded-lg flex-grow flex flex-col justify-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{questionPrompt}</p>
                    <h3 className="text-3xl font-bold capitalize text-adai-secondary">{currentQ.questionText}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    {currentQ.options.map((option, i) => {
                        let buttonClass = 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600';
                        if (feedback) {
                            if (option === currentQ.correctAnswer) {
                                buttonClass = 'bg-green-500 text-white scale-105 transform';
                            } else if (option === userChoice) {
                                buttonClass = 'bg-red-500 text-white';
                            } else {
                                buttonClass = 'bg-slate-200 dark:bg-slate-700 opacity-50';
                            }
                        }

                        return (
                            <button key={i} onClick={() => handleAnswer(option)} disabled={!!feedback}
                                className={`p-4 rounded-lg font-semibold text-center transition-all duration-200 capitalize w-full h-full min-h-[80px] flex items-center justify-center text-slate-800 dark:text-slate-200 ${buttonClass}`}>
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderFinished = () => (
        <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-200">Süre Bitti!</h2>
            <p className="text-7xl font-bold my-6 text-adai-primary">{score}</p>
            {score > highScore ? (
                <p className="text-xl font-semibold text-green-500 mb-4 animate-bounce">🎉 Yeni Yüksek Skor! 🎉</p>
            ) : (
                 <p className="text-lg mb-8 text-slate-600 dark:text-slate-400">En Yüksek Skor ({difficulty}): <span className="font-bold">{highScore}</span></p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={startGame} className="w-full sm:w-auto bg-adai-primary hover:bg-adai-secondary text-white font-bold py-3 px-6 rounded-lg shadow-md">
                    Tekrar Oyna
                </button>
                <button onClick={() => setGameState('setup')} className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold py-3 px-6 rounded-lg text-slate-800 dark:text-slate-200">
                    Ayarlara Dön
                </button>
            </div>
        </div>
    );
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col justify-center">
            {gameState === 'setup' && renderSetup()}
            {gameState === 'playing' && renderPlaying()}
            {gameState === 'finished' && renderFinished()}
        </div>
      </div>
    );
};

export default WordSprint;
