import React, { useState, ReactNode, useEffect } from 'react';

// Contexts
import { useAuth } from '../context/AuthContext';
import { HistoryProvider } from '../context/HistoryContext';
import { usePdfExam } from '../context/PdfExamContext'; // Not: Bu import yolunu kontrol et. '/context' yerine './context' olabilir.

// Pages
import Dashboard from '../pages/Dashboard';
import QuestionAnalyzer from '../pages/QuestionAnalyzer';
import AITutor from '../pages/AITutor';
import Dictionary from '../pages/Dictionary';
import History from '../pages/History';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import ReadingPractice from '../pages/ReadingPractice';
import WritingAssistant from '../pages/WritingAssistant';
import VocabularyTrainer from '../pages/VocabularyTrainer';
import ListeningPractice from '../pages/ListeningPractice';
import PassageDeconstruction from '../pages/PassageDeconstruction';
import NewsReader from '../pages/NewsReader';
import ParagraphCohesionAnalyzer from '../pages/ParagraphCohesionAnalyzer';
import SentenceDiagrammer from '../pages/SentenceDiagrammer';
import StudyPlanner from '../pages/StudyPlanner';
import PDFImporter from '../pages/PDFImporter';
import VocabularyStoryWeaver from '../pages/VocabularyStoryWeaver';
import SkillTree from '../pages/SkillTree';
import SentenceOrdering from '../pages/SentenceOrdering';
import SpeakingSimulator from '../pages/SpeakingSimulator';
import PhrasalVerbDeconstructor from '../pages/PhrasalVerbDeconstructor';
import AdminPage from '../pages/AdminPage';
import TranslationAnalyst from '../pages/TranslationAnalyst';
import DialogueCompletion from '../pages/DialogueCompletion';
import VisualReadingTool from '../pages/VisualReadingTool';
import CreativeWritingPartner from '../pages/CreativeWritingPartner';
import PragmaticAnalysisTool from '../pages/PragmaticAnalysisTool';
import VisualDictionary from '../pages/VisualDictionary';
import Basics from '../pages/Basics';
import Tenses from '../pages/Tenses';
import Crossword from '../pages/Crossword';
import GrammarGaps from '../pages/GrammarGaps';
import Hangman from './pages/Hangman';




// Components
import WelcomeTour from '/components/WelcomeTour';
import { AnalyzeIcon, DictionaryIcon, HistoryIcon, DashboardIcon, LogoutIcon, TutorIcon, ReadingIcon, WritingIcon, VocabularyIcon, ListeningIcon, MenuIcon, DeconstructIcon, NewsIcon, ExamIcon, PracticeToolsIcon, CohesionIcon, DiagramIcon, PlannerIcon, PDFImporterIcon, StoryIcon, SkillTreeIcon, OrderingIcon, SpeakingSimulatorIcon, PhrasalVerbDeconstructorIcon, AdminIcon, TranslationIcon, DialogueIcon, VisualReadingIcon, CreativeWritingIcon, PragmaticIcon, VisualDictionaryIcon, BasicsIcon, TensesIcon, CrosswordIcon, GrammarGapsIcon } from '/components/icons/Icons';

