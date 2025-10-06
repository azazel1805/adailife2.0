import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '/src/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';

// Logo Bileşeni
const AdaiLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
        <defs>
            <radialGradient id="glow-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e9d5ff" />
                <stop offset="75%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
        </defs>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="35" fontWeight="bold">
            <tspan fill="url(#glow-gradient)">ADA</tspan>
            <tspan fill="#FFFFFF" dx="-0.26em">I</tspan>
        </text>
    </svg>
);

interface SignUpPageProps {
    onSwitchToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [activationCode, setActivationCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        const formattedCode = activationCode.trim();

        if (!formattedCode) {
            setError('Lütfen bir aktivasyon kodu giriniz.');
            setLoading(false); // Yüklemeyi durdur
            return; // Fonksiyonun devam etmesini engelle
        }

        try {
            const codeRef = doc(db, "activationCodes", formattedCode);
            const codeSnap = await getDoc(codeRef);

            if (!codeSnap.exists() || codeSnap.data().status !== 'unused') {
                setError('Geçersiz veya daha önce kullanılmış bir aktivasyon kodu girdiniz.');
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const batch = writeBatch(db);

            const userProfileRef = doc(db, "users", user.uid);
            const subscriptionEndDate = new Date();
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // 30 günlük üyelik
            
            batch.set(userProfileRef, {
                email: user.email,
                createdAt: new Date(),
                subscription: {
                    status: "active",
                    endDate: subscriptionEndDate,
                }
            });

            batch.update(codeRef, {
                status: "used",
                usedBy: user.uid,
                usedAt: new Date()
            });

            await batch.commit();
            
        } catch (err: any) {
            console.error("Detaylı Hata:", err); // Hatanın tamamını konsola yazdır
            if (err.code === 'auth/email-already-in-use') {
                setError('Bu e-posta adresi zaten kullanılıyor.');
            } else if (err.code === 'auth/weak-password') {
                setError('Şifre en az 6 karakter olmalıdır.');
            } else {
                setError('Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-slate-900 dark:bg-slate-800 rounded-full shadow-lg">
                        <AdaiLogo className="w-20 h-20" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Hesap Oluştur</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">ADAI dünyasına katıl ve öğrenmeye başla!</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta Adresi</label>
                            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-adai-primary focus:outline-none focus:ring-2 focus:ring-adai-primary transition" />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Şifre Belirle</label>
                            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-adai-primary focus:outline-none focus:ring-2 focus:ring-adai-primary transition" />
                        </div>
                        <div>
                            <label htmlFor="activationCode" className="text-sm font-medium text-slate-700 dark:text-slate-300">Aktivasyon Kodu</label>
                            <input id="activationCode" type="text" required value={activationCode} onChange={(e) => setActivationCode(e.target.value)} placeholder="E-postanıza gelen kodu girin" className="mt-2 block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-adai-primary focus:outline-none focus:ring-2 focus:ring-adai-primary transition" />
                            <div className="text-center mt-3">
                                <a 
                                    href="https://www.shopier.com/39960454" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-sm font-medium text-adai-primary hover:text-adai-secondary transition-colors"
                                >
                                    Aktivasyon kodun yok mu? Hemen satın al!
                                </a>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}

                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center rounded-lg bg-adai-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-adai-secondary disabled:cursor-not-allowed disabled:opacity-70">
                                {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol ve Başla'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Zaten bir hesabın var mı?{' '}
                        <button onClick={onSwitchToLogin} className="font-semibold text-adai-primary hover:text-adai-secondary">Giriş Yap</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
