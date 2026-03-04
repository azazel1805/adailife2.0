import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { analyzeConversationForReport, createSpeakingSimulatorSession } from '../services/geminiService';
import { Scenario, PerformanceReport, SimulatorChatMessage } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { useChallenge } from '../context/ChallengeContext';

type SimulatorState = 'selection' | 'briefing' | 'active' | 'processing_report' | 'report';

// --- Static Scenario Data ---
const scenarios: Scenario[] = [
    {
        id: 'cafe_order',
        title: 'Ordering at a Cafe',
        description: 'Go into a cafe and order a drink and something to eat for yourself.',
        difficulty: 'Kolay',
        userRole: 'a customer at a cafe',
        aiRole: 'a friendly and patient cafe barista',
        aiWelcome: "Welcome to The Cozy Corner! What can I get for you today?",
        objectives: [
            "Order a large latte.",
            "Ask if they have any chocolate cake.",
            "Order a piece of cake if they have it.",
            "Confirm your total order."
        ]
    },
    {
        id: 'hotel_checkin',
        title: 'Checking into a Hotel',
        description: 'Check into a hotel where you have a reservation and get information about your room.',
        difficulty: 'Kolay',
        userRole: 'a tourist checking into a hotel',
        aiRole: 'a helpful hotel receptionist',
        aiWelcome: "Good evening! Welcome to the Grand Hotel. How can I assist you?",
        objectives: [
            "State that you have a reservation under your name.",
            "Ask if the room has a sea view.",
            "Inquire about the breakfast time.",
            "Ask what the Wi-Fi password is."
        ]
    },
    {
        id: 'meeting_new_person',
        title: 'Meeting Someone New',
        description: 'Introduce yourself to someone at a party and make small talk.',
        difficulty: 'Kolay',
        userRole: 'a guest at a party',
        aiRole: 'another friendly guest at the same party',
        aiWelcome: "Hi there! I don't think we've met. I'm Alex.",
        objectives: ["Say your name.", "Ask what they do for a living.", "Tell them what you do.", "Say it was nice meeting them."]
    },
    {
        id: 'buy_train_ticket',
        title: 'Buying a Train Ticket',
        description: 'Go to a train station ticket counter to buy a ticket for a trip.',
        difficulty: 'Kolay',
        userRole: 'a traveler buying a ticket',
        aiRole: 'a ticket agent at a train station',
        aiWelcome: "Hello, where can I help you travel to today?",
        objectives: ["Say you want one ticket to Manchester.", "Ask what time the next train leaves.", "Ask which platform it leaves from.", "Say you will pay by card."]
    },
    {
        id: 'return_item',
        title: 'Returning an Item',
        description: 'Try to return a newly bought but faulty electronic item to the store.',
        difficulty: 'Orta',
        userRole: 'an unsatisfied customer returning a faulty product',
        aiRole: 'a store clerk handling returns',
        aiWelcome: "Hi there, how can I help you today?",
        objectives: [
            "Explain that you bought an item that is not working.",
            "Describe the problem with the item (e.g., it doesn't turn on).",
            "State that you would like a full refund, not a replacement.",
            "Mention that you have the receipt."
        ]
    },
    {
        id: 'directions',
        title: 'Asking for Directions',
        description: 'You are lost in a city and ask a local where the nearest train station is.',
        difficulty: 'Orta',
        userRole: 'a lost tourist',
        aiRole: 'a helpful local person',
        aiWelcome: "Excuse me, you look a bit lost. Can I help you with something?",
        objectives: [
            "Politely get the person's attention.",
            "Ask where the nearest train station is.",
            "Ask how long it takes to walk there.",
            "Thank the person for their help."
        ]
    },
    {
        id: 'doctor_appointment',
        title: "Making a Doctor's Appointment",
        description: "Call a doctor's office to schedule an appointment for a check-up.",
        difficulty: 'Orta',
        userRole: 'a patient calling a clinic',
        aiRole: 'a receptionist at a doctor\'s office',
        aiWelcome: "Good morning, Dr. Smith's office. How may I help you?",
        objectives: ["Say you'd like to make an appointment with Dr. Smith.", "Explain it's for a general check-up.", "Ask for an appointment next week in the afternoon.", "Confirm the appointment time and date."]
    },
    {
        id: 'meal_complaint',
        title: 'Meal Complaint at a Restaurant',
        description: 'You received the wrong order at a restaurant. Politely inform the waiter about the issue.',
        difficulty: 'Orta',
        userRole: 'a customer at a restaurant',
        aiRole: 'a waiter at the restaurant',
        aiWelcome: "Is everything alright with your meal?",
        objectives: ["Get the waiter's attention politely.", "Explain that this isn't what you ordered.", "Tell the waiter what you actually ordered (e.g., the steak).", "Ask how long it will take to get the correct dish."]
    },
    {
        id: 'job_interview',
        title: 'Job Interview Simulation',
        description: 'Conduct a basic job interview for a software engineer position.',
        difficulty: 'Zor',
        userRole: 'a candidate interviewing for a junior software engineer role',
        aiRole: 'a hiring manager at a tech company',
        aiWelcome: "Hello, thanks for coming in. Please, have a seat. So, tell me a little bit about yourself.",
        objectives: [
            "Briefly introduce yourself and your background.",
            "Explain why you are interested in this role.",
            "Mention one of your key strengths.",
            "Ask a question about the company culture."
        ]
    },
    {
        id: 'discuss_news',
        title: 'Discussing News',
        description: 'Chat with a friend about the latest news on the future of artificial intelligence.',
        difficulty: 'Zor',
        userRole: 'a person interested in technology',
        aiRole: 'a friend who also follows the news',
        aiWelcome: "Hey, did you see that article about the new AI developments? It's pretty wild.",
        objectives: [
            "Express your general opinion on the news.",
            "Mention one potential benefit of AI.",
            "Mention one potential concern about AI.",
            "Ask your friend for their opinion on the future of AI."
        ]
    },
    {
        id: 'negotiate_price',
        title: 'Negotiating a Price',
        description: "You're at a souvenir market and want to buy an item. Try to negotiate for a better price with the seller.",
        difficulty: 'Zor',
        userRole: 'a tourist trying to get a good deal',
        aiRole: 'a market vendor',
        aiWelcome: "Hello! Welcome to my shop! See anything you like? This vase is beautiful, isn't it?",
        objectives: ["Ask for the price of an item (e.g., the vase).", "Say the price is a bit too high for you.", "Make a counter-offer that is lower than the asking price.", "Try to agree on a final price."]
    },
    {
        id: 'social_media_debate',
        title: 'Debate: Social Media',
        description: 'Participate in a friendly debate about the pros and cons of social media.',
        difficulty: 'Zor',
        userRole: 'a person with an opinion on social media',
        aiRole: 'a debate partner with an opposing view',
        aiWelcome: "Alright, let's discuss this. I personally think social media has been overwhelmingly positive for society. What's your take?",
        objectives: ["State your main opinion (whether it's good or bad).", "Give one reason to support your opinion.", "Acknowledge the opposing view but offer a counter-argument.", "Conclude your point gracefully."]
    }
];

