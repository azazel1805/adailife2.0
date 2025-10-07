import React, { useState, useEffect, useCallback } from 'react';
import { SpeakerIcon, VerbToBeIcon } from '../components/icons/Icons';
import { verbToBeData, ToBeData } from '../data/verbToBeData';
import Loader from '../components/Loader';

type BasicsModule = 'colors' | 'numbers' | 'alphabet' | 'days' | 'dates' | 'seasons' | 'time' | 'verbToBe';

const PEXELS_API_KEY = 'BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq';

const moduleData = {
    colors: { title: 'Renkleri Öğren', icon: '🎨', description: 'Renkleri ve okunuşlarını keşfet.' },
    numbers: { title: 'Sayıları Öğren', icon: '🔢', description: '0-100 arası sayıları ve okunuşlarını keşfet.' },
    alphabet: { title: 'Etkileşimli Alfabe', icon: '🔤', description: 'Harflerin telaffuzunu dinle.' },
    days: { title: 'Haftanın Günleri', icon: '🗓️', description: 'Günlerin telaffuzunu ve sırasını öğren.' },
    dates: { title: 'Tarih Okuma', icon: '📅', description: 'Seçtiğin tarihi İngilizce olarak dinle.' },
    seasons: { title: 'Mevsimler Rehberi', icon: '☀️', description: 'Ayların hangi mevsime ait olduğunu gör.' },
    time: { title: 'Dijital Saat Okuma', icon: '⏰', description: 'Ayarladığın saati İngilizce olarak dinle.' },
    verbToBe: { title: 'Verb "to be"', icon: <VerbToBeIcon />, description: 'En temel fiilin kullanımını öğren.' }
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

            <div>
                <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Örnekler</h4>
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
