import React, { useState } from 'react';
import { PracticeToolsIcon, TutorIcon, DashboardIcon, DeconstructIcon, DictionaryIcon, GamesIcon, PlannerIcon } from './icons/Icons'; // Bu ikonları kendi dosyanızdan import edin

// Özellik verilerini daha kolay yönetmek için bir diziye dönüştürelim
const featuresData = [
    {
        title: "1. Yapay Zeka Destekli Analiz ve Eğitmen Araçları",
        icon: <TutorIcon />,
        items: [
            "AI Eğitmen (Onur): Aklınıza takılan her türlü soruyu sorabileceğiniz kişisel yapay zeka hocanız.",
            "Soru Analisti: Sınav sorularının mantığını, çeldiricilerini ve çözüm stratejilerini adım adım analiz eder.",
            "Metin ve Cümle Analizi Araçları: Metinleri cümlelerine ayırır, gramer yapılarını gösterir ve metin akışını inceler.",
            "Çeviri ve Anlam Analistleri: Bir cümlenin farklı bağlamlardaki çevirilerini ve ton, resmilik gibi anlam katmanlarını öğrenin."
        ]
    },
    {
        title: "2. Dört Beceride Uzmanlaşma",
        icon: <PracticeToolsIcon />,
        items: [
            "Konuşma: Konuşma Simülatörü ile günlük senaryolarda pratik yapın ve AI Partner ile serbest sohbet edin.",
            "Yazma: Yazma Asistanı ile anında geri bildirim alın, Essay Taslağı ile fikirlerinizi organize edin.",
            "Okuma: Okuma Anlama Analizi ile metinleri özetleyin, Etkileşimli Gündem ile güncel haberleri okuyun.",
            "Dinleme: Farklı zorluk seviyelerinde dinleme metinleri ve soruları ile kendinizi test edin."
        ]
    },
    {
        title: "3. Kelime Dağarcığınızı Zirveye Taşıyın",
        icon: <DictionaryIcon />,
        items: [
            "Kapsamlı Sözlük: '5 Yaşında Gibi Anlat' özelliğiyle en zor kelimeleri bile kolayca anlayın.",
            "Görsel Sözlük: Telefonunuzun kamerasıyla bir nesnenin fotoğrafını çekin ve İngilizce karşılığını öğrenin.",
            "Kelime Antrenörü: Kaydettiğiniz kelimelerle bilgi kartları (flashcard) veya testler oluşturarak pratik yapın.",
            "Kelime Hikayesi Oluşturucu: Seçtiğiniz kelimeleri kullanarak size özel bir hikaye oluşturur."
        ]
    },
    {
        title: "4. Oyunlarla Öğrenin!",
        icon: <GamesIcon />,
        items: [
            "Kelime Oyunları: Word Sprint, Adam Asmaca ve Kelime Bulmaca ile kelime dağarcığınızı test edin.",
            "Yaratıcılık Oyunları: Grammar Gaps ve Kavram Dokuyucu gibi oyunlarla yaratıcılığınızı konuşturun."
        ]
    },
    {
        title: "5. Sınav Hazırlığı ve İlerleme Takibi",
        icon: <PlannerIcon />,
        items: [
            "PDF Sınav Yükleyici: Elinizdeki deneme sınavı PDF'lerini interaktif bir sınava dönüştürün.",
            "Geçmiş: Yaptığınız tüm analizlerin ve çözdüğünüz sınavların sonuçlarını tek bir yerde saklayın.",
            "Kontrol Paneli (Dashboard): Günlük hedeflerinizi, ilerlemenizi ve istatistiklerinizi bir bakışta görün."
        ]
    }
];

const FeaturesAccordion: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // İlk madde açık başlasın

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-md mx-auto my-8 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-200 mb-4">ADAI Neler Sunuyor?</h2>
            <div className="space-y-2">
                {featuresData.map((feature, index) => (
                    <div key={index} className="border-b border-slate-200 dark:border-slate-800 last:border-b-0">
                        <button
                            onClick={() => handleToggle(index)}
                            className="w-full flex justify-between items-center text-left p-4 focus:outline-none"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-adai-primary">{feature.icon}</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{feature.title}</span>
                            </div>
                            <svg
                                className={`w-5 h-5 text-slate-500 transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                        >
                            <ul className="list-disc pl-12 pr-4 pb-4 space-y-2 text-slate-500 dark:text-slate-400">
                                {feature.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturesAccordion;
