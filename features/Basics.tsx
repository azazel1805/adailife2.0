import React, { useState, useEffect, useCallback } from 'react';
import { SpeakerIcon, VerbToBeIcon, QAIcon, SentenceBuilderIcon } from '../components/icons/Icons';
import { verbToBeData, ToBeData } from '../data/verbToBeData';
import Loader from '../components/Loader';

type BasicsModule = 'colors' | 'numbers' | 'alphabet' | 'days' | 'dates' | 'seasons' | 'time' | 'verbToBe' | 'questionFormer' | 'sentenceBuilder';

const PEXELS_API_KEY = 'BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq';

const moduleData = {
    colors: { title: 'Renkleri Öğren', icon: '🎨', description: 'Renkleri ve okunuşlarını keşfet.' },
    numbers: { title: 'Sayıları Öğren', icon: '🔢', description: '0-100 arası sayıları ve okunuşlarını keşfet.' },
    alphabet: { title: 'Etkileşimli Alfabe', icon: '🔤', description: 'Harflerin telaffuzunu dinle.' },
    days: { title: 'Haftanın Günleri', icon: '🗓️', description: 'Günlerin telaffuzunu ve sırasını öğren.' },
    dates: { title: 'Tarih Okuma', icon: '📅', description: 'Seçtiğin tarihi İngilizce olarak dinle.' },
    seasons: { title: 'Mevsimler Rehberi', icon: '☀️', description: 'Ayların hangi mevsime ait olduğunu gör.' },
    time: { title: 'Dijital Saat Okuma', icon: '⏰', description: 'Ayarladığın saati İngilizce olarak dinle.' },
    verbToBe: { title: 'Verb "to be"', icon: <VerbToBeIcon />, description: 'En temel fiilin kullanımını öğren.' },
    questionFormer: { title: 'Soru Oluşturma Alıştırması', icon: <QAIcon />, description: 'Altı çizili öğeyi soran doğru soruyu oluştur.' },
    sentenceBuilder: { title: 'İnteraktif Cümle Kurucu', icon: <SentenceBuilderIcon />, description: 'Kelimeleri sürükleyip bırakarak basit cümleler kur.' },
};

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const seasonsData: { [key: string]: string[] } = {
    Winter: ['December', 'January', 'February'],
    Spring: ['March', 'April', 'May'],
    Summer: ['June', 'July', 'August'],
    Autumn: ['September', 'October', 'November']
};

const speak = (text: string) => {
    if (typeof window.speechSynthesis === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
};


// Mini-Apps
const ColorExplorer: React.FC = () => {
    const colors = [
        { name: 'red', hex: '#ef4444', tr: 'Kırmızı', textColor: 'text-white' },
        { name: 'blue', hex: '#3b82f6', tr: 'Mavi', textColor: 'text-white' },
        { name: 'green', hex: '#22c55e', tr: 'Yeşil', textColor: 'text-white' },
        { name: 'yellow', hex: '#eab308', tr: 'Sarı', textColor: 'text-black' },
        { name: 'orange', hex: '#f97316', tr: 'Turuncu', textColor: 'text-white' },
        { name: 'purple', hex: '#a855f7', tr: 'Mor', textColor: 'text-white' },
        { name: 'pink', hex: '#ec4899', tr: 'Pembe', textColor: 'text-black' },
        { name: 'black', hex: '#000000', tr: 'Siyah', textColor: 'text-white' },
        { name: 'white', hex: '#ffffff', tr: 'Beyaz', textColor: 'text-black' },
        { name: 'gray', hex: '#6b7280', tr: 'Gri', textColor: 'text-white' },
        { name: 'brown', hex: '#78350f', tr: 'Kahverengi', textColor: 'text-white' },
        { name: 'cyan', hex: '#06b6d4', tr: 'Camgöbeği', textColor: 'text-black' }
    ];

    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-center">Colors</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {colors.map(color => (
                    <button 
                        key={color.name}
                        onClick={() => speak(color.name)}
                        style={{ backgroundColor: color.hex, border: color.name === 'white' ? '1px solid #ccc' : 'none' }}
                        className={`p-4 h-32 rounded-lg flex flex-col justify-between items-start transition transform hover:scale-105 ${color.textColor}`}
                    >
                        <div className="text-left">
                            <p className="text-lg font-bold capitalize">{color.name}</p>
                            <p className="text-sm opacity-80">{color.tr}</p>
                        </div>
                        <SpeakerIcon />
                    </button>
                ))}
            </div>
        </div>
    );
};

