

import React, { useState } from 'react';
import { PracticeToolsIcon, TutorIcon, DashboardIcon, ExamIcon, SkillTreeIcon, PlannerIcon } from './icons/Icons';

interface WelcomeTourProps {
    onFinish: () => void;
}

const tourSteps = [
    {
        icon: '👋',
        title: "ADAI Language Assistant'a Hoş Geldiniz!",
        description: 'Öğrenme sürecinizi tamamen değiştirecek yapay zeka destekli yardımcınızla tanışın. Bu kısa tur, yenilenen özellikleri keşfetmenize yardımcı olacak.',
    },
    {
        icon: <DashboardIcon />,
        title: 'Kontrol Paneli: Strateji Merkeziniz',
        description: "Güne Dashboard'dan başlayın. Günlük hedeflerinizi belirleyin, ilerlemenizi takip edin ve genel durumunuzu bir bakışta görün. Motivasyonunuzu her zaman yüksek tutun!",
    },
    {
        icon: <ExamIcon />,
        title: 'Odaklı Analiz Araçları',
        description: 'Paragraf analizi, cümle sıralama ve çeviri gibi araçlarla belirli becerilerinizi derinlemesine geliştirin. Bu bölüm, zayıf yönlerinizi güçlendirmeniz için tasarlandı.',
    },
    {
        icon: <SkillTreeIcon />,
        title: 'Yetenek Ağacınızla Gelişiminizi İzleyin',
        description: 'Yaptığınız pratiklere göre genel dil becerilerindeki güçlü ve zayıf yönlerinizi görsel olarak takip edin. Hangi konuya odaklanmanız gerektiğini anında görün.',
    },
    {
        icon: <PlannerIcon />,
        title: 'Akıllı Planlayıcı ile Verimli Çalışın',
        description: 'Performansınıza göre size özel hazırlanan haftalık çalışma programları ile hedeflerinize daha hızlı ulaşın.',
    },
    {
        icon: <TutorIcon />,
        title: 'Kişisel Rehberiniz: AI Eğitmen',
        description: "Aklınıza takılan her konuda 7/24 yanınızdaki kişisel AI Eğitmeniniz Onur'a danışın.",
    },
    {
        icon: <PracticeToolsIcon />,
        title: 'Kapsamlı Pratik Araçları',
        description: "Metin Analizi'nden Konuşma Simülatörü'ne kadar 4 temel dil becerinizi ve tekniğinizi geliştirecek onlarca araç sizi bekliyor.",
    },
    {
        icon: '🚀',
        title: 'Yolculuğunuz Başlıyor!',
        description: 'Artık tüm araçlara hakimsiniz. Potansiyelinizi ortaya çıkarma zamanı. Başarılar dileriz!',
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