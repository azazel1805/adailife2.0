import React, { useState, useRef } from 'react';
import { generateSentenceOrderingExercise } from '../services/geminiService';
import { SentenceOrderingExercise } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { DIFFICULTY_LEVELS } from '../constants';
import { useChallenge } from '../context/ChallengeContext';
import { useExamHistory } from '../context/ExamHistoryContext';

type DraggableSentence = {
    id: number; // Original index
    text: string;
};

const SentenceOrdering: React.FC = () => {
    const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS[1]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [exercise, setExercise] = useState<SentenceOrderingExercise | null>(null);
    const [userOrderedSentences, setUserOrderedSentences] = useState<DraggableSentence[]>([]);
    const [showResults, setShowResults] = useState(false);
    const { trackAction } = useChallenge();
    const { trackSingleQuestionResult } = useExamHistory();

    const draggedItemIndex = useRef<number | null>(null);
    const dropTargetIndex = useRef<number | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setExercise(null);
        setUserOrderedSentences([]);
        setShowResults(false);
        try {
            const resultText = await generateSentenceOrderingExercise(difficulty);
            const resultJson: SentenceOrderingExercise = JSON.parse(resultText);
            setExercise(resultJson);
            setUserOrderedSentences(resultJson.sentences.map((text, id) => ({ id, text })));
            trackAction('sentence_ordering');
        } catch (e: any) {
            setError(e.message || 'Alıştırma oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDragStart = (index: number) => {
        draggedItemIndex.current = index;
    };
    
    const handleDragEnter = (index: number) => {
        dropTargetIndex.current = index;
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow drop
    };
    
    const handleDrop = () => {
        if (draggedItemIndex.current === null || dropTargetIndex.current === null) return;
        
        const newOrder = [...userOrderedSentences];
        const [draggedItem] = newOrder.splice(draggedItemIndex.current, 1);
        newOrder.splice(dropTargetIndex.current, 0, draggedItem);
        
        setUserOrderedSentences(newOrder);
        draggedItemIndex.current = null;
        dropTargetIndex.current = null;
    };

    const handleMoveSentence = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === userOrderedSentences.length - 1) return;
    
        const newOrder = [...userOrderedSentences];
        const itemToMove = newOrder[index];
        
        if (direction === 'up') {
            newOrder.splice(index, 1);
            newOrder.splice(index - 1, 0, itemToMove);
        } else { // 'down'
            newOrder.splice(index, 1);
            newOrder.splice(index + 1, 0, itemToMove);
        }
    
        setUserOrderedSentences(newOrder);
    };
    
    const handleCheckAnswers = () => {
        if (!exercise) return;
        setShowResults(true);

        const userOrderIds = userOrderedSentences.map(s => s.id);
        const correctOrderIds = exercise.analysis.correctOrderIndices;
        const isCorrect = JSON.stringify(userOrderIds) === JSON.stringify(correctOrderIds);
        trackSingleQuestionResult('Cümle Sıralama', isCorrect);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2 text-text-primary">Cümle Sıralama Alıştırması</h2>
                <p className="mb-4 text-text-secondary">
                    Karışık olarak verilen cümleleri sürükleyip bırakarak veya ok tuşlarını kullanarak anlamlı bir paragraf oluşturun. Bu alıştırma, metin akışı ve anlamsal bütünlük kurma becerinizi geliştirir.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Zorluk Seviyesi</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none text-text-primary"
                            disabled={isLoading}
                        >
                            {DIFFICULTY_LEVELS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full sm:w-auto mt-2 sm:mt-0 self-end bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-md transition duration-300 disabled:bg-gray-500"
                    >
                        {isLoading ? 'Oluşturuluyor...' : 'Yeni Alıştırma Oluştur'}
                    </button>
                </div>
            </div>

            {isLoading && <Loader />}
            <ErrorMessage message={error} />
            
            {exercise && (
                <div className="bg-bg-secondary p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-brand-primary mb-4">Paragrafı Oluştur</h3>
                    <p className="text-sm text-text-secondary mb-4">Cümleleri doğru sıraya sürükleyin veya okları kullanın.</p>

                    <div 
                        className="space-y-3 border border-gray-200 p-4 rounded-lg"
                        onDragOver={handleDragOver}
                    >
                        {userOrderedSentences.map((sentence, index) => {
                             const isCorrect = showResults && exercise.analysis.correctOrderIndices[index] === sentence.id;
                             const resultClass = showResults
                                ? isCorrect
                                    ? 'border-green-500 bg-green-100 dark:bg-green-900/30'
                                    : 'border-red-500 bg-red-100 dark:bg-red-900/30'
                                : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800';

                            return (
                                <div
                                    key={sentence.id}
                                    draggable={!showResults}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragEnter={() => handleDragEnter(index)}
                                    onDrop={handleDrop}
                                    className={`flex items-center p-3 rounded-md border-2 transition-all duration-200 ${resultClass} ${!showResults ? 'cursor-move hover:bg-brand-secondary/10' : ''}`}
                                >
                                    <span className="text-xl text-brand-primary font-bold mr-4">{index + 1}.</span>
                                    <p className="text-text-primary flex-1">{sentence.text}</p>
                                     {!showResults && (
                                        <div className="flex flex-col ml-2 sm:ml-4">
                                            <button 
                                                onClick={() => handleMoveSentence(index, 'up')} 
                                                disabled={index === 0}
                                                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label={`Move sentence ${index + 1} up`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L11 6.414V17a1 1 0 11-2 0V6.414L5.707 9.707a1 1 0 01-1.414-1.414l5-5A1 1 0 0110 3z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleMoveSentence(index, 'down')} 
                                                disabled={index === userOrderedSentences.length - 1}
                                                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label={`Move sentence ${index + 1} down`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 17a1 1 0 01-.707-.293l-5-5a1 1 0 011.414-1.414L9 13.586V3a1 1 0 112 0v10.586l3.293-3.293a1 1 0 011.414 1.414l-5 5A1 1 0 0110 17z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {!showResults && (
                        <button onClick={handleCheckAnswers} className="mt-6 w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 px-4 rounded-md transition duration-300">
                            Cevapları Kontrol Et
                        </button>
                    )}
                </div>
            )}
            
            {showResults && exercise && (
                 <div className="bg-bg-secondary p-6 rounded-lg shadow-lg">
                     <h3 className="text-xl font-bold text-green-600 mb-4">Analiz ve Açıklama</h3>
                     <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-md space-y-3">
                         <h4 className="font-semibold text-text-primary">Doğru Sıralama ve Mantığı</h4>
                         <p className="text-sm text-text-secondary whitespace-pre-wrap">{exercise.analysis.explanation}</p>
                     </div>
                 </div>
            )}
        </div>
    );
};

export default SentenceOrdering;