const NumberExplorer: React.FC = () => {
    const numbers = [
        { num: 0, word: 'zero' }, { num: 1, word: 'one' }, { num: 2, word: 'two' }, { num: 3, word: 'three' },
        { num: 4, word: 'four' }, { num: 5, word: 'five' }, { num: 6, word: 'six' }, { num: 7, word: 'seven' },
        { num: 8, word: 'eight' }, { num: 9, word: 'nine' }, { num: 10, word: 'ten' }, { num: 11, word: 'eleven' },
        { num: 12, word: 'twelve' }, { num: 13, word: 'thirteen' }, { num: 14, word: 'fourteen' }, { num: 15, word: 'fifteen' },
        { num: 16, word: 'sixteen' }, { num: 17, word: 'seventeen' }, { num: 18, word: 'eighteen' }, { num: 19, word: 'nineteen' },
        { num: 20, word: 'twenty' }, { num: 30, word: 'thirty' }, { num: 40, word: 'forty' }, { num: 50, word: 'fifty' },
        { num: 60, word: 'sixty' }, { num: 70, word: 'seventy' }, { num: 80, word: 'eighty' }, { num: 90, word: 'ninety' },
        { num: 100, word: 'one hundred' }
    ];

    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-center">Numbers 0-100</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {numbers.map(({ num, word }) => (
                    <button key={num} onClick={() => speak(word)}
                        className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center transition transform hover:scale-105 hover:bg-adai-primary hover:text-white">
                        <p className="text-3xl font-bold">{num}</p>
                        <p className="text-sm capitalize font-semibold">{word}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const InteractiveAlphabet: React.FC = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-center">Interactive Alphabet</h3>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {alphabet.map(letter => (
                    <button key={letter} onClick={() => speak(letter)}
                        className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-2xl hover:bg-adai-primary hover:text-white transition">
                        {letter}
                    </button>
                ))}
            </div>
        </div>
    );
};

const DaysOfWeek: React.FC = () => {
    const days = [
        { en: 'Monday', tr: 'Pazartesi' }, { en: 'Tuesday', tr: 'Salı' }, { en: 'Wednesday', tr: 'Çarşamba' },
        { en: 'Thursday', tr: 'Perşembe' }, { en: 'Friday', tr: 'Cuma' }, { en: 'Saturday', tr: 'Cumartesi' },
        { en: 'Sunday', tr: 'Pazar' }
    ];

    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-center">Days of the Week</h3>
            <div className="space-y-3">
                {days.map(day => (
                    <button key={day.en} onClick={() => speak(day.en)}
                        className="w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-lg flex justify-between items-center transition transform hover:scale-105 hover:bg-adai-primary hover:text-white">
                        <div className="text-left">
                            <p className="text-lg font-bold">{day.en}</p>
                            <p className="text-sm opacity-80">{day.tr}</p>
                        </div>
                        <SpeakerIcon />
                    </button>
                ))}
            </div>
        </div>
    );
};

const DateReader: React.FC = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [outputText, setOutputText] = useState('');

    const getOrdinal = (n: number): string => {
        if (n > 3 && n < 21) return n + 'th';
        switch (n % 10) {
            case 1:  return n + "st";
            case 2:  return n + "nd";
            case 3:  return n + "rd";
            default: return n + "th";
        }
    };
    
    const handleReadDate = () => {
        const d = new Date(date + 'T00:00:00');
        const day = d.getDate();
        const monthIndex = d.getMonth();
        const year = d.getFullYear();

        const dayWithOrdinal = getOrdinal(day);
        const monthName = months[monthIndex];

        const result = `It is the ${dayWithOrdinal} of ${monthName}, ${year}.`;
        setOutputText(result);
        speak(result);
    };

    return (
        <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Select a Date</h3>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg"
            />
            <button onClick={handleReadDate} className="mt-4 w-full bg-adai-primary text-white font-bold py-3 rounded-lg">
                Read Date 🔊
            </button>
            {outputText && (
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p className="font-semibold">{outputText}</p>
                </div>
            )}
        </div>
    );
};

