import React, { useState, useRef } from 'react';
import { convertImageToText } from '../services/geminiService';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { HandwritingConverterIcon } from '../components/icons/Icons';

const HandwritingConverter: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [convertedText, setConvertedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (jpeg, png, etc.).');
            return;
        }
        setError('');
        setImageFile(file);
        setConvertedText('');
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };
    
    const handleConvert = async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setConvertedText('');
        try {
            const text = await convertImageToText(imageFile);
            setConvertedText(text);
        } catch (e: any) {
            setError(e.message || 'An error occurred during conversion.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!convertedText) return;
        const blob = new Blob([convertedText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted-text.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        setImageFile(null);
        setImagePreview(null);
        setConvertedText('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-50 flex items-center justify-center gap-3">
                        <HandwritingConverterIcon /> El Yazısı Dönüştürücü
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        El yazısı notlarınızın veya beyaz tahta fotoğraflarınızın resmini yükleyin ve düzenlenebilir metne dönüştürün.
                    </p>
                </div>

                {!imagePreview ? (
                    <div
                        className="mt-4 p-10 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-adai-primary hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-5xl">🖼️</span>
                            <p className="mt-2 text-slate-900 dark:text-slate-200 font-semibold">Resim Dosyasını Buraya Sürükleyin veya Tıklayın</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG, JPG, WEBP, vb.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img src={imagePreview} alt="Uploaded preview" className="w-full h-auto max-h-[400px] object-contain" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                             <button
                                onClick={handleConvert}
                                disabled={isLoading}
                                className="flex-grow bg-adai-primary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:bg-slate-400 flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                {isLoading ? 'Dönüştürülüyor...' : 'Metne Dönüştür'}
                            </button>
                             <button
                                onClick={handleClear}
                                disabled={isLoading}
                                className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
                            >
                                Temizle
                            </button>
                        </div>
                    </div>
                )}
                
                <ErrorMessage message={error} />
                {isLoading && <Loader />}

                {convertedText && (
                    <div className="mt-6 border-t-2 border-slate-200 dark:border-slate-800 pt-6 animate-fade-in">
                        <h3 className="text-xl font-bold text-adai-primary mb-4">Dönüştürülen Metin</h3>
                        <textarea
                            value={convertedText}
                            onChange={(e) => setConvertedText(e.target.value)}
                            className="w-full h-72 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-adai-primary focus:outline-none text-slate-800 dark:text-slate-200 resize-y transition-colors"
                            placeholder="Converted text will appear here..."
                        />
                         <button
                            onClick={handleDownload}
                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
                        >
                            Metni İndir (.txt)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HandwritingConverter;
