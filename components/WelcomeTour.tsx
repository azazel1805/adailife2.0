import React, { useState } from 'react';
import { PracticeToolsIcon, TutorIcon, DashboardIcon, DeconstructIcon, DictionaryIcon, GamesIcon, PlannerIcon } from './icons/Icons';

interface WelcomeTourProps {
    onFinish: () => void;
}

const tourSteps = [
    {
        icon: '👋',
        title: "ADAI'ye Tekrar Hoş Geldiniz!",
        description: 'Öğrenme deneyiminizi daha da zenginleştirmek için eklediğimiz yeni ve geliştirilmiş özellikleri keşfedin. Bu kısa tur size yol gösterecek.',
    },
    {
        icon: <DashboardIcon />,
        title: 'Kontrol Paneli: Günlük Merkeziniz',
        description: "Güne buradan başlayın. Günlük hedeflerinizi belirleyin, kelime dağarcığınızı görün ve en son başarımlarınızı kutlayın. Motivasyonunuzu her zaman yüksek tutun!",
    },
    {
        icon: <PracticeToolsIcon />,
        title: 'Temel Becerileri Geliştirin',
        description: "'Pratik Araçları' ile konuşma, yazma, dinleme ve okuma becerilerinizi geliştirin. Konuşma Simülatörü ve Yaratıcı Yazma Partneri gibi araçlarla interaktif pratik yapın.",
    },
    {
        icon: <DeconstructIcon />,
        title: 'Derinlemesine Dil Analizi',
        description: "Metinleri ve cümleleri 'Metin Analizi' ve 'Cümle Görselleştirici' gibi araçlarla parçalarına ayırın. Soru Analisti ile sınav sorularının mantığını çözün.",
    },
    {
        icon: <GamesIcon />,
        title: 'Oyunlarla Öğrenin!',
        description: "Yeni 'Oyunlar' bölümüyle öğrenmeyi eğlenceye dönüştürün! Kelime Bulmaca, Adam Asmaca ve Word Sprint gibi oyunlarla kelime ve gramer bilginizi test edin.",
    },
    {
        icon: <DictionaryIcon />,
        title: 'Kelime ve Okuma Dünyası',
        description: "Geleneksel sözlüğün yanı sıra, 'Görsel Sözlük' ile nesnelerin İngilizce karşılıklarını kameranızla öğrenin. 'Kelime Hikayesi' ile kelimeleri bağlam içinde görün.",
    },
    {
        icon: <PlannerIcon />,
        title: 'Akıllı Rehberlik: Planlayıcı ve Eğitmen',
        description: "Performansınıza göre size özel bir yol haritası çizen 'Akıllı Planlayıcı' ile verimli çalışın. Aklınıza takılan her şeyi kişisel 'AI Eğitmeniniz' Onur'a sorun.",
    },
    {
        icon: '🚀',
        title: 'Keşfetmeye Hazırsınız!',
        description: 'Artık tüm yeni araçlara hakimsiniz. Potansiyelinizi ortaya çıkarma ve İngilizce hedeflerinize ulaşma zamanı. Başarılar dileriz!',
    }
];


const WelcomeTour: React.FC<WelcomeTourProps> = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onFinish();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const step = tourSteps[currentStep];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden border-2 border-slate-200 dark:border-slate-800 animate-fade-in">
                <div className="p-8 text-center">
                    <div className="text-6xl mb-4 flex items-center justify-center h-16">{step.icon}</div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">{step.title}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{step.description}</p>
                </div>

                <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/50 flex flex-col items-center gap-4 border-t-2 border-slate-200 dark:border-slate-800">
                    <div className="flex justify-center gap-2">
                        {tourSteps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    currentStep === index ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                                }`}
                                aria-label={`Go to step ${index + 1}`}
                            />
                        ))}
                    </div>
                    <div className="w-full flex justify-between items-center mt-2">
                        {currentStep < tourSteps.length - 1 ? (
                             <button onClick={onFinish} className="text-sm text-slate-500 dark:text-slate-400 hover:underline">
                                Turu Atla
                            </button>
                        ) : (
                           <div/> // Placeholder to keep the "Next" button on the right
                        )}
                       
                        <div className="flex gap-2">
                             {currentStep > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-colors"
                                >
                                    Geri
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                {currentStep === tourSteps.length - 1 ? 'Bitir' : 'İleri'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeTour;
