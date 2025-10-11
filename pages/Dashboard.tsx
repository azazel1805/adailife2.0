



import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useHistory } from '../context/HistoryContext';
import { getPhrasalVerbOfTheDay, getWeatherForLocation } from '../services/geminiService';
import { Achievement, DailyChallenge, ChallengeType, PhrasalVerbOfTheDay, WeatherData, Tab } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { useChallenge } from '../context/ChallengeContext';
import { useVocabulary } from '../context/VocabularyContext';
import { VocabularyIcon, TargetIcon, FireIcon, PhrasalVerbIcon, LocationIcon, PrepositionIcon } from '../components/icons/Icons';
import { allAchievements } from '../achievements';
import Confetti from '../components/Confetti';
import { useAuth } from '../context/AuthContext';
import PrepositionVisualizerWidget from '../components/PrepositionVisualizerWidget';
import AffixOfTheDayWidget from '../components/AffixOfTheDayWidget';

// Helper hook to get the previous value of a state or prop
const usePrevious = <T,>(value: T) => {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};


interface DashboardProps {
    onNavigate: (tab: Tab) => void;
}

const Widget: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 h-full transition-all duration-300 hover:shadow-adai-primary/20 hover:-translate-y-1 ${className}`}>
    {children}
  </div>
);

const TimeAndWeatherWidget: React.FC = () => {
    const [time, setTime] = useState(new Date());
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const weatherResult = await getWeatherForLocation(latitude, longitude);
                        setWeather(JSON.parse(weatherResult));
                    } catch (error) {
                        console.error(error);
                        setLocationError("Hava durumu bilgisi alınamadı.");
                    } finally {
                        setIsLoading(false);
                    }
                },
                (error) => {
                    setLocationError("Konum izni reddedildi. Hava durumu gösterilemiyor.");
                    setIsLoading(false);
                }
            );
        } else {
            setLocationError("Tarayıcınız konum servisini desteklemiyor.");
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 w-full flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <LocationIcon />
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        {isLoading ? 'Konum alınıyor...' : weather?.city || 'Yerel Zaman'}
                    </h3>
                    {locationError && <p className="text-xs text-red-500">{locationError}</p>}
                </div>
            </div>
            <div className="flex items-center gap-6">
                 {weather && !isLoading && (
                    <div className="flex items-center gap-2 text-center">
                        <span className="text-4xl">{weather.icon}</span>
                        <div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{weather.temperature}°C</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{weather.description}</p>
                        </div>
                    </div>
                )}
                <div className="text-center sm:text-right">
                    <p className="text-4xl font-bold font-mono text-adai-primary">
                        {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>
        </div>
    );
};

const SetGoalModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSetGoal: (goal: Omit<DailyChallenge, 'id' | 'progress' | 'completed'>) => void;
}> = ({ isOpen, onClose, onSetGoal }) => {
    const [tab, setTab] = useState<'activity' | 'topic'>('activity');
    const [topic, setTopic] = useState<ChallengeType>('deconstruction');
    const [target, setTarget] = useState(3);

    const activityGoals = [
        { description: '3 soru analiz et', type: 'analyze' as ChallengeType, target: 3 },
        { description: '1 konuşma pratiği yap', type: 'speaking_simulator' as ChallengeType, target: 1 },
        { description: '1 cümle sıralama alıştırması çöz', type: 'sentence_ordering' as ChallengeType, target: 1 },
        { description: '3 yeni kelime ara', type: 'dictionary' as ChallengeType, target: 3 },
        { description: '1 okuma pratiği tamamla', type: 'reading' as ChallengeType, target: 1 },
    ];
    
    const topicGoals: { label: string; type: ChallengeType }[] = [
        { label: 'Metin Analizi Yap', type: 'deconstruction' },
        { label: 'Cümle Görselleştir', type: 'diagrammer' },
        { label: 'Paragraf Bağlantılarını Analiz Et', type: 'cohesion_analyzer' },
        { label: 'Soru Analiz Et', type: 'analyze' },
        { label: 'Diyalog Tamamla', type: 'dialogue_completion' },
    ];


    const handleSetActivityGoal = (goal: { description: string, type: ChallengeType, target: number }) => {
        onSetGoal(goal);
        onClose();
    };

    const handleSetTopicGoal = () => {
        if (target < 1) return;
        const selectedGoal = topicGoals.find(g => g.type === topic);
        if (!selectedGoal) return;
        
        const goal = {
            description: `${target} adet "${selectedGoal.label}" hedefi`,
            type: topic,
            target: target,
        };
        onSetGoal(goal);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg border-2 border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Günlük Hedefini Belirle</h3>
                    <button onClick={onClose} className="text-slate-500 dark:text-slate-400 text-2xl hover:text-slate-900 dark:hover:text-slate-50">&times;</button>
                </div>
                
                <div className="p-2 bg-slate-100 dark:bg-slate-800 m-4 rounded-lg flex gap-1">
                    <button onClick={() => setTab('activity')} className={`flex-1 p-2 text-sm font-semibold rounded-md transition-colors ${tab === 'activity' ? 'bg-adai-primary text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Aktiviteye Göre</button>
                    <button onClick={() => setTab('topic')} className={`flex-1 p-2 text-sm font-semibold rounded-md transition-colors ${tab === 'topic' ? 'bg-adai-primary text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Konuya Göre</button>
                </div>

                <div className="p-6 pt-2">
                    {tab === 'activity' ? (
                        <div className="space-y-3">
                            <h4 className="text-slate-600 dark:text-slate-400 mb-2">Bir aktivite hedefi seç:</h4>
                            {activityGoals.map(goal => (
                                <button key={goal.description} onClick={() => handleSetActivityGoal(goal)} className="w-full text-left p-4 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-adai-primary/20 transition-colors duration-200 border-2 border-slate-200 dark:border-slate-700 hover:border-adai-primary">
                                    {goal.description}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="text-slate-600 dark:text-slate-400 mb-2">Belirli bir araca odaklan:</h4>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Araç Tipi</label>
                                <select value={topic} onChange={e => setTopic(e.target.value as ChallengeType)} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-adai-primary focus:outline-none text-slate-800 dark:text-slate-200">
                                  {topicGoals.map(opt => <option key={opt.type} value={opt.type}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Hedef Sayısı</label>
                                <input type="number" min="1" max="10" value={target} onChange={e => setTarget(parseInt(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-adai-primary focus:outline-none text-slate-800 dark:text-slate-200" />
                            </div>
                            <button onClick={handleSetTopicGoal} className="w-full bg-adai-primary hover:bg-adai-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                Hedefi Ayarla
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DailyChallengeDisplay: React.FC<{ onNavigate: (tab: Tab) => void }> = ({ onNavigate }) => {
    const { challengeState, setDailyChallenge } = useChallenge();
    const { currentChallenge, streak } = challengeState;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const prevChallengeCompleted = usePrevious(currentChallenge?.completed);
    
    useEffect(() => {
        if (currentChallenge?.completed && !prevChallengeCompleted) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000); // Hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [currentChallenge?.completed, prevChallengeCompleted]);
    
    const getActionForChallenge = (challenge: DailyChallenge) => {
        switch(challenge.type) {
            case 'analyze': return () => onNavigate('analyzer');
            case 'dictionary': return () => onNavigate('dictionary');
            case 'tutor': return () => onNavigate('tutor');
            case 'reading': return () => onNavigate('reading');
            case 'writing': return () => onNavigate('writing');
            case 'listening': return () => onNavigate('listening');
            case 'sentence_ordering': return () => onNavigate('sentence_ordering');
            case 'speaking_simulator': return () => onNavigate('speaking_simulator');
            case 'deconstruction': return () => onNavigate('deconstruction');
            case 'diagrammer': return () => onNavigate('diagrammer');
            case 'cohesion_analyzer': return () => onNavigate('cohesion_analyzer');
            case 'dialogue_completion': return () => onNavigate('dialogue_completion');
            default: return () => onNavigate('dashboard');
        }
    };

    return (
      <>
        {showConfetti && <Confetti />}
        <SetGoalModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSetGoal={setDailyChallenge}
        />
        <Widget>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                  <TargetIcon />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Günlük Hedef</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-orange-500 bg-orange-400/20 px-2 py-1 rounded-full">
              <FireIcon />
              <span className="font-bold text-sm">{streak}</span>
            </div>
          </div>
          
          {!currentChallenge ? (
              <div className="text-center mt-4 flex flex-col items-center justify-center h-full">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Bugün için bir hedef belirlemedin. Hadi başlayalım!</p>
                  <button onClick={() => setIsModalOpen(true)} className="w-full px-6 py-3 bg-adai-primary hover:bg-adai-secondary text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                      Hedef Belirle
                  </button>
              </div>
          ) : currentChallenge.completed ? (
            <div className="text-center bg-green-100 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4 rounded-lg mt-4 flex flex-col items-center justify-center h-full">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-bold text-green-700 dark:text-green-300">Harika! Bugünkü görevi tamamladın.</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{currentChallenge.description}</p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col justify-between h-full">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{currentChallenge.description}</p>
              <div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div 
                    className="bg-adai-primary h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((currentChallenge.progress / currentChallenge.target) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-right text-xs text-slate-500 dark:text-slate-400 mt-1">{currentChallenge.progress} / {currentChallenge.target}</p>
                <button 
                  onClick={getActionForChallenge(currentChallenge)}
                  className="w-full mt-3 px-4 py-2 bg-adai-secondary text-white rounded-lg hover:bg-adai-primary transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Hemen Başla
                </button>
              </div>
            </div>
          )}
        </Widget>
      </>
    );
};

const PhrasalVerbWidget: React.FC = () => {
    const [data, setData] = useState<PhrasalVerbOfTheDay | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchPhrasalVerb = async () => {
            setIsLoading(true);
            setError('');
            try {
                const today = new Date().toISOString().split('T')[0];
                const cachedData = localStorage.getItem('phrasalVerbOfTheDay');
                if (cachedData) {
                    const { date, phrasalVerb } = JSON.parse(cachedData);
                    if (date === today) {
                        setData(phrasalVerb);
                        return;
                    }
                }
                const resultText = await getPhrasalVerbOfTheDay();
                const resultJson: PhrasalVerbOfTheDay = JSON.parse(resultText);
                setData(resultJson);
                localStorage.setItem('phrasalVerbOfTheDay', JSON.stringify({ date: today, phrasalVerb: resultJson }));
            } catch (e: any) {
                setError("Günün Deyimi alınamadı.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPhrasalVerb();
    }, []);

    const HighlightedSentence: React.FC<{ sentence: string; phrase: string }> = ({ sentence, phrase }) => {
        if (!phrase || !sentence) return <span>{sentence}</span>;

        const phraseParts = phrase.split(' ').filter(Boolean);
        if (phraseParts.length === 0) return <span>{sentence}</span>;

        // Escape any special regex characters in the phrase parts
        const verb = phraseParts[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const rest = phraseParts.slice(1).map(p => p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('\\s+');

        let regex;
        // If there's more than just a verb (it's a multi-word phrase), handle verb endings.
        if (rest) {
            // Regex to match the verb with common regular endings (s, ed, ing), followed by the rest of the phrase.
            // \b is a word boundary to ensure we match whole words.
            // Using a non-capturing group (?:...) for the endings so it doesn't mess up the split() result.
            regex = new RegExp(`(\\b${verb}(?:s|ed|ing)?\\s+${rest}\\b)`, 'gi');
        } else {
            // For single-word phrases, we shouldn't add verb endings as it could be wrong (e.g., 'run' -> 'runed').
            // Just match the word itself.
            regex = new RegExp(`(\\b${verb}\\b)`, 'gi');
        }
        
        // The split method with a regex containing a capture group includes the captured matches in the result array.
        // e.g., "a b c".split(/(b)/) results in ["a ", "b", " c"]. The match "b" is at an odd index.
        const sentenceParts = sentence.split(regex);
        
        // If split doesn't find anything, return the original sentence.
        if (sentenceParts.length <= 1) {
            return <span>{sentence}</span>;
        }

        return (
            <span>
                {sentenceParts.map((part, i) => {
                    // The parts that matched the regex will be at odd indices (1, 3, 5...)
                    if (part && i % 2 === 1) {
                        return (
                            <strong key={i} className="text-adai-primary font-bold bg-adai-primary/10 px-1 rounded">
                                {part}
                            </strong>
                        );
                    }
                    // The parts that did not match are at even indices.
                    return part;
                })}
            </span>
        );
    };

    return (
        <Widget>
            <div className="flex items-center gap-3 mb-4">
                <PhrasalVerbIcon />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Her Güne Bir Kelime</h3>
            </div>
            {isLoading && <Loader />}
            <ErrorMessage message={error} />
            {data && (
                <div className="space-y-3">
                    <div>
                        <h4 className="text-xl font-bold text-adai-primary capitalize">{data.phrasalVerb}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">{data.meaning}</p>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        {data.examples.map((ex, i) => (
                             <div key={i} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm">
                                <p className="text-slate-800 dark:text-slate-200">
                                    <HighlightedSentence sentence={ex.en} phrase={data.phrasalVerb} />
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
                                    {ex.tr}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Widget>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { history } = useHistory();
  const { challengeState } = useChallenge();
  const { vocabularyList } = useVocabulary();
  const { user } = useAuth();

  const unlockedAchievements = useMemo(() => {
    return allAchievements.filter(ach => ach.isUnlocked(history, vocabularyList, challengeState));
  }, [history, vocabularyList, challengeState]);

  const WelcomeHeader = () => (
    <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
  Hoşgeldin, {user?.displayName || user?.email?.split('@')[0]}!
</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Bugün İngilizce yolculuğunda ne yapmak istersin?</p>
        </div>
    </div>
  );

    const FavoritesModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const MAX_FAVORITES = 8;
    const [tempFavorites, setTempFavorites] = useState(favoriteTabs);

    const handleToggle = (tabId: Tab) => {
        setTempFavorites(prev => {
            if (prev.includes(tabId)) {
                return prev.filter(t => t !== tabId);
            } else {
                if (prev.length >= MAX_FAVORITES) {
                    // Silently fail or show a subtle message
                    return prev;
                }
                return [...prev, tabId];
            }
        });
    };

    const handleSave = () => {
        setFavoriteTabs(tempFavorites);
        onClose();
    };

    const renderToolCheckbox = (tabId: Tab) => {
        const tab = allTabs[tabId];
        // Exclude some tabs from being favorited
        if (!tab || ['dashboard', 'history', 'admin'].includes(tabId)) return null;

        const isChecked = tempFavorites.includes(tabId);
        const isDisabled = !isChecked && tempFavorites.length >= MAX_FAVORITES;
        
        return (
            <label key={tab.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${isChecked ? 'bg-adai-primary/20 border-adai-primary' : 'border-transparent bg-slate-100 dark:bg-slate-800'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input 
                    type="checkbox" 
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => handleToggle(tab.id)}
                    className="w-5 h-5 rounded text-adai-primary focus:ring-adai-secondary dark:bg-slate-700 dark:border-slate-600"
                />
                <span className="text-2xl">{tab.icon}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{tab.label}</span>
            </label>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl flex flex-col h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Hızlı Erişimi Düzenle</h3>
                    <button onClick={onClose} className="text-slate-500 dark:text-slate-400 text-2xl hover:text-slate-900 dark:hover:text-slate-50">&times;</button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    <p className="text-slate-500 dark:text-slate-400">En sık kullandığınız {MAX_FAVORITES} aracı seçin.</p>
                    
                    <div>
                         <h4 className="font-bold text-adai-primary mb-2">Ana Araçlar</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {adaiMenuStructure.main.map(tabId => renderToolCheckbox(tabId as Tab))}
                         </div>
                    </div>

                    {adaiMenuStructure.accordions.map(accordion => (
                        <div key={accordion.key}>
                            <h4 className="font-bold text-adai-primary mb-2">{accordion.label}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {accordion.tabs.map(tabId => renderToolCheckbox(tabId as Tab))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-colors">
                        İptal
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-adai-primary hover:bg-adai-secondary text-white font-bold rounded-lg transition-colors">
                        Kaydet ({tempFavorites.length}/{MAX_FAVORITES})
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const QuickAccessWidget = () => (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 flex items-center gap-2 min-h-[80px]">
        {favoriteTabs.length > 0 ? (
            <>
                <div className="flex flex-wrap items-center gap-2">
                    {favoriteTabs.map(tabId => {
                        const tab = allTabs[tabId];
                        if (!tab) return null;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onNavigate(tab.id)}
                                title={tab.label} // Tooltip shows the name
                                className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group w-16 h-16"
                            >
                                <div className="text-4xl transition-transform transform group-hover:scale-110">{tab.icon}</div>
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => setIsFavoritesModalOpen(true)}
                    title="Hızlı Erişimi Düzenle"
                    className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-auto self-center"
                >
                    <EditIcon />
                </button>
            </>
        ) : (
            <div className="flex items-center justify-center text-center p-2 w-full">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Favori araçlarınızı buraya ekleyerek hızlıca erişin.</p>
                <button
                    onClick={() => setIsFavoritesModalOpen(true)}
                    className="ml-4 bg-adai-primary hover:bg-adai-secondary text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md"
                >
                    Favori Ekle
                </button>
            </div>
        )}
    </div>
);

  const VocabularyWidget = () => (
    <Widget>
        <div className="flex items-center gap-3 mb-4">
            <VocabularyIcon />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Kelime Hazinesi</h3>
        </div>
            <div className="text-center">
            <p className="text-5xl font-bold text-adai-primary">{vocabularyList.length}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">kayıtlı kelime</p>
            <button
                onClick={() => onNavigate(vocabularyList.length > 0 ? 'vocabulary' : 'dictionary')}
                className="w-full px-6 py-2 bg-adai-secondary text-white rounded-lg hover:bg-adai-primary transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                {vocabularyList.length > 0 ? 'Pratik Yap' : 'Kelime Ekle'}
            </button>
            </div>
    </Widget>
  );
  
  const AchievementsWidget = () => (
    <Widget>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Başarımlar ({unlockedAchievements.length}/{allAchievements.length})</h3>
        {unlockedAchievements.length > 0 ? (
            <div className="flex flex-wrap gap-4">
            {unlockedAchievements.slice(0, 6).map(ach => (
                <div key={ach.id} className="text-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg transform hover:scale-110 transition-transform duration-200 w-20" title={ach.description}>
                <div className="text-4xl">{ach.icon}</div>
                <p className="text-xs font-bold mt-1 h-8 flex items-center justify-center leading-tight text-slate-700 dark:text-slate-300">{ach.title}</p>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">Henüz bir başarım kazanmadın. Çalışmaya devam et!</p>
        )}
    </Widget>
  );

  return (
      <div className="space-y-8">
          <FavoritesModal isOpen={isFavoritesModalOpen} onClose={() => setIsFavoritesModalOpen(false)} />
          <WelcomeHeader />
          <QuickAccessWidget />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                  <TimeAndWeatherWidget />
              </div>
              <div className="lg:col-span-1">
                  <DailyChallengeDisplay onNavigate={onNavigate} />
              </div>
              <div className="lg:col-span-1">
                  <VocabularyWidget />
              </div>
              <div className="lg:col-span-1">
                  <PhrasalVerbWidget />
              </div>
               <div className="lg:col-span-1">
                  <PrepositionVisualizerWidget />
              </div>
              <div className="lg:col-span-2">
                 <AffixOfTheDayWidget />
              </div>
              <div className="lg:col-span-2">
                  <AchievementsWidget />
              </div>
          </div>
      </div>
  );
};

export default Dashboard;
