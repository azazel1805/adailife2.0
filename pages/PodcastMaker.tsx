import React, { useState, useRef } from 'react';
import { generatePodcastAudio } from '../services/geminiService';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { PodcastIcon } from '../components/icons/Icons';

// Audio decoding functions from Gemini documentation for raw PCM data.
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Function to convert an AudioBuffer into a WAV Blob to be used in <audio> tag
const bufferToWave = (abuffer: AudioBuffer): Blob => {
    const numOfChan = abuffer.numberOfChannels;
    const sampleRate = abuffer.sampleRate;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };

    const setUint32 = (data: number) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };

    // Write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (let i = 0; i < abuffer.numberOfChannels; i++) {
        channels.push(abuffer.getChannelData(i));
    }
    
    // Write PCM data
    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = sample < 0 ? sample * 32768 : sample * 32767;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([view], { type: 'audio/wav' });
};


const PodcastMaker: React.FC = () => {
    const [script, setScript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const handleGenerate = async () => {
        if (!script.trim()) {
            setError('Please enter a script for your podcast.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        
        try {
            const base64Audio = await generatePodcastAudio(script);

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioCtx = audioContextRef.current;
            
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);
            
            const wavBlob = bufferToWave(audioBuffer);
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);

        } catch (e: any) {
            setError(e.message || 'An error occurred while generating the podcast.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50 flex items-center justify-center gap-3">
                        <PodcastIcon /> Podcast Oluşturucu
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Aşağıya metninizi girin ve tek kişilik bir sesli podcast oluşturun.
                    </p>
                </div>

                <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Podcast metninizi buraya yazın..."
                    className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none text-slate-800 dark:text-slate-200 resize-y transition-colors"
                    disabled={isLoading}
                />
                
                <ErrorMessage message={error} />
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !script.trim()}
                    className="mt-4 w-full bg-adai-primary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-400 flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    {isLoading ? 'Podcast Oluşturuluyor...' : 'Podcast Oluştur'}
                </button>
            </div>

            {isLoading && <Loader />}

            {audioUrl && (
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 animate-fade-in">
                    <h3 className="text-xl font-bold text-adai-primary mb-4">Podcast'iniz Hazır!</h3>
                    <audio controls src={audioUrl} className="w-full">
                        Tarayıcınız ses elementini desteklemiyor.
                    </audio>
                </div>
            )}
        </div>
    );
};

export default PodcastMaker;
