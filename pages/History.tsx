import React, { useState, useEffect } from 'react';
import { useHistory } from '../context/HistoryContext';
import { useExamHistory } from '../context/ExamHistoryContext';
import { HistoryItem, MockExamResultData } from '../types';
import AnalysisResultDisplay from '../components/AnalysisResultDisplay';
import MockExamResultDisplay from '../components/MockExamResultDisplay';

interface HistoryProps {
    onAskTutor: (context: string) => void;
}

const History: React.FC<HistoryProps> = ({ onAskTutor }) => {
    const { history: analysisHistory, clearHistory: clearAnalysisHistory } = useHistory();
    const { examHistory, clearExamHistory } = useExamHistory();

    const [activeTab, setActiveTab] = useState<'analysis' | 'exam'>(
        examHistory.length > 0 ? 'exam' : 'analysis'
    );

    const [selectedAnalysis, setSelectedAnalysis] = useState<HistoryItem | null>(null);
    const [selectedExam, setSelectedExam] = useState<MockExamResultData | null>(null);

    // Auto-select the first item on load or tab change
    useEffect(() => {
        if (activeTab === 'exam' && examHistory.length > 0) {
            setSelectedExam(examHistory[0]);
        } else if (activeTab === 'analysis' && analysisHistory.length > 0) {
            setSelectedAnalysis(analysisHistory[0]);
        }
    }, [activeTab, examHistory, analysisHistory]);

    // If the selected item is deleted, deselect it
    useEffect(() => {
        if (selectedAnalysis && !analysisHistory.find(item => item.id === selectedAnalysis.id)) {
            setSelectedAnalysis(null);
        }
        if (selectedExam && !examHistory.find(item => item.id === selectedExam.id)) {
            setSelectedExam(null);
        }
    }, [analysisHistory, examHistory, selectedAnalysis, selectedExam]);


    const handleClearHistory = () => {
        if (activeTab === 'analysis') {
            clearAnalysisHistory();
        } else {
            clearExamHistory();
        }
    };
    
    const hasHistory = analysisHistory.length > 0 || examHistory.length > 0;

    if (!hasHistory) {
        return (
            <div className="text-center py-10 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold mb-2">Geçmiş Boş</h2>
                <p className="text-slate-500 dark:text-slate-400">Henüz hiçbir analiz veya sınav geçmişiniz bulunmuyor.</p>
            </div>
        );
    }
    
    const TabButton: React.FC<{tab: 'analysis' | 'exam', label: string}> = ({ tab, label }) => (
         <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === tab 
                ? 'bg-brand-primary text-white shadow' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Geçmiş</h2>
                <div className="flex items-center gap-2">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
                       <TabButton tab="analysis" label="Soru Analizleri" />
                       <TabButton tab="exam" label="Deneme Sınavları" />
                    </div>
                    <button
                        onClick={handleClearHistory}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm shadow">
                        Geçmişi Temizle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List Pane */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 h-full max-h-[80vh] overflow-y-auto">
                    {activeTab === 'analysis' ? (
                        analysisHistory.length > 0 ? (
                             <ul className="space-y-2">
                                {analysisHistory.map(item => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => setSelectedAnalysis(item)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${selectedAnalysis?.id === item.id ? 'bg-brand-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                            <p className="font-semibold truncate text-sm">{item.question}</p>
                                            <p className={`text-xs ${selectedAnalysis?.id === item.id ? 'opacity-80' : 'text-slate-500 dark:text-slate-400'}`}>{item.timestamp}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-slate-500 text-center p-4">Analiz geçmişi boş.</p>
                    ) : (
                        examHistory.length > 0 ? (
                            <ul className="space-y-2">
                                {examHistory.map(item => (
                                     <li key={item.id}>
                                        <button
                                            onClick={() => setSelectedExam(item)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${selectedExam?.id === item.id ? 'bg-brand-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-sm">PDF Sınavı</p>
                                                <p className={`font-bold text-sm ${selectedExam?.id === item.id ? 'text-white' : 'text-brand-primary'}`}>{item.score}/{item.totalQuestions}</p>
                                            </div>
                                            <p className={`text-xs ${selectedExam?.id === item.id ? 'opacity-80' : 'text-slate-500 dark:text-slate-400'}`}>{item.timestamp}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-slate-500 text-center p-4">Sınav geçmişi boş.</p>
                    )}
                </div>
                
                {/* Detail Pane */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 max-h-[80vh] overflow-y-auto">
                    {activeTab === 'analysis' ? (
                        selectedAnalysis ? (
                            <div>
                                <div className="mb-4">
                                    <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">Soru:</h4>
                                    <p className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">{selectedAnalysis.question}</p>
                                </div>
                                <AnalysisResultDisplay result={selectedAnalysis.analysis} />
                            </div>
                        ) : <p className="text-slate-500 text-center p-4">Detayları görmek için bir analiz seçin.</p>
                    ) : (
                        selectedExam ? (
                            <MockExamResultDisplay result={selectedExam} onAskTutor={onAskTutor} />
                        ) : <p className="text-slate-500 text-center p-4">Detayları görmek için bir sınav seçin.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
