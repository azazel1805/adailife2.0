import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { analyzeConversationForReport } from '../services/geminiService';
import { Scenario, PerformanceReport, SimulatorChatMessage } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { useChallenge } from '../context/ChallengeContext';
import { SpeakerIcon, StopIcon } from '../components/icons/Icons';

type SimulatorState = 'selection' | 'briefing' | 'active' | 'processing_report' | 'report';

// Define a local type for the Gemini Blob structure as it's not exported from the library.
type GeminiBlob = {
  data: string;
  mimeType: string;
};

// --- AudioWorklet Setup ---
const workletCode = `
class AudioProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const channel = input[0];
      if (channel) {
        this.port.postMessage(channel);
      }
    }
    return true;
  }
}
registerProcessor('audio-processor', AudioProcessor);
`;
const workletBlob = new Blob([workletCode], { type: 'application/javascript' });
const workletURL = URL.createObjectURL(workletBlob);


// --- Static Scenario Data ---
const scenarios: Scenario[] = [
    // ... (Your scenario data remains the same)
    {
        id: 'cafe_order',
        title: 'Ordering at a Cafe',
        description: 'Go into a cafe and order a drink and something to eat for yourself.',
        difficulty: 'Kolay',
        userRole: 'a customer at a cafe',
        aiRole: 'a friendly and patient cafe barista',
        aiWelcome: "Welcome to The Cozy Corner! What can I get for you today?",
        objectives: ["Order a large latte.","Ask if they have any chocolate cake.","Order a piece of cake if they have it.","Confirm your total order."]
    },
    {
        id: 'hotel_checkin',
        title: 'Checking into a Hotel',
        description: 'Check into a hotel where you have a reservation and get information about your room.',
        difficulty: 'Kolay',
        userRole: 'a tourist checking into a hotel',
        aiRole: 'a helpful hotel receptionist',
        aiWelcome: "Good evening! Welcome to the Grand Hotel. How can I assist you?",
        objectives: ["State that you have a reservation under your name.","Ask if the room has a sea view.","Inquire about the breakfast time.","Ask what the Wi-Fi password is."]
    },
];