const SeasonsGuide: React.FC = () => {
    const seasonColors: { [key: string]: string } = {
        Winter: 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300',
        Spring: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
        Summer: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
        Autumn: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300',
    };
    const seasonIcons: { [key: string]: string } = { Winter: '❄️', Spring: '🌸', Summer: '☀️', Autumn: '🍂' };

    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-center">Seasons Guide</h3>
            <div className="space-y-4">
                {Object.entries(seasonsData).map(([season, seasonMonths]) => (
                    <div key={season}>
                        <button onClick={() => speak(season)} className="text-left w-full p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <h4 className={`text-lg font-bold ${seasonColors[season as keyof typeof seasonColors].split(' ')[2]}`}>
                                {season} {seasonIcons[season as keyof typeof seasonIcons]} 🔊
                            </h4>
                        </button>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {seasonMonths.map(month => (
                                <button key={month} onClick={() => speak(month)} className={`p-3 rounded-lg text-center font-semibold transition transform hover:scale-105 ${seasonColors[season as keyof typeof seasonColors]}`}>
                                    {month}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DigitalTimeReader: React.FC = () => {
    const [time, setTime] = useState('03:10');
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
    const [outputText, setOutputText] = useState('');
    const [showAmPmInfo, setShowAmPmInfo] = useState(false);
    
    const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];

    const convertNumberToWord = (n: number): string => {
        if (n < 20) return units[n];
        const ten = Math.floor(n / 10);
        const unit = n % 10;
        return tens[ten] + (unit > 0 ? ' ' + units[unit] : '');
    };

    const handleReadTime = () => {
        const [hourStr, minuteStr] = time.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        if (hour === 0) hour = 12;
        if (hour > 12) hour -= 12;

        const hourWord = convertNumberToWord(hour);
        let minutePart: string;

        if (minute === 0) {
            minutePart = "o'clock";
        } else if (minute < 10) {
            minutePart = `oh ${convertNumberToWord(minute)}`;
        } else {
            minutePart = convertNumberToWord(minute);
        }
        
        const result = `It is ${hourWord} ${minute === 0 ? '' : minutePart} ${period}.`.replace(" o'clock", "o'clock");
        setOutputText(result);
        speak(result);
    };

    return (
        <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Set the Time</h3>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg mb-3"
            />
             <div className="flex justify-center items-center gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="period" value="AM" checked={period === 'AM'} onChange={() => setPeriod('AM')} className="w-4 h-4 text-adai-primary bg-slate-100 border-slate-300 focus:ring-adai-primary" /> AM
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="period" value="PM" checked={period === 'PM'} onChange={() => setPeriod('PM')} className="w-4 h-4 text-adai-primary bg-slate-100 border-slate-300 focus:ring-adai-primary" /> PM
                </label>
                 <button onClick={() => setShowAmPmInfo(!showAmPmInfo)} className="text-lg font-bold text-sky-500 rounded-full w-6 h-6 flex items-center justify-center bg-sky-100 dark:bg-sky-900/40 hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors">
                    ?
                </button>
            </div>
            
            {showAmPmInfo && (
                <div className="p-3 mb-4 bg-sky-50 dark:bg-sky-900/40 border border-sky-200 dark:border-sky-800 rounded-lg text-sm text-left animate-fade-in">
                    <p><strong>☀️ AM (ante meridiem):</strong> Gece yarısından (00:00) öğlene (12:00) kadar olan zaman dilimi. <span className="italic">(Sabah)</span></p>
                    <p className="mt-2"><strong>🌙 PM (post meridiem):</strong> Öğleden (12:00) gece yarısına (00:00) kadar olan zaman dilimi. <span className="italic">(Öğleden sonra / Akşam)</span></p>
                </div>
            )}

            <button onClick={handleReadTime} className="w-full bg-adai-primary text-white font-bold py-3 rounded-lg">
                Read Time 🔊
            </button>
            {outputText && (
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p className="font-semibold">{outputText}</p>
                </div>
            )}
        </div>
    );
};

const VerbToBeExplainer: React.FC = () => {
    const [activeSection, setActiveSection] = useState<ToBeData>(verbToBeData[0]);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);

    useEffect(() => {
        const fetchImage = async () => {
            if (!activeSection.pexelsQuery) {
                setImageUrl('');
                return;
            }
            setIsLoadingImage(true);
            try {
                const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(activeSection.pexelsQuery)}&per_page=1&orientation=landscape`, {
                    headers: { Authorization: PEXELS_API_KEY }
                });
                if (!response.ok) throw new Error('Pexels API error');
                const data = await response.json();
                setImageUrl(data.photos && data.photos.length > 0 ? data.photos[0].src.large : '');
            } catch (error) {
                console.error("Error fetching Pexels image:", error);
                setImageUrl('');
            } finally {
                setIsLoadingImage(false);
            }
        };
        fetchImage();
    }, [activeSection]);

    const Example: React.FC<{ sentence: { en: string, tr: string } }> = ({ sentence }) => (
        <>
            <p className="flex items-center gap-2">
                <span>{sentence.en}</span>
                <button onClick={() => speak(sentence.en)} className="text-lg p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><SpeakerIcon /></button>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">{sentence.tr}</p>
        </>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-center gap-2 mb-4">
                {verbToBeData.map(section => (
                    <button
                        key={section.tense}
                        onClick={() => setActiveSection(section)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeSection.tense === section.tense ? 'bg-adai-primary text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'}`}
                    >
                        {section.tense}
                    </button>
                ))}
            </div>

            <div className="text-center">
                <h3 className="text-3xl font-bold text-adai-primary">{activeSection.forms} <span className="text-2xl">{activeSection.emoji}</span></h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">{activeSection.explanation}</p>
            </div>

            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                {isLoadingImage ? <Loader /> : imageUrl ? <img src={imageUrl} alt={activeSection.pexelsQuery} className="w-full h-full object-cover" /> : <p className="text-slate-500">Görsel bulunamadı.</p>}
            </div>

            {activeSection.usage && activeSection.usage.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Kullanım Alanları</h4>
                    <div className="space-y-3">
                        {activeSection.usage.map((useCase, index) => (
                            <div key={index} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                                <h5 className="font-bold text-adai-primary">{useCase.title}</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{useCase.description}</p>
                                <Example sentence={useCase.example} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Çekim Örnekleri</h4>
                <div className="space-y-4">
                    {activeSection.examples.map(ex => (
                         <div key={ex.person} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                            <h5 className="font-bold text-adai-primary mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">{ex.person}</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div><strong className="text-green-600">(+)</strong><div className="mt-1"><Example sentence={ex.positive} /></div></div>
                                <div><strong className="text-red-600">(-)</strong><div className="mt-1"><Example sentence={ex.negative} /></div></div>
                                <div><strong className="text-blue-600">(?)</strong><div className="mt-1"><Example sentence={ex.question} /></div></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const QuestionFormer: React.FC = () => {
    const exercises = [
        { statement: 'I watch a film every night.', underlinedPart: 'a film', correctQuestion: 'What do you watch every night?' },
        { statement: 'She goes to the library on Mondays.', underlinedPart: 'on Mondays', correctQuestion: 'How often does she go to the library?' },
        { statement: 'He is playing in the garden.', underlinedPart: 'in the garden', correctQuestion: 'Where is he playing?' },
        { statement: 'They are happy because they won the game.', underlinedPart: 'because they won the game', correctQuestion: 'Why are they happy?' },
        { statement: 'Michael drove his new car.', underlinedPart: 'Michael', correctQuestion: 'Who drove his new car?' },
        { "statement": "The keys are on the table.", "underlinedPart": "on the table", "correctQuestion": "Where are the keys?" },
        { "statement": "He is a doctor.", "underlinedPart": "a doctor", "correctQuestion": "What is his job?" },
        { "statement": "She was at home yesterday.", "underlinedPart": "yesterday", "correctQuestion": "When was she at home?" },
        { "statement": "They live in London.", "underlinedPart": "in London", "correctQuestion": "Where do they live?" },
        { "statement": "He reads the newspaper in the morning.", "underlinedPart": "in the morning", "correctQuestion": "When does he read the newspaper?" },
        { "statement": "Maria works at the bank.", "underlinedPart": "Maria", "correctQuestion": "Who works at the bank?" },
        { "statement": "We go to the gym twice a week.", "underlinedPart": "twice a week", "correctQuestion": "How often do you go to the gym?" },
        { "statement": "I am reading a history book.", "underlinedPart": "a history book", "correctQuestion": "What are you reading?" },
        { "statement": "She is waiting for the bus.", "underlinedPart": "the bus", "correctQuestion": "What is she waiting for?" },
        { "statement": "They are crying because their team lost.", "underlinedPart": "because their team lost", "correctQuestion": "Why are they crying?" },
        { "statement": "He can play the guitar very well.", "underlinedPart": "very well", "correctQuestion": "How can he play the guitar?" },
        { "statement": "She can meet you at the coffee shop.", "underlinedPart": "at the coffee shop", "correctQuestion": "Where can she meet me?" },
        { "statement": "They can speak two languages.", "underlinedPart": "two languages", "correctQuestion": "What can they speak?" },
        { "statement": "I bought a new shirt yesterday.", "underlinedPart": "yesterday", "correctQuestion": "When did you buy a new shirt?" },
        { "statement": "She went to the party with her friends.", "underlinedPart": "with her friends", "correctQuestion": "Who did she go to the party with?" },
        { "statement": "He finished his homework at 10 PM.", "underlinedPart": "at 10 PM", "correctQuestion": "What time did he finish his homework?" },
        { "statement": "They travelled to Rome by plane.", "underlinedPart": "by plane", "correctQuestion": "How did they travel to Rome?" }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const currentExercise = exercises[currentIndex];

    const renderSentence = () => {
        const parts = currentExercise.statement.split(currentExercise.underlinedPart);
        return (
            <p className="text-xl font-semibold text-center bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                {parts[0]}
                <strong className="underline decoration-adai-primary decoration-4 underline-offset-4">{currentExercise.underlinedPart}</strong>
                {parts[1]}
            </p>
        );
    };

    const normalizeAnswer = (str: string) => {
        return str.trim().toLowerCase().replace(/\?$/, '');
    };

    const handleCheck = () => {
        if (normalizeAnswer(userAnswer) === normalizeAnswer(currentExercise.correctQuestion)) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % exercises.length);
        setUserAnswer('');
        setFeedback(null);
    };

    return (
        <div className="space-y-6 text-center">
             <p className="text-slate-500 dark:text-slate-400">Cümlede altı çizili bölümü soracak şekilde İngilizce soru cümlesini yazın.</p>
            {renderSentence()}
            <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Sorunuzu buraya yazın..."
                disabled={feedback !== null}
                className="w-full p-3 text-lg bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none"
            />

            {feedback && (
                 <div className={`p-3 rounded-lg font-bold text-white ${feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {feedback === 'correct' ? (
                        '🎉 Doğru!'
                    ) : (
                        <>
                            <p>Tam değil. Doğru cevap:</p>
                            <p className="font-mono mt-1">"{currentExercise.correctQuestion}"</p>
                        </>
                    )}
                </div>
            )}
            
            {feedback !== null ? (
                 <button onClick={handleNext} className="w-full bg-adai-primary text-white font-bold py-3 rounded-lg">
                    Sonraki Soru &rarr;
                </button>
            ) : (
                <button onClick={handleCheck} disabled={!userAnswer.trim()} className="w-full bg-adai-primary text-white font-bold py-3 rounded-lg disabled:bg-slate-400">
                    Kontrol Et
                </button>
            )}
        </div>
    );
};

const SentenceBuilder: React.FC = () => {
    const sentenceData = [
        { tr: 'Ben bir öğrenci değilim.', en: 'I am not a student .' }, // Olumsuz
        { tr: 'Sen mutlu musun ?', en: 'Are you happy ?' }, // Soru
        { tr: 'O bir doktor.', en: 'He is a doctor .' }, // Olumlu
        { tr: 'Hava bugün güzel mi ?', en: 'Is the weather nice today ?' }, // Soru
        { tr: 'Biz hazır değiliz.', en: 'We are not ready .' }, // Olumsuz
        { tr: 'Onlar bahçedeler.', en: 'They are in the garden .' }, // Olumlu
        { tr: 'Bu bir kitap değil.', en: 'This is not a book .' }, // Olumsuz
        { tr: 'Annen bir öğretmen mi ?', en: 'Is your mother a teacher ?' }, // Soru

        // --- Present Simple ---
        { tr: 'O, elma sevmez.', en: 'She does not like apples .' }, // Olumsuz
        { tr: 'Sen İngilizce konuşur musun ?', en: 'Do you speak English ?' }, // Soru
        { tr: 'Köpek hızlı koşar.', en: 'The dog runs fast .' }, // Olumlu
        { tr: 'O bir ofiste çalışmıyor.', en: 'He does not work in an office .' }, // Olumsuz
        { tr: 'Onlar Londra\'da mı yaşarlar ?', en: 'Do they live in London ?' }, // Soru
        { tr: 'Ben her gün süt içerim.', en: 'I drink milk every day .' }, // Olumlu
        { tr: 'Kediler balık sever mi ?', en: 'Do cats like fish ?' }, // Soru
        { tr: 'Biz erken uyanmayız.', en: 'We do not wake up early .' }, // Olumsuz

        // --- Present Continuous ---
        { tr: 'Biz futbol oynuyor muyuz ?', en: 'Are we playing football ?' }, // Soru
        { tr: 'Onlar kitap okuyorlar.', en: 'They are reading books .' }, // Olumlu
        { tr: 'O televizyon izlemiyor.', en: 'He is not watching TV .' }, // Olumsuz
        { tr: 'O akşam yemeği mi pişiriyor ?', en: 'Is she cooking dinner ?' }, // Soru
        { tr: 'Dışarıda yağmur yağmıyor.', en: 'It is not raining outside .' }, // Olumsuz
        { tr: 'Sen müzik mi dinliyorsun ?', en: 'Are you listening to music ?' }, // Soru
        { tr: 'Bebek uyuyor.', en: 'The baby is sleeping .' }, // Olumlu
        { tr: 'Ben kahve içmiyorum.', en: 'I am not drinking coffee .' }, // Olumsuz
        
        // --- 'will' (Future Simple) ---
        { tr: 'Seni yarın aramayacağım.', en: 'I will not call you tomorrow .' }, // Olumsuz
        { tr: 'O partiye gelecek mi ?', en: 'Will he come to the party ?' }, // Soru
        { tr: 'O yeni bir elbise alacak.', en: 'She will buy a new dress .' }, // Olumlu
        { tr: 'Yarın hava güneşli olmayacak.', en: 'It will not be sunny tomorrow .' }, // Olumsuz
        { tr: 'Onlar projeyi bitirecekler mi ?', en: 'Will they finish the project ?' }, // Soru
        { tr: 'Biz onları ziyaret edeceğiz.', en: 'We will visit them .' }, // Olumlu
        { tr: 'Bu filmi sevecek misin ?', en: 'Will you love this movie ?' }, // Soru
        
        // --- 'can' ---
        { tr: 'Ben yüzemem.', en: 'I cannot swim .' }, // Olumsuz
        { tr: 'O gitar çalabilir mi ?', en: 'Can she play the guitar ?' }, // Soru
        { tr: 'O hızlı koşabilir.', en: 'He can run fast .' }, // Olumlu
        { tr: 'Sana yardım edebilir miyiz ?', en: 'Can we help you ?' }, // Soru
        { tr: 'Onlar Fransızca konuşamazlar.', en: 'They cannot speak French .' }, // Olumsuz
        { tr: 'Pencereyi açabilir misin ?', en: 'Can you open the window ?' }, // Soru
        { tr: 'Kuşlar uçabilir.', en: 'Birds can fly .' }, // Olumlu

        // --- Past Simple ---
        { tr: 'Dün sinemaya gitmedim.', en: 'I did not go to the cinema yesterday .' }, // Olumsuz
        { tr: 'O sınav için çalıştı mı ?', en: 'Did she study for the exam ?' }, // Soru
        { tr: 'O yeni bir telefon aldı.', en: 'He bought a new phone .' }, // Olumlu
        { tr: 'Biz güzel bir film izlemedik.', en: 'We did not watch a great movie .' }, // Olumsuz
        { tr: 'Onlar ailelerini ziyaret ettiler mi ?', en: 'Did they visit their family ?' }, // Soru
        { tr: 'Ödevini bitirdin mi ?', en: 'Did you finish your homework ?' }, // Soru
        { tr: 'Dün yağmur yağmadı.', en: 'It did not rain yesterday .' } // Olumsuz
    ];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [wordPool, setWordPool] = useState<string[]>([]);
    const [sentenceArea, setSentenceArea] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    useEffect(() => {
        const currentWords = sentenceData[currentIndex].en.split(' ');
        setWordPool([...currentWords].sort(() => Math.random() - 0.5));
        setSentenceArea([]);
        setFeedback(null);
    }, [currentIndex]);
    
    const handleCheck = () => {
        if (sentenceArea.join(' ') === sentenceData[currentIndex].en) {
            setFeedback('correct');
            speak('Correct!');
        } else {
            setFeedback('incorrect');
            speak('Try again.');
        }
    };
    
    const handleNext = () => setCurrentIndex(prev => (prev + 1) % sentenceData.length);
    const handleReset = () => {
        setSentenceArea([]);
        setWordPool([...sentenceData[currentIndex].en.split(' ')].sort(() => Math.random() - 0.5));
        setFeedback(null);
    };

    return (
        <div className="text-center">
            <p className="mb-2 text-slate-500 dark:text-slate-400">Türkçe cümlenin İngilizce karşılığını kelimeleri doğru sıraya koyarak oluşturun.</p>
            <p className="text-lg font-bold mb-4 text-adai-primary">"{sentenceData[currentIndex].tr}"</p>
            
            <div className="min-h-[6rem] bg-slate-200 dark:bg-slate-800 p-4 rounded-lg flex flex-wrap gap-2 items-center justify-center border-2 border-dashed border-slate-400">
                {sentenceArea.map((word, i) => (
                    <button key={i} onClick={() => { setSentenceArea(p => p.filter((_, idx) => idx !== i)); setWordPool(p => [...p, word]); }} className="px-4 py-2 bg-white dark:bg-slate-700 rounded-md font-semibold cursor-pointer">{word}</button>
                ))}
            </div>

            <div className="my-4 text-2xl font-bold">↓</div>
            
            <div className="min-h-[6rem] bg-slate-100 dark:bg-slate-700 p-4 rounded-lg flex flex-wrap gap-2 items-center justify-center">
                 {wordPool.map((word, i) => (
                    <button key={i} onClick={() => { setWordPool(p => p.filter((_, idx) => idx !== i)); setSentenceArea(p => [...p, word]); }} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-md font-semibold cursor-pointer">{word}</button>
                ))}
            </div>
            
            {feedback && (
                <div className={`mt-4 p-2 rounded-lg font-bold text-white ${feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {feedback === 'correct' ? '🎉 Doğru!' : '❌ Tekrar Dene'}
                </div>
            )}

            <div className="mt-4 flex gap-2">
                <button onClick={handleReset} className="flex-1 bg-slate-500 text-white py-2 rounded-lg">Sıfırla</button>
                {feedback === 'correct' ? (
                    <button onClick={handleNext} className="flex-1 bg-green-600 text-white py-2 rounded-lg">Sonraki Cümle &rarr;</button>
                ) : (
                    <button onClick={handleCheck} disabled={sentenceArea.length === 0} className="flex-1 bg-adai-primary text-white py-2 rounded-lg disabled:bg-slate-400">Kontrol Et</button>
                )}
            </div>
        </div>
    );
};

const ModuleModal: React.FC<{ module: BasicsModule; onClose: () => void }> = ({ module, onClose }) => {
    const { title } = moduleData[module];

    const renderModule = () => {
        switch (module) {
            case 'colors': return <ColorExplorer />;
            case 'numbers': return <NumberExplorer />;
            case 'alphabet': return <InteractiveAlphabet />;
            case 'days': return <DaysOfWeek />;
            case 'dates': return <DateReader />;
            case 'seasons': return <SeasonsGuide />;
            case 'time': return <DigitalTimeReader />;
            case 'verbToBe': return <VerbToBeExplainer />;
            case 'questionFormer': return <QuestionFormer />;
            case 'sentenceBuilder': return <SentenceBuilder />;
            default: return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg border-2 border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-adai-primary">{title}</h2>
                    <button onClick={onClose} className="text-slate-500 dark:text-slate-400 text-2xl hover:text-slate-900 dark:hover:text-slate-50">&times;</button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {renderModule()}
                </div>
            </div>
        </div>
    );
};


const Basics: React.FC = () => {
    const [activeModule, setActiveModule] = useState<BasicsModule | null>(null);

    const ModuleCard: React.FC<{ module: BasicsModule }> = ({ module }) => {
        const { title, icon, description } = moduleData[module];
        return (
            <button onClick={() => setActiveModule(module)}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 h-full text-left transition-all duration-300 hover:shadow-adai-primary/20 hover:-translate-y-1 hover:border-adai-primary">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            </button>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {activeModule && <ModuleModal module={activeModule} onClose={() => setActiveModule(null)} />}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">Temel Bilgiler 🧱</h2>
                <p className="mb-6 text-slate-500 dark:text-slate-400">
                    İngilizcenin temel yapı taşlarını interaktif alıştırmalarla pekiştirin. Başlamak için bir modül seçin.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(moduleData).map(key => (
                    <ModuleCard key={key} module={key as BasicsModule} />
                ))}
            </div>
        </div>
    );
};

export default Basics;
