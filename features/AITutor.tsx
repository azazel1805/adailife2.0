import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { createTutorChatSession, createCreativeWritingSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import ErrorMessage from '../components/ErrorMessage';
import { SendIcon } from '../components/icons/Icons';
import { useChallenge } from '../context/ChallengeContext';

interface AITutorProps {
    initialMessage?: string | null;
    onMessageSent?: () => void;
}

const AITutor: React.FC<AITutorProps> = ({ initialMessage, onMessageSent }) => {
    // --- Shared State ---
    const [error, setError] = useState('');
    const [isEnglishMode, setIsEnglishMode] = useState(false);

    // --- Turkish Text Chat State ---
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([
        { role: 'model', text: 'Merhaba! Ben Onur, senin kişisel AI İngilizce eğitmenin. İngilizce yolculuğunda sana nasıl yardımcı olabilirim?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { trackAction } = useChallenge();
    
    // --- English Voice Chat State ---
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [englishConversation, setEnglishConversation] = useState<ChatMessage[]>([]);
    const [interimTranscript, setInterimTranscript] = useState('');
    const englishChatSessionRef = useRef<Chat | null>(null);
    const recognitionRef = useRef<any | null>(null); // SpeechRecognition object


    // --- English Mode: Web Speech API Setup ---
    useEffect(() => {
        if (!isEnglishMode) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Sorry, your browser doesn't support speech recognition. Please try Google Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false; // We want to process speech after the user pauses

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

        // Cleanup synthesis on unmount or mode change
        return () => {
            window.speechSynthesis.cancel();
            recognition.stop();
        }
    }, [isEnglishMode]); // Re-setup if mode changes

    // --- English Mode: Helper Functions ---

    const speakText = (text: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (typeof window.speechSynthesis === 'undefined') {
                setIsSpeaking(false);
                return reject(new Error("Speech synthesis not supported."));
            }
            window.speechSynthesis.cancel(); // Stop any previous speech
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
        if (!englishChatSessionRef.current) return;
        
        setIsLoading(true);
        setInterimTranscript('');
        setEnglishConversation(prev => [...prev, { role: 'user', text: transcript }]);
        
        try {
            const response = await englishChatSessionRef.current.sendMessage({ message: transcript });
            const aiText = response.text;
            
            setEnglishConversation(prev => [...prev, { role: 'model', text: aiText }]);
            await speakText(aiText);
        } catch (e: any) {
            setError(e.message || "Failed to get AI response.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else if (!isSpeaking && !isLoading) {
            try {
                 recognitionRef.current?.start();
            } catch (e) {
                console.error("Could not start recognition:", e);
                setError("Could not start listening. Please try again.");
            }
        }
    };
    
    // --- Session & Mode Management ---

    const stopEnglishSession = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        englishChatSessionRef.current = null;
    }, []);
    
    const handleModeChange = (englishMode: boolean) => {
        // If switching away from english mode, stop everything
        if (isEnglishMode) {
            stopEnglishSession();
        }
        
        setIsEnglishMode(englishMode);
        setError('');
        
        if (englishMode) {
            // Setup for English Mode
            const session = createCreativeWritingSession('conversation', 'start'); // Re-using this service function as it has a suitable system prompt
            englishChatSessionRef.current = session;
            const welcomeMessage: ChatMessage = { role: 'model', text: "Hello! I'm Alex, your English speaking partner. Let's have a chat! How are you today?"};
            setEnglishConversation([welcomeMessage]);
            speakText(welcomeMessage.text);
        } else {
            // Reset to Turkish Mode
             setHistory([
                { role: 'model', text: 'Merhaba! Ben Onur, senin kişisel AI İngilizce eğitmenin. İngilizce yolculuğunda sana nasıl yardımcı olabilirim?' }
            ]);
        }
    };
    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopEnglishSession();
        }
    }, [stopEnglishSession]);

    // --- Turkish Mode Logic ---
    useEffect(() => {
        if (!isEnglishMode) {
            try {
                const session = createTutorChatSession();
                setChatSession(session);
            } catch (e: any) {
                setError(e.message || "Failed to initialize AI Tutor session.");
            }
        }
    }, [isEnglishMode]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history, englishConversation]);
    
    useEffect(() => {
        if (initialMessage && chatSession && !isEnglishMode) {
          const processInitialMessage = async () => {
            const userMessage: ChatMessage = { role: 'user', text: initialMessage };
            setHistory(prev => [...prev, userMessage]);
            setIsLoading(true);
            setError('');
            
            onMessageSent?.();

            try {
              const stream = await chatSession.sendMessageStream({ message: initialMessage });
              setHistory(prev => [...prev, { role: 'model', text: '' }]);

              for await (const chunk of stream) {
                const chunkText = chunk.text;
                setHistory(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage.role === 'model') {
                    const updatedMessage = { ...lastMessage, text: lastMessage.text + chunkText };
                    return [...prev.slice(0, -1), updatedMessage];
                  }
                  return prev;
                });
              }
            } catch (e: any) {
              setError(e.message || 'Failed to get response from AI Tutor.');
              setHistory(prev => prev.filter(msg => msg.text !== initialMessage));
            } finally {
              setIsLoading(false);
            }
          };
          processInitialMessage();
        }
      }, [initialMessage, onMessageSent, chatSession, isEnglishMode]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chatSession) return;

        const userMessage: ChatMessage = { role: 'user', text: userInput };
        setIsLoading(true);
        setError('');
        setHistory(prev => [...prev, userMessage]);
        setUserInput('');
        trackAction('tutor');


        try {
            const stream = await chatSession.sendMessageStream({ message: userInput });
            
            setHistory(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                setHistory(prev => {
                    const lastMessage = prev[prev.length - 1];
                    const updatedMessage = { ...lastMessage, text: lastMessage.text + chunkText };
                    return [...prev.slice(0, -1), updatedMessage];
                });
            }
        } catch (e: any) {
            setError(e.message || 'Failed to get response from AI Tutor.');
            setHistory(prev => prev.slice(0, -1)); 
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- UI Rendering ---

    const ModeSwitcher = () => (
        <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg mb-4">
            <button onClick={() => handleModeChange(false)} className={`flex-1 text-center text-sm font-bold py-2 rounded-md transition-colors ${!isEnglishMode ? 'bg-brand-primary text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}>
                Türkçe Modu (Yazılı)
            </button>
            <button onClick={() => handleModeChange(true)} className={`flex-1 text-center text-sm font-bold py-2 rounded-md transition-colors ${isEnglishMode ? 'bg-teal-500 text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}>
                English Mode (Speaking)
            </button>
        </div>
    );
    
    const renderTurkishMode = () => (
        <div className="h-[calc(100vh-14rem)] flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b-2 border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">AI Eğitmen: Onur</h2>
                <p className="text-slate-500 dark:text-slate-400">İngilizce veya sınavlar hakkında aklınıza takılan her şeyi sorun.</p>
            </div>
            <div ref={chatContainerRef} className="flex-grow p-6 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <span className="text-3xl mb-1">🎓</span>}
                        <div className={`max-w-xl p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                        </div>
                        {msg.role === 'user' && <span className="text-3xl mb-1">🧑‍🎓</span>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-3 justify-start mt-4">
                        <span className="text-3xl mb-1">🎓</span>
                        <div className="max-w-lg p-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-b-xl border-t-2 border-slate-200 dark:border-slate-800">
                <ErrorMessage message={error} />
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={isLoading ? 'Onur düşünüyor...' : 'Onur\'a bir mesaj yazın...'}
                        className="flex-grow p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-brand-primary focus:outline-none text-slate-800 dark:text-slate-200 disabled:opacity-50 transition-colors"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold w-12 h-12 rounded-full transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );

    const renderEnglishMode = () => (
        <div className="h-[calc(100vh-14rem)] flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b-2 border-slate-200 dark:border-slate-800 flex-shrink-0">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Speaking Partner: Alex</h2>
                <p className="text-slate-500 dark:text-slate-400">Start a conversation and practice your English speaking skills.</p>
            </div>
            <div ref={chatContainerRef} className="flex-grow p-6 overflow-y-auto space-y-4">
                {englishConversation.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <span className="text-3xl mb-1">🤖</span>}
                        <div className={`max-w-xl p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                        </div>
                        {msg.role === 'user' && <span className="text-3xl mb-1">🎤</span>}
                    </div>
                ))}
                {interimTranscript && (
                    <div className="flex items-end gap-2 justify-end">
                        <div className="max-w-md p-3 rounded-2xl bg-blue-500 text-white rounded-br-none opacity-60">
                            <p className="text-sm italic">{interimTranscript}</p>
                        </div>
                        <span className="text-2xl">🎤</span>
                    </div>
                 )}
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-b-xl text-center border-t-2 border-slate-200 dark:border-slate-800 flex-shrink-0">
                 <ErrorMessage message={error} />
                 <div className="flex items-center justify-center gap-6">
                    <button onClick={handleMicClick} disabled={isSpeaking || isLoading} 
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 text-white text-3xl shadow-lg
                            ${(isSpeaking || isLoading) ? 'bg-slate-400 cursor-not-allowed' : 
                            isListening ? 'bg-red-500 animate-pulse' : 
                            'bg-adai-primary hover:bg-adai-secondary'}`
                        }
                    >
                        🎤
                    </button>
                    <div className="w-48 text-left text-sm text-slate-500 dark:text-slate-400">
                        {isLoading ? "Alex thinks..." : isSpeaking ? "Alex is speaking..." : isListening ? "Listening..." : "Press the mic to talk"}
                    </div>
                 </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <ModeSwitcher />
            {isEnglishMode ? renderEnglishMode() : renderTurkishMode()}
        </div>
    );
};

export default AITutor;
