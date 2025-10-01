import React from 'react';
import { AnalysisResult } from '../types';

const AnalysisResultDisplay: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    
    const renderValue = (value: any) => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return String(value);
    }

    return (
        <div className="space-y-4 mt-6 border-t-2 border-slate-200 dark:border-slate-800 pt-6">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-brand-primary mb-3">Analiz Özeti</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><strong className="text-slate-500 dark:text-slate-400">Soru Tipi:</strong> <span className="text-slate-800 dark:text-slate-200">{result.soruTipi || 'Belirtilmemiş'}</span></div>
                    <div><strong className="text-slate-500 dark:text-slate-400">Konu:</strong> <span className="text-slate-800 dark:text-slate-200">{result.konu || 'Belirtilmemiş'}</span></div>
                    <div><strong className="text-slate-500 dark:text-slate-400">Zorluk Seviyesi:</strong> <span className="text-slate-800 dark:text-slate-200">{result.zorlukSeviyesi || 'Belirtilmemiş'}</span></div>
                    <div className="sm:col-span-2"><strong className="text-slate-500 dark:text-slate-400">Doğru Cevap:</strong> <span className="font-bold text-green-600 text-base">{result.dogruCevap || 'Belirtilmemiş'}</span></div>
                </div>
            </div>

            {result.analiz && (
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-md font-semibold text-brand-primary mb-2">Detaylı Analiz Adımları</h4>
                    <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-200">
                        {Object.entries(result.analiz).map(([key, value]) => (
                            <li key={key} className="flex items-start">
                                <span className="text-brand-primary mr-2 mt-1">&#10148;</span>
                                <span><strong className="font-semibold capitalize text-slate-600 dark:text-slate-400">{key.replace(/_/g, ' ')}:</strong> {renderValue(value)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-brand-primary mb-2">Kapsamlı Açıklama</h4>
                <p className="text-sm text-slate-800 dark:text-slate-200">{result.detayliAciklama || 'Açıklama bulunamadı.'}</p>
            </div>

            {result.digerSecenekler && result.digerSecenekler.length > 0 && (
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-md font-semibold text-brand-primary mb-2">Diğer Seçeneklerin Analizi</h4>
                    <div className="space-y-3">
                        {result.digerSecenekler.map((opt, index) => (
                            <div key={index} className="p-3 bg-white dark:bg-slate-700 rounded-md border-l-4 border-red-400">
                                <p className="text-sm text-slate-800 dark:text-slate-200"><strong className="font-bold text-red-600">{opt.secenek}:</strong> {opt.aciklama}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisResultDisplay;