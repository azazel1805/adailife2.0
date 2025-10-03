import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { analyzeConversationForReport } from '../services/geminiService';
import { Scenario, PerformanceReport, SimulatorChatMessage } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { useChallenge } from '../context/ChallengeContext';
import { SpeakerIcon, StopIcon } from '../components/icons/Icons';

type SimulatorState = 'selection' | 'briefing' | 'active' | 'processing_report' | 'report';
// NEW: Define a type for our connection status
type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed';

// --- Static Scenario Data (no changes) ---
const scenarios: Scenario[] = [
    // ... your scenario data ...
];

const SpeakingSimulator: React.FC = () => {
    const [simulatorState, setSimulatorState] = useState<SimulatorState>('selection');
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [conversation, setConversation] = useState<SimulatorChatMessage[]>([]);
    const [report, setReport] = useState<PerformanceReport | null>(null);
    const [error, setError] = useState('');
    const { trackAction } = useChallenge();

    // --- Refs ---
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const outputAudioSources = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextAudioStartTime = useRef<number>(0);
    // NEW: The status flag to solve the race condition
    const connectionStatusRef = useRef<ConnectionStatus>('idle');

    // --- Audio Helper Functions (no changes) ---
    const encode = (bytes: Uint8Array) => { /* ... */ return btoa(''); };
    const createBlob = (data: Float32Array): Blob => { /* ... */ return { data: '', mimeType: '' }; };
    const decode = (base64: string) => { /* ... */ return new Uint8Array(); };
    const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => { /* ... */ return ctx.createBuffer(1,1,sampleRate); };

    // --- Core Functions ---
    const cleanupAudio = () => {
        // CRITICAL: Set the status to closed FIRST. This acts as a flag for all other async operations to stop.
        connectionStatusRef.current = 'closed';

        if (audioWorkletNodeRef.current) {
            audioWorkletNodeRef.current.port.onmessage = null;
            audioWorkletNodeRef.current.port.close();
            audioWorkletNodeRef.current.disconnect();
            audioWorkletNodeRef.current = null;
        }

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(console.error);
        }
        inputAudioContextRef.current = null;

        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        
        outputAudioSources.current.forEach(source => source.stop());
        outputAudioSources.current.clear();
        
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(console.error);
        }
        outputAudioContextRef.current = null;
        nextAudioStartTime.current = 0;
    };
    
    const stopSimulation = async () => {
        if (simulatorState !== 'active') return;
        
        // Also set status here to be extra safe
        connectionStatusRef.current = 'closed';
        setSimulatorState('processing_report');
        
        sessionPromiseRef.current?.then(session => session.close());
        cleanupAudio();
        
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

        // Reset state for a new session
        cleanupAudio();
        setConversation([{ speaker: 'ai', text: selectedScenario.aiWelcome }]);
        setSimulatorState('active');
        setError('');
        connectionStatusRef.current = 'connecting'; // Set status

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // NEW CHECK: If cleanup was called while waiting for mic permission, abort.
            if (connectionStatusRef.current !== 'connecting') return;
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        // CRITICAL CHECK: Abort if cleanup has been called while connecting.
                        if (connectionStatusRef.current !== 'connecting') {
                            console.log("Aborting audio setup: connection status is no longer 'connecting'.");
                            return;
                        }
                        connectionStatusRef.current = 'open'; // We are officially open!

                        try {
                            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                            inputAudioContextRef.current = inputCtx;

                            await inputCtx.audioWorklet.addModule('/pcm-processor.js');

                            if (inputCtx.state === 'closed') {
                                console.log("Aborting audio setup: context has been closed.");
                                return;
                            }
                            
                            const source = inputCtx.createMediaStreamSource(stream);
                            const pcmWorkletNode = new AudioWorkletNode(inputCtx, 'pcm-processor');
                            audioWorkletNodeRef.current = pcmWorkletNode;

                            pcmWorkletNode.port.onmessage = (event) => {
                                // CRITICAL CHECK: Only send data if the connection is fully open.
                                if (connectionStatusRef.current === 'open') {
                                    const pcmData = event.data;
                                    const pcmBlob = createBlob(pcmData);
                                    sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                                }
                            };
                            
                            source.connect(pcmWorkletNode);
                            pcmWorkletNode.connect(inputCtx.destination);
                            
                        } catch (workletError) {
                            console.error('Error setting up AudioWorklet:', workletError);
                            setError('Failed to initialize audio processor.');
                            stopSimulation();
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         // Only process messages if the connection is still open
                        if (connectionStatusRef.current !== 'open') return;
                        // ... (rest of onmessage logic is unchanged)
                    },
                    onerror: (e: ErrorEvent) => {
                        if (connectionStatusRef.current !== 'closed') {
                          console.error('Live session error:', e);
                          setError('A conversation session error occurred.');
                          stopSimulation();
                        }
                    },
                    onclose: () => {
                        console.debug('Live session closed.');
                        cleanupAudio();
                    },
                },
                config: {
                    // ... (config is unchanged)
                },
            });

        } catch (err) {
            console.error("Error starting simulation: ", err);
            setError('Mikrofon erişimi reddedildi veya bulunamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.');
            setSimulatorState('briefing');
            connectionStatusRef.current = 'closed';
        }
    };
    
    useEffect(() => {
        return () => {
            sessionPromiseRef.current?.then(session => session.close());
            cleanupAudio();
        }
    }, []);
    
    // --- Render Functions (no changes below this line) ---
    // ...
};

export default SpeakingSimulator;
