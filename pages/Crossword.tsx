import React, { useState, useEffect, useRef } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { generateCrossword } from '../services/geminiService';
import { CrosswordData, CrosswordClue } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Crossword: React.FC = () => {
    const { vocabularyList } = useVocabulary();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [crossword, setCrossword] = useState<CrosswordData | null>(null);
    const [userGrid, setUserGrid] = useState<string[][]>([]);
    const [cellStatus, setCellStatus] = useState<(('correct' | 'incorrect' | 'revealed') | null)[][]>([]);
    const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
    const [direction, setDirection] = useState<'across' | 'down'>('across');

    const gridRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (vocabularyList.length < 5) {
            setError('Bulmaca oluşturmak için en az 5 kayıtlı kelime gereklidir.');
            return;
        }
        setIsLoading(true);
        setError('');
        setCrossword(null);
        setUserGrid([]);
        setActiveCell(null);
        setCellStatus([]);

        try {
            const wordsForPuzzle = [...vocabularyList].sort(() => 0.5 - Math.random()).slice(0, 20);
            const resultText = await generateCrossword(wordsForPuzzle);
            const resultJson: CrosswordData = JSON.parse(resultText);

            const processedClues = { across: [], down: [] };
            const clueNumberMap: { [key: string]: number } = {};

            const allClues = [...resultJson.clues.across, ...resultJson.clues.down].sort((a,b) => a.number - b.number);
            allClues.forEach(clue => {
                const key = `${clue.row},${clue.col}`;
                if (!clueNumberMap[key]) {
                    clueNumberMap[key] = clue.number;
                }
                if (clue.direction === 'across') (processedClues.across as CrosswordClue[]).push(clue);
                else (processedClues.down as CrosswordClue[]).push(clue);
            });
            resultJson.clues = processedClues as any;
            
            const gridWithNumbers = resultJson.grid.map(row => [...row]);
             gridWithNumbers.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if (cell === null) return;
                    const key = `${r},${c}`;
                    if (clueNumberMap[key]) {
                        gridWithNumbers[r][c] = `${clueNumberMap[key]}|${cell}`;
                    }
                });
            });


            setCrossword({ ...resultJson, grid: gridWithNumbers as any });
            setUserGrid(Array(resultJson.size.rows).fill(null).map(() => Array(resultJson.size.cols).fill('')));
            setCellStatus(Array(resultJson.size.rows).fill(null).map(() => Array(resultJson.size.cols).fill(null)));
        } catch (e: any) {
            setError(e.message || 'Bulmaca oluşturulamadı.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCellClick = (row: number, col: number) => {
        if (!crossword || crossword.grid[row][col] === null) return;
        
        if (activeCell && activeCell.row === row && activeCell.col === col) {
            setDirection(prev => {
                const canGoDown = crossword.clues.down.some(c => c.col === col && row >= c.row && row < c.row + c.answer.length);
                const canGoAcross = crossword.clues.across.some(c => c.row === row && col >= c.col && col < c.col + c.answer.length);
                if (prev === 'across' && canGoDown) return 'down';
                if (prev === 'down' && canGoAcross) return 'across';
                return prev;
            });
        } else {
            setActiveCell({ row, col });
            const canGoAcross = crossword.clues.across.some(c => c.row === row && col >= c.col && col < c.col + c.answer.length);
            if (canGoAcross) setDirection('across');
            else setDirection('down');
        }
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!activeCell || !crossword) return;
        const { row, col } = activeCell;

        e.preventDefault();

        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            const newUserGrid = userGrid.map(r => [...r]);
            const newStatus = cellStatus.map(r => [...r]);
            newUserGrid[row][col] = e.key.toUpperCase();
            newStatus[row][col] = null;
            setUserGrid(newUserGrid);
            setCellStatus(newStatus);
            if (direction === 'across' && col + 1 < crossword.size.cols && crossword.grid[row][col + 1] !== null) {
                setActiveCell({ row, col: col + 1 });
            } else if (direction === 'down' && row + 1 < crossword.size.rows && crossword.grid[row + 1][col] !== null) {
                setActiveCell({ row: row + 1, col });
            }
        } else if (e.key === 'Backspace') {
            const newUserGrid = userGrid.map(r => [...r]);
            const newStatus = cellStatus.map(r => [...r]);
            newUserGrid[row][col] = '';
            newStatus[row][col] = null;
            setUserGrid(newUserGrid);
            setCellStatus(newStatus);
            if (direction === 'across' && col - 1 >= 0 && crossword.grid[row][col - 1] !== null) {
                setActiveCell({ row, col: col - 1 });
            } else if (direction === 'down' && row - 1 >= 0 && crossword.grid[row - 1][col] !== null) {
                setActiveCell({ row: row - 1, col });
            }
        } else if (e.key === 'ArrowUp') {
            for (let i = row - 1; i >= 0; i--) if (crossword.grid[i][col] !== null) { setActiveCell({ row: i, col }); break; }
        } else if (e.key === 'ArrowDown') {
            for (let i = row + 1; i < crossword.size.rows; i++) if (crossword.grid[i][col] !== null) { setActiveCell({ row: i, col }); break; }
        } else if (e.key === 'ArrowLeft') {
            for (let i = col - 1; i >= 0; i--) if (crossword.grid[row][i] !== null) { setActiveCell({ row, col: i }); break; }
        } else if (e.key === 'ArrowRight') {
            for (let i = col + 1; i < crossword.size.cols; i++) if (crossword.grid[row][i] !== null) { setActiveCell({ row, col: i }); break; }
        } else if (e.key === 'Tab' || e.key === 'Enter') {
             const allClues = direction === 'across' ? crossword.clues.across : crossword.clues.down;
             const currentClueIndex = allClues.findIndex(c => c.number === activeClue?.number);
             const nextClue = allClues[(currentClueIndex + 1) % allClues.length];
             if(nextClue) {
                 setActiveCell({row: nextClue.row, col: nextClue.col});
             }
        }
    };
    
    const getActiveClue = () => {
        if (!activeCell || !crossword) return null;
        const { row, col } = activeCell;
        return crossword.clues[direction].find(c => 
            direction === 'across' ? c.row === row && col >= c.col && col < c.col + c.answer.length
                                 : c.col === col && row >= c.row && row < c.row + c.answer.length
        );
    };

    const activeClue = getActiveClue();

    const ClueList = ({ title, clues, directionType }: { title: string, clues: CrosswordClue[], directionType: 'across' | 'down' }) => (
        <div>
            <h3 className="text-lg font-bold text-adai-primary mb-2">{title}</h3>
            <ul className="space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
                {clues.map(c => (
                    <li key={`${c.direction}-${c.number}`}>
                        <button onClick={() => { setActiveCell({row: c.row, col: c.col}); setDirection(directionType); inputRef.current?.focus(); }}
                            className={`w-full text-left p-2 rounded-md transition-colors ${activeClue?.number === c.number && activeClue?.direction === c.direction ? 'bg-adai-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            <strong>{c.number}.</strong> {c.clue}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

    // --- Control Functions ---
    const handleClearPuzzle = () => {
        if (!crossword) return;
        setUserGrid(Array(crossword.size.rows).fill(null).map(() => Array(crossword.size.cols).fill('')));
        setCellStatus(Array(crossword.size.rows).fill(null).map(() => Array(crossword.size.cols).fill(null)));
    };
    
    const handleCheckWord = () => {
        if (!activeClue || !crossword) return;
        const { answer, row, col, direction } = activeClue;
        const newStatus = cellStatus.map(r => [...r]);
        for (let i = 0; i < answer.length; i++) {
            const r = direction === 'across' ? row : row + i;
            const c = direction === 'across' ? col + i : col;
            const correctLetter = (crossword.grid[r][c] as string).split('|').pop();
            const userLetter = userGrid[r][c];
            if (userLetter) {
                newStatus[r][c] = userLetter === correctLetter ? 'correct' : 'incorrect';
            }
        }
        setCellStatus(newStatus);
    };

    const handleRevealWord = () => {
        if (!activeClue || !crossword) return;
        const { answer, row, col, direction } = activeClue;
        const newStatus = cellStatus.map(r => [...r]);
        const newUserGrid = userGrid.map(r => [...r]);

        for (let i = 0; i < answer.length; i++) {
            const r = direction === 'across' ? row : row + i;
            const c = direction === 'across' ? col + i : col;
            const correctLetter = (crossword.grid[r][c] as string).split('|').pop()!;
            newUserGrid[r][c] = correctLetter;
            newStatus[r][c] = 'revealed';
        }
        setUserGrid(newUserGrid);
        setCellStatus(newStatus);
    };

     const handleCheckPuzzle = () => {
        if (!crossword) return;
        const newStatus = cellStatus.map(r => [...r]);
        for (let r = 0; r < crossword.size.rows; r++) {
            for (let c = 0; c < crossword.size.cols; c++) {
                if (crossword.grid[r][c] !== null) {
                    const correctLetter = (crossword.grid[r][c] as string).split('|').pop();
                    const userLetter = userGrid[r][c];
                    if (userLetter) {
                        newStatus[r][c] = userLetter === correctLetter ? 'correct' : 'incorrect';
                    }
                }
            }
        }
        setCellStatus(newStatus);
    };

    const handleRevealPuzzle = () => {
        if (!crossword) return;
        const newStatus = Array(crossword.size.rows).fill(null).map(() => Array(crossword.size.cols).fill(null));
        const newUserGrid = Array(crossword.size.rows).fill(null).map(() => Array(crossword.size.cols).fill(''));

        for (let r = 0; r < crossword.size.rows; r++) {
            for (let c = 0; c < crossword.size.cols; c++) {
                if (crossword.grid[r][c] !== null) {
                    const correctLetter = (crossword.grid[r][c] as string).split('|').pop()!;
                    newUserGrid[r][c] = correctLetter;
                    newStatus[r][c] = 'revealed';
                }
            }
        }
        setUserGrid(newUserGrid);
        setCellStatus(newStatus);
    };
    
    const ControlButton: React.FC<{ onClick: () => void, children: React.ReactNode, disabled?: boolean }> = ({ onClick, children, disabled }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {children}
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">Kelime Bulmaca 🔡</h2>
                <p className="mb-4 text-slate-500 dark:text-slate-400">
                    Kaydettiğiniz kelimelerle oluşturulan bulmacayı çözerek kelime bilginizi pekiştirin. Başlamak için butona tıklayın.
                </p>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || vocabularyList.length < 5}
                    className="w-full bg-adai-primary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    {isLoading ? 'Bulmaca Oluşturuluyor...' : 'Yeni Bulmaca Oluştur'}
                </button>
                 {vocabularyList.length < 5 && (
                    <p className="text-xs text-yellow-600 mt-2 text-center">Bulmaca oluşturmak için {5 - vocabularyList.length} kelime daha eklemelisiniz.</p>
                )}
            </div>

            {isLoading && <Loader />}
            <ErrorMessage message={error} />
            
            {crossword && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                        <div ref={gridRef} className="relative mx-auto aspect-square" style={{ display: 'grid', gridTemplateColumns: `repeat(${crossword.size.cols}, 1fr)`, gridTemplateRows: `repeat(${crossword.size.rows}, 1fr)`, maxWidth: '600px'}}>
                            <input ref={inputRef} onKeyDown={handleKeyDown} className="absolute opacity-0 w-0 h-0 -top-10 -left-10" aria-label="Crossword input" />
                            {crossword.grid.map((row, r_idx) => (
                                row.map((cell, c_idx) => {
                                    if (cell === null) {
                                        return <div key={`${r_idx}-${c_idx}`} className="bg-slate-800 dark:bg-slate-950"></div>
                                    }

                                    const [clueNumber, answerLetter] = (cell as string).includes('|') ? (cell as string).split('|') : [null, cell];
                                    
                                    const isActive = activeCell?.row === r_idx && activeCell?.col === c_idx;
                                    const isInActiveWord = activeClue ? 
                                        (direction === 'across' ? activeClue.row === r_idx && c_idx >= activeClue.col && c_idx < activeClue.col + activeClue.answer.length : false) ||
                                        (direction === 'down' ? activeClue.col === c_idx && r_idx >= activeClue.row && r_idx < activeClue.row + activeClue.answer.length : false)
                                        : false;
                                    
                                    const status = cellStatus[r_idx]?.[c_idx];
                                    const isRevealed = status === 'revealed';
                                    const displayLetter = isRevealed ? answerLetter : (userGrid[r_idx]?.[c_idx] || '');
                                    
                                    let cellClass = 'bg-slate-100 dark:bg-slate-800';
                                    if (isActive) cellClass = 'bg-yellow-300 dark:bg-yellow-600';
                                    else if (isInActiveWord) cellClass = 'bg-adai-primary/20 dark:bg-adai-primary/30';
                                    
                                    let letterClass = 'text-slate-900 dark:text-slate-50';
                                    if (status === 'correct') letterClass = 'text-blue-600 dark:text-blue-400';
                                    else if (status === 'incorrect') letterClass = 'text-red-500';
                                    else if (isRevealed) letterClass = 'text-adai-secondary';

                                    return (
                                        <div key={`${r_idx}-${c_idx}`} onClick={() => handleCellClick(r_idx, c_idx)}
                                            className={`relative flex items-center justify-center border border-slate-300 dark:border-slate-600 cursor-pointer ${cellClass}`}>
                                            {clueNumber && <span className="absolute top-0 left-0.5 text-[8px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">{clueNumber}</span>}
                                            <span className={`text-xl sm:text-2xl font-bold uppercase ${letterClass}`}>
                                                {displayLetter}
                                            </span>
                                        </div>
                                    );
                                })
                            ))}
                        </div>
                        
                        {activeClue && (
                            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-center">
                                <span className="font-bold text-yellow-800 dark:text-yellow-200">{activeClue.number} {direction === 'across' ? 'Soldan Sağa' : 'Yukarıdan Aşağı'}:</span>
                                <p className="mt-1 text-slate-800 dark:text-slate-200">{activeClue.clue}</p>
                            </div>
                        )}
                        
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            <ControlButton onClick={handleCheckWord} disabled={!activeClue}>Kelimeyi Kontrol Et</ControlButton>
                            <ControlButton onClick={handleRevealWord} disabled={!activeClue}>Kelimeyi Göster</ControlButton>
                            <ControlButton onClick={handleCheckPuzzle}>Bulmacayı Kontrol Et</ControlButton>
                            <ControlButton onClick={handleRevealPuzzle}>Tümünü Göster</ControlButton>
                            <ControlButton onClick={handleClearPuzzle}>Temizle</ControlButton>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                        <ClueList title="Soldan Sağa" clues={crossword.clues.across} directionType="across" />
                        <div className="my-4 border-t border-slate-200 dark:border-slate-700"></div>
                        <ClueList title="Yukarıdan Aşağı" clues={crossword.clues.down} directionType="down" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Crossword;