const SpeakingSimulator: React.FC = () => {
    const [simulatorState, setSimulatorState] = useState<SimulatorState>('selection');
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [conversation, setConversation] = useState<SimulatorChatMessage[]>([]);
    const [report, setReport] = useState<PerformanceReport | null>(null);
    const [error, setError] = useState('');
    const { trackAction } = useChallenge();

    // --- Web Speech API State ---
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const chatSessionRef = useRef<Chat | null>(null);
    const recognitionRef = useRef<any | null>(null); // SpeechRecognition object

    // --- Setup Web Speech API ---
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Sorry, your browser doesn't support speech recognition. Please try Google Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setError(`Speech recognition error: ${event.error}. Please check microphone permissions.`);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            setInterimTranscript(interim);
            if (final.trim()) {
                handleUserSpeech(final.trim());
            }
        };

        recognitionRef.current = recognition;

        // Cleanup synthesis on unmount
        return () => window.speechSynthesis.cancel();
    }, []);

    const speakText = (text: string) => {
        return new Promise<void>((resolve, reject) => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => voice.lang === 'en-US' && /female/i.test(voice.name));
            utterance.voice = femaleVoice || voices.find(voice => voice.lang === 'en-US') || null;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                resolve();
            };
            utterance.onerror = (e) => {
                console.error("Speech synthesis error", e);
                setError("Could not play audio response.");
                setIsSpeaking(false);
                reject(e);
            };

            window.speechSynthesis.speak(utterance);
        });
    };

    const handleUserSpeech = async (transcript: string) => {
        if (!chatSessionRef.current) return;
        setInterimTranscript('');
        setConversation(prev => [...prev, { speaker: 'user', text: transcript }]);
        
        try {
            const response = await chatSessionRef.current.sendMessage({ message: transcript });
            const aiText = response.text;
            
            setConversation(prev => [...prev, { speaker: 'ai', text: aiText }]);
            await speakText(aiText);
        } catch (e: any) {
            setError(e.message || "Failed to get AI response.");
        }
    };

    const startSimulation = async () => {
        if (!selectedScenario) return;
        
        chatSessionRef.current = createSpeakingSimulatorSession(selectedScenario);
        
        setConversation([{ speaker: 'ai', text: selectedScenario.aiWelcome }]);
        setSimulatorState('active');
        setError('');
        
        await speakText(selectedScenario.aiWelcome);
    };

    const stopSimulation = async () => {
        if (simulatorState !== 'active') return;
        
        setSimulatorState('processing_report');
        window.speechSynthesis.cancel();
        recognitionRef.current?.stop();
        setIsListening(false);
        setIsSpeaking(false);

        try {
            if (conversation.length > 1) { 
                const reportText = await analyzeConversationForReport(selectedScenario!, conversation);
                const reportJson: PerformanceReport = JSON.parse(reportText);
                setReport(reportJson);
                trackAction('speaking_simulator');
            } else {
                setReport(null); 
            }
        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the analysis report.');
        } finally {
            setSimulatorState('report');
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else if (!isSpeaking) {
            recognitionRef.current?.start();
        }
    };

    const renderSelection = () => (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">Konuşma Simülatörü 🎭</h2>
            <p className="mb-4 text-slate-500 dark:text-slate-400">Pratik yapmak istediğiniz bir senaryo seçin.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map(s => (
                    <button key={s.id} onClick={() => { setSelectedScenario(s); setSimulatorState('briefing'); }}
                        className="p-6 bg-slate-100 dark:bg-slate-800 hover:bg-adai-primary dark:hover:bg-adai-primary hover:text-white dark:hover:text-white rounded-lg text-left transition-all duration-200 transform hover:scale-105">
                        <h3 className="font-bold text-lg">{s.title}</h3>
                        <p className="text-sm mt-1">{s.description}</p>
                        <span className={`mt-3 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${s.difficulty === 'Kolay' ? 'bg-green-200 text-green-800' : s.difficulty === 'Orta' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                            {s.difficulty}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
    
    const renderBriefing = () => {
        if (!selectedScenario) return null;
        return (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold mb-2 text-adai-primary">{selectedScenario.title}</h2>
                <div className="space-y-4 my-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p><strong>🤖 AI Rolü:</strong> {selectedScenario.aiRole}</p>
                    <p><strong>👤 Senin Rolün:</strong> {selectedScenario.userRole}</p>
                    <div>
                        <h4 className="font-bold mb-2">🎯 Hedeflerin:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {selectedScenario.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={startSimulation} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                        Simülasyonu Başlat
                    </button>
                    <button onClick={() => setSimulatorState('selection')} className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-lg transition duration-300">
                        Geri Dön
                    </button>
                </div>
            </div>
        );
    };

    const renderActive = () => (
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-10rem)] max-h-[800px]">
             <h2 className="text-xl font-bold mb-2 text-adai-primary flex-shrink-0">{selectedScenario?.title}</h2>
             <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0">
                 <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2">🎯 Your Objectives:</h4>
                 <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                     {selectedScenario?.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                 </ul>
             </div>
             <div className="h-full bg-slate-100 dark:bg-slate-800 rounded-lg p-4 overflow-y-auto space-y-3 mb-4 flex-grow">
                 {conversation.map((msg, i) => (
                     <div key={i} className={`flex items-end gap-2 ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                         {msg.speaker === 'ai' && <span className="text-2xl">🤖</span>}
                         <div className={`max-w-md p-3 rounded-2xl ${msg.speaker === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                             <p className="text-base leading-relaxed">{msg.text}</p>
                         </div>
                          {msg.speaker === 'user' && <span className="text-2xl">👤</span>}
                     </div>
                 ))}
                 {interimTranscript && (
                    <div className="flex items-end gap-2 justify-end">
                        <div className="max-w-md p-3 rounded-2xl bg-blue-500 text-white rounded-br-none opacity-60">
                            <p className="text-base italic">{interimTranscript}</p>
                        </div>
                        <span className="text-2xl">👤</span>
                    </div>
                 )}
             </div>
             <div className="flex items-center justify-center gap-6 flex-shrink-0">
                <button onClick={stopSimulation} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                    Bitir
                </button>
                <button onClick={handleMicClick} disabled={isSpeaking} 
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 text-white text-3xl shadow-lg
                        ${isSpeaking ? 'bg-slate-400 cursor-not-allowed' : 
                        isListening ? 'bg-red-500 animate-pulse' : 
                        'bg-adai-primary hover:bg-adai-secondary'}`
                    }
                >
                    🎤
                </button>
                <div className="w-24 text-center text-sm text-slate-500 dark:text-slate-400">
                    {isSpeaking ? "AI konuşuyor..." : isListening ? "Dinleniyor..." : "Konuşmak için bas"}
                </div>
             </div>
         </div>
    );
    
    const renderReport = () => (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 space-y-6 flex flex-col max-h-[calc(100vh-12rem)]">
            <div className="flex-shrink-0">
                <h2 className="text-2xl font-bold text-adai-primary">Performans Raporu</h2>
            </div>
            {simulatorState === 'processing_report' ? <div className="flex-grow flex items-center justify-center"><Loader /></div> : (
                report ? (
                    <div className="space-y-6 overflow-y-auto pr-4 flex-grow">
                        {/* Objective Completion */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">🎯 Hedef Tamamlama Durumu</h3>
                            <ul className="space-y-2">
                                {report.objectiveCompletion.map((obj, i) => (
                                    <li key={i} className={`p-3 rounded-md text-sm ${obj.completed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                        <span className={`font-bold ${obj.completed ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>{obj.completed ? '✅ Tamamlandı:' : '❌ Tamamlanmadı:'}</span> <span className="text-slate-800 dark:text-slate-200">{obj.objective}</span>
                                        <p className="text-xs italic mt-1 text-slate-600 dark:text-slate-400">Gerekçe: {obj.reasoning}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Overall Feedback */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">💬 Genel Geri Bildirim</h3>
                            <p className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-slate-600 dark:text-slate-300">{report.overallFeedback}</p>
                        </div>

                        {/* Pronunciation Feedback */}
                        {report.pronunciationFeedback.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">🗣️ Telaffuz İpuçları</h3>
                                <ul className="space-y-2">
                                    {report.pronunciationFeedback.map((item, i) => (
                                        <li key={i} className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-slate-600 dark:text-slate-300">
                                            <strong className="text-purple-700 dark:text-purple-400">{item.word}:</strong> {item.feedback}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Grammar Feedback */}
                        {report.grammarFeedback.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">✍️ Dil Bilgisi Düzeltmeleri</h3>
                                <ul className="space-y-2">
                                    {report.grammarFeedback.map((item, i) => (
                                        <li key={i} className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                                            <p className="text-slate-800 dark:text-slate-200"><span className="text-red-600 dark:text-red-400 line-through">{item.error}</span> &rarr; <span className="text-green-600 dark:text-green-400 font-semibold">{item.correction}</span></p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Açıklama: {item.explanation}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Vocabulary Suggestions */}
                        {report.vocabularySuggestions.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">💡 Kelime Önerileri</h3>
                                <ul className="space-y-2">
                                    {report.vocabularySuggestions.map((item, i) => (
                                        <li key={i} className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                                            <p className="text-slate-800 dark:text-slate-200">'{item.original}' yerine '{item.suggestion}' kullanabilirsin.</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Neden: {item.reason}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : <div className="flex-grow flex items-center justify-center text-slate-500 dark:text-slate-400"><p>Analiz edilecek yeterli konuşma verisi bulunamadı.</p></div>
            )}
            <div className="flex-shrink-0 pt-4">
                <button onClick={() => { setSimulatorState('selection'); setReport(null); setConversation([]); }}
                    className="w-full bg-adai-secondary hover:bg-adai-primary text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                    Yeni Simülasyon
                </button>
            </div>
        </div>
    );


    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <ErrorMessage message={error} />
            {simulatorState === 'selection' && renderSelection()}
            {simulatorState === 'briefing' && renderBriefing()}
            {(simulatorState === 'active') && renderActive()}
            {(simulatorState === 'processing_report' || simulatorState === 'report') && renderReport()}
        </div>
    );
};

export default SpeakingSimulator;
