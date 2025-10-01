import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HistoryItem, MockExamResultData, VocabularyItem, ChallengeState } from '../types';

interface UserData {
    history: HistoryItem[];
    exams: MockExamResultData[];
    vocabulary: VocabularyItem[];
    challenge: ChallengeState | null;
}

const AdminPage: React.FC = () => {
    const { user, users } = useAuth();
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedUser) {
            setIsLoading(true);
            try {
                const historyRaw = localStorage.getItem(`yds-analysis-history-${selectedUser}`);
                const examsRaw = localStorage.getItem(`yds-exam-history-${selectedUser}`);
                const vocabularyRaw = localStorage.getItem(`vocabulary-list-${selectedUser}`);
                const challengeRaw = localStorage.getItem(`challenge-state-${selectedUser}`);

                const loadedData: UserData = {
                    history: historyRaw ? JSON.parse(historyRaw) : [],
                    exams: examsRaw ? JSON.parse(examsRaw) : [],
                    vocabulary: vocabularyRaw ? JSON.parse(vocabularyRaw) : [],
                    challenge: challengeRaw ? JSON.parse(challengeRaw) : null,
                };
                setUserData(loadedData);
            } catch (error) {
                console.error("Error loading user data from localStorage:", error);
                setUserData(null);
            } finally {
                setIsLoading(false);
            }
        } else {
            setUserData(null);
        }
    }, [selectedUser]);

    if (user !== 'admin') {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="text-slate-500 dark:text-slate-400">You do not have permission to view this page.</p>
            </div>
        );
    }

    const otherUsers = users.filter(u => u.toLowerCase() !== 'admin');

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-200">Admin Panel</h2>
                <p className="mb-4 text-slate-500 dark:text-slate-400">Select a user to view their interaction history.</p>
                <select
                    value={selectedUser || ''}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full max-w-sm p-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none text-slate-900 dark:text-slate-200"
                >
                    <option value="" disabled>Select a user...</option>
                    {otherUsers.map(u => (
                        <option key={u} value={u}>{u}</option>
                    ))}
                </select>
            </div>

            {isLoading && <div className="text-center p-8">Loading user data...</div>}

            {!selectedUser && (
                <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                    Please select a user to see their data.
                </div>
            )}
            
            {selectedUser && userData && !isLoading && (
                 <div className="space-y-6">
                    {/* Challenge State */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-brand-primary mb-3">Daily Challenge Status</h3>
                        {userData.challenge ? (
                             <div className="flex items-center gap-6">
                                <p><strong>🔥 Streak:</strong> {userData.challenge.streak}</p>
                                <p><strong>🗓️ Last Completed:</strong> {userData.challenge.lastCompletedDate || 'N/A'}</p>
                                {userData.challenge.currentChallenge && (
                                    <p><strong>🎯 Today's Goal:</strong> {userData.challenge.currentChallenge.description} ({userData.challenge.currentChallenge.progress}/{userData.challenge.currentChallenge.target})</p>
                                )}
                            </div>
                        ) : <p className="text-slate-500 dark:text-slate-400">No challenge data available.</p>}
                    </div>

                    {/* Analysis History */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-brand-primary mb-3">Analysis History ({userData.history.length})</h3>
                        {userData.history.length > 0 ? (
                            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {userData.history.map(item => (
                                    <li key={item.id} className="bg-gray-100 p-3 rounded-md text-sm">
                                        <p className="font-semibold truncate">{item.question}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.timestamp} - {item.analysis.soruTipi}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-slate-500 dark:text-slate-400">No analysis history found.</p>}
                    </div>
                    
                    {/* Exam History */}
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-brand-primary mb-3">Mock Exam History ({userData.exams.length})</h3>
                        {userData.exams.length > 0 ? (
                            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {userData.exams.map(exam => (
                                    <li key={exam.id} className="bg-gray-100 p-3 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{exam.timestamp}</p>
                                            <p className="font-bold text-lg">{exam.score} / {exam.totalQuestions}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-slate-500 dark:text-slate-400">No exam history found.</p>}
                    </div>
                    
                    {/* Vocabulary List */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-brand-primary mb-3">Saved Vocabulary ({userData.vocabulary.length})</h3>
                         {userData.vocabulary.length > 0 ? (
                            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {userData.vocabulary.map(item => (
                                    <li key={item.id} className="bg-gray-100 p-3 rounded-md text-sm">
                                        <span className="font-semibold capitalize">{item.word}: </span>
                                        <span>{item.meaning}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-slate-500 dark:text-slate-400">No saved words found.</p>}
                    </div>

                 </div>
            )}
        </div>
    );
};

export default AdminPage;