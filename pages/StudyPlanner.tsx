import React, { useState, useMemo } from 'react';
import { generateStudyPlan } from '../services/geminiService';
import { FullStudyPlan, Tab, StudyTask, PlacementTestReport } from '../types';
import { useExamHistory } from '../context/ExamHistoryContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';

interface StudyPlannerProps {
    onNavigate: (tab: Tab) => void;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ onNavigate }) => {
    const { performanceStats } = useExamHistory();
    const { user } = useAuth();

    const planKey = user ? `study-plan-${user}` : 'study-plan-guest';
    const [savedPlan, setSavedPlan] = useLocalStorage<FullStudyPlan | null>(planKey, null);

    const reportKey = user ? `placement-test-report-${user}` : 'placement-test-report-guest';
    const [cefrReport] = useLocalStorage<PlacementTestReport | null>(reportKey, null);

    const [targetDate, setTargetDate] = useState('');
    const [studyHours, setStudyHours] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    const handleGeneratePlan = async () => {
        if (!targetDate || studyHours < 1) {
            setError('Lütfen geçerli bir hedef tarih ve haftalık çalışma süresi girin.');
            return;
        }
        if (Object.keys(performanceStats).length === 0 && !cefrReport) {
            setError('Kişiselleştirilmiş bir plan oluşturmak için önce Seviye Tespit Sınavı\'nı çözmeli veya pratik araçlarını kullanarak veri oluşturmalısınız.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const resultText = await generateStudyPlan(performanceStats, targetDate, studyHours, cefrReport);
            const resultJson: FullStudyPlan = JSON.parse(resultText);
            setSavedPlan(resultJson);
        } catch (e: any) {
            setError(e.message || 'Çalışma planı oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePlan = () => {
        setSavedPlan(null);
        setError('');
    };

    const handleTaskClick = (task: StudyTask) => {
        if (task.action?.navigateTo) {
            onNavigate(task.action.navigateTo);
        }
    };
    
    // RENDER SAVED PLAN
    if (savedPlan) {
        return (
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-xl font-bold text-adai-primary">Kişisel Çalışma Planın</h3>
                        <button 
                            onClick={handleDeletePlan}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm shadow-md shrink-0"
                        >
                            Planı Sil & Yeni Oluştur
                        </button>
                    </div>
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded-md">{savedPlan.overallRecommendation}</p>
                </div>

                <div className="space-y-8">
                    {savedPlan.weeks.map(week => (
                        <div key={week.weekNumber} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                                {week.weekNumber}. Hafta: <span className="text-adai-primary">{week.weeklyFocus}</span>
                            </h4>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {week.dailyTasks?.map(day => (
                                    <div key={day.day} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                                        <h5 className="font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">{day.day}</h5>
                                        <ul className="space-y-2">
                                            {day.tasks?.map((task, taskIndex) => (
                                                <li key={taskIndex} className="text-sm">
                                                    {task.action ? (
                                                        <button 
                                                            onClick={() => handleTaskClick(task)}
                                                            className="text-left text-sky-600 dark:text-sky-400 hover:underline flex items-start gap-2 group"
                                                        >
                                                            <span className="mt-1 text-sky-500">-</span>
                                                            <span>{task.description} <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span></span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                                            <span className="mt-1">-</span>
                                                            <span>{task.description}</span>
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // RENDER SETUP FORM
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">Akıllı Çalışma Planlayıcısı</h2>
                <p className="mb-6 text-slate-500 dark:text-slate-400">
                    Hedeflerinizi belirleyin. Yapay zeka, uygulama içindeki performansınızı ve seviye tespit sınavı sonuçlarınızı analiz ederek size özel bir çalışma planı oluştursun.
                </p>

                {cefrReport && (
                    <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-800 dark:text-blue-300 p-4 rounded-r-lg">
                        <p className="font-bold">Seviye Tespit Sınavı sonucunuz ({cefrReport.overallCefrLevel}) plana dahil edilecektir.</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="target-date" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Hedef Tarih</label>
                        <input
                            type="date"
                            id="target-date"
                            value={targetDate}
                            min={today}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="study-hours" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Haftalık Çalışma Süresi (saat)</label>
                        <input
                            type="number"
                            id="study-hours"
                            min="1"
                            max="40"
                            value={studyHours}
                            onChange={(e) => setStudyHours(parseInt(e.target.value))}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none text-slate-800 dark:text-slate-200"
                        />
                    </div>
                </div>
                 <ErrorMessage message={error} />
                <button
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="mt-6 w-full bg-adai-primary hover:bg-adai-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    {isLoading ? 'Plan Oluşturuluyor...' : 'Çalışma Planı Oluştur'}
                </button>
            </div>
        </div>
    );
};

export default StudyPlanner;