// Hooks & Types
import useLocalStorage from '/hooks/useLocalStorage';
import { Tab, MockExamResultData } from '/types';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const { user, logout } = useAuth();
    const { examState } = usePdfExam();

    // State Yönetimi
    const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [tutorInitialMessage, setTutorInitialMessage] = useState<string | null>(null);
    const [theme, setTheme] = useLocalStorage<Theme>('theme-mode', 'light');
    const [hasSeenTour, setHasSeenTour] = useLocalStorage(`welcome-tour-seen-${user?.uid}`, false);
    const [showWelcomeTour, setShowWelcomeTour] = useState(false);
    const [openAccordions, setOpenAccordions] = useState<string[]>([]);

    // Effects
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        document.title = 'ADAI - Language Assistant';
    }, []);

    useEffect(() => {
        if (user && !hasSeenTour) {
            setShowWelcomeTour(true);
        }
    }, [user, hasSeenTour]);

    // Fonksiyonlar
    const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    const handleFinishTour = () => {
        setShowWelcomeTour(false);
        setHasSeenTour(true);
    };
    const handleAskTutor = (context: string) => {
        setTutorInitialMessage(context);
        handleTabClick('tutor');
    };
    const handleTabClick = (tab: Tab) => {
        setActiveTab(tab);
        setIsMenuOpen(false);
    };
    const handleExamFinish = (result: MockExamResultData) => handleTabClick('history');

    // --- GİRİŞ YAPILMAMIŞSA GÖSTERİLECEK SAYFALAR ---
    if (!user) {
        if (authPage === 'login') {
            return <LoginPage onSwitchToSignUp={() => setAuthPage('signup')} />;
        } else {
            return <SignUpPage onSwitchToLogin={() => setAuthPage('login')} />;
        }
    }

    // --- GİRİŞ YAPILDIKTAN SONRAKİ UYGULAMA İÇERİĞİ ---

    const allTabs: { [key in Tab]?: { id: Tab; label: string; icon: ReactNode } } = {
        'dashboard': { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        'skill_tree': { id: 'skill_tree', label: 'Yetenek Ağacı', icon: <SkillTreeIcon /> },
        'planner': { id: 'planner', label: 'Akıllı Planlayıcı', icon: <PlannerIcon /> },
        'tutor': { id: 'tutor', label: 'AI Eğitmen', icon: <TutorIcon /> },
        'history': { id: 'history', label: 'Geçmiş', icon: <HistoryIcon /> },
        'deconstruction': { id: 'deconstruction', label: 'Metin Analizi', icon: <DeconstructIcon /> },
        'diagrammer': { id: 'diagrammer', label: 'Cümle Görselleştirici', icon: <DiagramIcon /> },
        'cohesion_analyzer': { id: 'cohesion_analyzer', label: 'Paragraf Bağlantı Analisti', icon: <CohesionIcon /> },
        'sentence_ordering': { id: 'sentence_ordering', label: 'Cümle Sıralama', icon: <OrderingIcon /> },
        'translation_analyst': { id: 'translation_analyst', label: 'Çeviri Analisti', icon: <TranslationIcon /> },
        'pragmatic_analyzer': { id: 'pragmatic_analyzer', label: 'Pragmatik Analiz', icon: <PragmaticIcon /> },
        'dictionary': { id: 'dictionary', label: 'Sözlük', icon: <DictionaryIcon /> },
        'visual_dictionary': { id: 'visual_dictionary', label: 'Görsel Sözlük', icon: <VisualDictionaryIcon /> },
        'vocabulary': { id: 'vocabulary', label: 'Kelime Antrenörü', icon: <VocabularyIcon /> },
        'vocabulary_story_weaver': { id: 'vocabulary_story_weaver', label: 'Kelime Hikayesi', icon: <StoryIcon /> },
        'phrasal_verb_deconstructor': { id: 'phrasal_verb_deconstructor', label: 'Phrasal Verb Parçalayıcı', icon: <PhrasalVerbDeconstructorIcon /> },
        'news': { id: 'news', label: 'Etkileşimli Gündem', icon: <NewsIcon /> },
        'reading': { id: 'reading', label: 'Okuma Anlama Analizi', icon: <ReadingIcon /> },
        'visual_reading': { id: 'visual_reading', label: 'Görsel Okuma', icon: <VisualReadingIcon /> },
        'writing': { id: 'writing', label: 'Yazma Pratiği', icon: <WritingIcon /> },
        'creative_writing': { id: 'creative_writing', label: 'Creative Writing', icon: <CreativeWritingIcon /> },
        'listening': { id: 'listening', label: 'Dinleme Pratiği', icon: <ListeningIcon /> },
        'speaking_simulator': { id: 'speaking_simulator', label: 'Konuşma Simülatörü', icon: <SpeakingSimulatorIcon /> },
        'analyzer': { id: 'analyzer', label: 'Soru Analisti', icon: <AnalyzeIcon /> },
        'dialogue_completion': { id: 'dialogue_completion', label: 'Diyalog Kurucu', icon: <DialogueIcon /> },
        'pdf_importer': { id: 'pdf_importer', label: 'PDF Sınav Yükleyici', icon: <PDFImporterIcon /> },
        'basics': { id: 'basics', label: 'Temel Bilgiler', icon: <BasicsIcon /> },
        'tenses': { id: 'tenses', label: 'Zamanlar (Tenses)', icon: <TensesIcon /> },
         'crossword': { id: 'crossword', label: 'Kelime Bulmaca', icon: <CrosswordIcon /> },
         'grammar_gaps': { id: 'grammar_gaps', label: 'Grammar Gaps', icon: <GrammarGapsIcon /> },
        'hangman': { id: 'hangman', label: 'Adam Asmaca', icon: <HangmanIcon /> },
        'admin': { id: 'admin', label: 'Admin Panel', icon: <AdminIcon /> },
    };

    const adaiMenuStructure = {
        main: ['dashboard', 'skill_tree', 'planner', 'tutor'],
        accordions: [
            { key: 'practice', label: "Pratik Araçları", icon: <PracticeToolsIcon />, tabs: ['basics', 'tenses', 'visual_reading', 'writing', 'creative_writing', 'listening', 'speaking_simulator', 'crossword', 'grammar_gaps', 'hangman'] },
            { key: 'vocab', label: "Kelime ve Okuma", icon: <DictionaryIcon />, tabs: ['dictionary', 'visual_dictionary', 'vocabulary', 'vocabulary_story_weaver', 'phrasal_verb_deconstructor', 'news'] },
            { key: 'analysis', label: "Dil Analizi", icon: <DeconstructIcon />, tabs: ['deconstruction', 'diagrammer', 'translation_analyst', 'pragmatic_analyzer'] },
            { key: 'focused_analysis', label: "Odaklı Analiz", icon: <ExamIcon />, tabs: ['analyzer', 'reading', 'cohesion_analyzer', 'sentence_ordering', 'dialogue_completion', 'pdf_importer'] },
        ],
        bottom: ['history', 'admin']
    };

    const NavButton: React.FC<{ tab: Tab; label: string; icon: ReactNode }> = ({ tab, label, icon }) => (
        <button onClick={() => handleTabClick(tab)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab ? 'bg-adai-primary text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-adai-primary'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );

    const Accordion: React.FC<{ accordionKey: string; label: string; icon: ReactNode; tabs: Tab[] }> = ({ accordionKey, label, icon, tabs }) => {
        const isOpen = openAccordions.includes(accordionKey);
        const isActive = tabs.some(t => t === activeTab);
        const setIsOpen = (openState: boolean) => {
            setOpenAccordions(prev => openState ? [...prev, accordionKey] : prev.filter(k => k !== accordionKey));
        };
        const validTabs = tabs.map(tId => allTabs[tId]).filter((tab): tab is { id: Tab; label: string; icon: ReactNode } => !!tab);
        return (
            <div>
                <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${isActive ? 'bg-slate-200 dark:bg-slate-700 text-adai-primary' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-adai-primary'}`}>
                    <div className="flex items-center gap-3">{icon}{label}</div>
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                {isOpen && (<div className="pl-4 mt-1 space-y-1">{validTabs.map(tab => <NavButton key={tab.id} tab={tab.id} label={tab.label} icon={tab.icon} />)}</div>)}
            </div>
        );
    };
    
    const ThemeSwitcher: React.FC = () => (
        <button onClick={toggleTheme} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-adai-primary" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? '🌙' : '☀️'}
            <span>{theme === 'light' ? 'Koyu Mod' : 'Açık Mod'}</span>
        </button>
    );

    const SidebarContent = () => {
    const structure = adaiMenuStructure;
    
    return (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900">
            <div className="flex items-center justify-center h-20 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                    <span>ADA<span className="special-glow">I</span></span>
                </h1>
            </div>
            <nav className="flex-grow p-3 space-y-1.5 overflow-y-auto">
                {structure.main.map(tabId => {
                    const tab = allTabs[tabId as Tab];
                    return tab ? <NavButton key={tab.id} tab={tab.id} label={tab.label} icon={tab.icon} /> : null;
                })}

                {structure.accordions.map(accordion => (
                    <Accordion 
                        key={accordion.key}
                        accordionKey={accordion.key}
                        label={accordion.label}
                        icon={accordion.icon}
                        tabs={accordion.tabs as Tab[]}
                    />
                ))}

                {structure.bottom.map(tabId => {
                    // Kendi admin e-postanızı buraya yazın
                    if (tabId === 'admin' && user?.email !== 'admin@example.com') return null;
                    const tab = allTabs[tabId as Tab];
                    return tab ? <NavButton key={tab.id} tab={tab.id} label={tab.label} icon={tab.icon} /> : null;
                })}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center p-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Signed in as <strong className="text-slate-800 dark:text-slate-200">{user?.email}</strong>
                    </p>
                </div>
                <ThemeSwitcher />
                <button
                    onClick={logout}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-adai-primary"
                >
                    <LogoutIcon />
                    Çıkış Yap
                </button>
            </div>
        </div> // <-- Bütün içeriği saran tek bir ana div
    );
};

    const ReturnToExamButton: React.FC = () => (
        <button onClick={() => handleTabClick('pdf_importer')} className="fixed bottom-6 right-6 z-50 bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg animate-pulse flex items-center gap-2">
            <ExamIcon />
            <span>Sınava Dön</span>
        </button>
    );
    
    const renderContent = (): ReactNode => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard onNavigate={handleTabClick} />;
            case 'skill_tree': return <SkillTree />;
            case 'planner': return <StudyPlanner onNavigate={handleTabClick} />;
            case 'pdf_importer': return <PDFImporter onAskTutor={handleAskTutor} onExamFinish={handleExamFinish} />;
            case 'analyzer': return <QuestionAnalyzer onAskTutor={handleAskTutor} />;
            case 'tutor': return <AITutor initialMessage={tutorInitialMessage} onMessageSent={() => setTutorInitialMessage(null)} />;
            case 'reading': return <ReadingPractice onAskTutor={handleAskTutor} />;
            case 'visual_reading': return <VisualReadingTool />;
            case 'deconstruction': return <PassageDeconstruction />;
            case 'diagrammer': return <SentenceDiagrammer />;
            case 'cohesion_analyzer': return <ParagraphCohesionAnalyzer />;
            case 'sentence_ordering': return <SentenceOrdering />;
            case 'translation_analyst': return <TranslationAnalyst />;
            case 'pragmatic_analyzer': return <PragmaticAnalysisTool />;
            case 'writing': return <WritingAssistant />;
            case 'creative_writing': return <CreativeWritingPartner />;
            case 'listening': return <ListeningPractice onAskTutor={handleAskTutor} />;
            case 'speaking_simulator': return <SpeakingSimulator />;
            case 'news': return <NewsReader onAskTutor={handleAskTutor} />;
            case 'dictionary': return <Dictionary />;
            case 'visual_dictionary': return <VisualDictionary />;
            case 'dialogue_completion': return <DialogueCompletion />;
            case 'vocabulary': return <VocabularyTrainer />;
            case 'vocabulary_story_weaver': return <VocabularyStoryWeaver />;
            case 'phrasal_verb_deconstructor': return <PhrasalVerbDeconstructor />;
            case 'basics': return <Basics />;
            case 'tenses': return <Tenses />;
            case 'crossword': return <Crossword />;
            case 'grammar_gaps': return <GrammarGaps />;
            case 'hangman': return <Hangman />;
            case 'history': return <History />;
            case 'admin': return user?.email === 'admin@example.com' ? <AdminPage /> : <Dashboard onNavigate={handleTabClick} />;
            default: return <Dashboard onNavigate={handleTabClick} />;
        }
    };

    return (
        <HistoryProvider>
            {showWelcomeTour && <WelcomeTour onFinish={handleFinishTour} />}
            <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans">
                <aside className="hidden md:flex md:flex-shrink-0">
                    <div className="flex flex-col w-72 border-r border-slate-200 dark:border-slate-800">
                        <SidebarContent />
                    </div>
                </aside>
                <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div onClick={() => setIsMenuOpen(false)} className="absolute inset-0 bg-black bg-opacity-60"></div>
                    <div className={`relative flex flex-col w-72 h-full bg-slate-100 dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <SidebarContent />
                    </div>
                </div>
                <div className="flex flex-col flex-1 w-0 overflow-hidden">
                    <header className="md:hidden relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-slate-900 shadow-md items-center justify-between px-4">
                        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50"><span>ADA<span className="special-glow">I</span></span></h1>
                        <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-adai-primary hover:bg-slate-100 dark:hover:bg-slate-800"><span className="sr-only">Open menu</span><MenuIcon /></button>
                    </header>
                    <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                        <div className="p-4 sm:p-6 lg:p-10">{renderContent()}</div>
                    </main>
                    {examState.isActive && <ReturnToExamButton />}
                </div>
            </div>
        </HistoryProvider>
    );
};

export default App;