const SpeakingSimulator: React.FC = () => {
    const [simulatorState, setSimulatorState] = useState<SimulatorState>('selection');
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [conversation, setConversation] = useState<SimulatorChatMessage[]>([]);
    const [report, setReport] = useState<PerformanceReport | null>(null);
    const [error, setError] = useState('');
    const { trackAction } = useChallenge();

    // --- Audio & Live API Refs ---
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const isSessionActiveRef = useRef<boolean>(false); // FIX: Add a dedicated flag for session state.
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const outputAudioSources = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextAudioStartTime = useRef<number>(0);

    // --- Audio Helper Functions (no changes) ---
    const encode = (bytes: Uint8Array) => { /* ... */ return btoa(''); };
    const createBlob = (data: Float32Array): GeminiBlob => { /* ... */ return {data: '', mimeType: ''}; };
    const decode = (base64: string) => { /* ... */ return new Uint8Array(); };
    const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => { /* ... */ return ctx.createBuffer(1,1,sampleRate); };

    const stopSimulation = async () => {
        // FIX: Use our immediate ref flag as the guard.
        if (!isSessionActiveRef.current) return;

        // FIX: Set our flag to false immediately to signal all processes to stop.
        isSessionActiveRef.current = false;

        setSimulatorState('processing_report');

        // FIX: Forcefully stop the audio pipeline first and foremost.
        // Disconnecting the nodes is a synchronous action that immediately halts audio data flow.
        audioWorkletNodeRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        
        // Now, close the WebSocket session. No more data can be sent to it.
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }

        // --- Full Cleanup ---
        // Close audio contexts and clear any remaining sources
        if (inputAudioContextRef.current?.state !== 'closed') {
            inputAudioContextRef.current?.close();
        }
        outputAudioSources.current.forEach(source => source.stop());
        outputAudioSources.current.clear();
        if (outputAudioContextRef.current?.state !== 'closed') {
            outputAudioContextRef.current?.close();
        }

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

    const startSimulation = async () => {
        if (!selectedScenario) return;

        setConversation([{ speaker: 'ai', text: selectedScenario.aiWelcome }]);
        setSimulatorState('active');
        setError('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            // FIX: Set our session flag to true right before connecting.
            isSessionActiveRef.current = true;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        inputAudioContextRef.current = inputCtx;
                        
                        try {
                            await inputCtx.audioWorklet.addModule(workletURL);
                            const source = inputCtx.createMediaStreamSource(stream);
                            mediaStreamSourceRef.current = source;
                            const workletNode = new AudioWorkletNode(inputCtx, 'audio-processor');
                            audioWorkletNodeRef.current = workletNode;

                            workletNode.port.onmessage = (event) => {
                                // FIX: Use the new isSessionActiveRef flag as the primary check.
                                if (isSessionActiveRef.current) {
                                    const inputData = event.data;
                                    const pcmBlob = createBlob(inputData);
                                    sessionPromiseRef.current?.then(session => {
                                        session.sendRealtimeInput({ media: pcmBlob });
                                    }).catch(e => {
                                        console.warn("Failed to send final audio packet:", e);
                                    });
                                }
                            };
                            source.connect(workletNode);
                            workletNode.connect(inputCtx.destination);
                        } catch (e) {
                             console.error("Error setting up audio worklet:", e);
                             setError('Audio processing setup failed.');
                             stopSimulation();
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => { /* ... no changes ... */ },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError('A conversation session error occurred. Ending session automatically.');
                        stopSimulation();
                    },
                    onclose: () => {
                        console.debug('Live session closed.');
                        // The guard in stopSimulation will prevent this from running if we initiated the close.
                        stopSimulation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: `You are an AI role-playing as a ${selectedScenario.aiRole}. Your goal is to have a natural conversation with the user, who is playing the role of a ${selectedScenario.userRole}. Act your part convincingly. Do not break character. Keep your responses concise and natural for a spoken conversation.`,
                },
            });

        } catch (err) {
            setError('Mikrofon erişimi reddedildi veya bulunamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.');
            setSimulatorState('briefing');
        }
    };

    useEffect(() => {
        // This is the component's cleanup function (runs on unmount).
        return () => {
            stopSimulation();
        }
    }, []);

    // --- Render Functions (No changes below this line) ---
    const renderBriefing = () => {
        if (!selectedScenario) return null;
        return (
            <div className="bg-bg-secondary p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2 text-brand-primary">{selectedScenario.title}</h2>
                <div className="space-y-4 my-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
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
                    <button onClick={startSimulation} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300">
                        Simülasyonu Başlat
                    </button>
                    <button onClick={() => setSimulatorState('selection')} className="flex-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-md transition duration-300">
                        Geri Dön
                    </button>
                </div>
            </div>
        );
    };

    const renderActive = () => (
         <div className="bg-bg-secondary p-6 rounded-lg shadow-lg">
             <h2 className="text-2xl font-bold mb-2 text-brand-primary">{selectedScenario?.title}</h2>
             <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-y-auto space-y-3 mb-4">
                 {conversation.map((msg, i) => (
                     <div key={i} className={`flex items-end gap-2 ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                         {msg.speaker === 'ai' && <span className="text-2xl">🤖</span>}
                         <div className={`max-w-md p-3 rounded-2xl ${msg.speaker === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                             <p className="text-sm">{msg.text}</p>
                         </div>
                          {msg.speaker === 'user' && <span className="text-2xl">👤</span>}
                     </div>
                 ))}
             </div>
             <div className="text-center font-bold text-red-500 animate-pulse mb-4">
                 🔴 KAYIT AKTİF
             </div>
             <button onClick={stopSimulation} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition duration-300">
                 Simülasyonu Bitir ve Rapor Al
             </button>
         </div>
    );
    
    const renderReport = () => (
        <div className="bg-bg-secondary p-6 rounded-lg shadow-lg space-y-6 flex flex-col max-h-[calc(100vh-12rem)]">
            <div className="flex-shrink-0">
                <h2 className="text-2xl font-bold text-brand-primary">Performans Raporu</h2>
            </div>
            {simulatorState === 'processing_report' ? <div className="flex-grow flex items-center justify-center"><Loader /></div> : (
                report ? (
                    <div className="space-y-6 overflow-y-auto pr-4 flex-grow">
                        {/* Objective Completion */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-text-primary">🎯 Hedef Tamamlama Durumu</h3>
                            <ul className="space-y-2">
                                {report.objectiveCompletion.map((obj, i) => (
                                    <li key={i} className={`p-3 rounded-md text-sm ${obj.completed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                        <span className={`font-bold ${obj.completed ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>{obj.completed ? '✅ Tamamlandı:' : '❌ Tamamlanmadı:'}</span> <span className="text-text-primary">{obj.objective}</span>
                                        <p className="text-xs italic mt-1 text-text-secondary">Gerekçe: {obj.reasoning}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Overall Feedback */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-text-primary">💬 Genel Geri Bildirim</h3>
                            <p className="text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-text-secondary">{report.overallFeedback}</p>
                        </div>
                    </div>
                ) : <div className="flex-grow flex items-center justify-center text-text-secondary"><p>Analiz edilecek yeterli konuşma verisi bulunamadı.</p></div>
            )}
            <div className="flex-shrink-0 pt-4">
                <button onClick={() => { setSimulatorState('selection'); setReport(null); setConversation([]); }}
                    className="w-full bg-brand-secondary hover:bg-brand-primary text-white font-bold py-3 px-4 rounded-md transition duration-300">
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
            {simulatorState === 'active' && renderActive()}
            {(simulatorState === 'processing_report' || simulatorState === 'report') && renderReport()}
        </div>
    );
};

export default SpeakingSimulator;
