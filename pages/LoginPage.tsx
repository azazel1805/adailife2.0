import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import WelcomeTour from '../components/WelcomeTour';
import FeaturesAccordion from '../components/FeaturesAccordion';

// Logo Bileşeni
const AdaiLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
        <defs>
            <radialGradient id="glow-gradient-login" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e9d5ff" />
                <stop offset="75%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
        </defs>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="35" fontWeight="bold">
            <tspan fill="url(#glow-gradient-login)">ADA</tspan>
            <tspan fill="#FFFFFF" dx="-0.26em">I</tspan>
        </text>
    </svg>
);

interface LoginPageProps {
    onSwitchToSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const [showTour, setShowTour] = useState(false);
    const [showFeatures, setShowFeatures] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('E-posta veya şifre hatalı. Lütfen kontrol edin.');
            } else {
                setError('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {showTour && <WelcomeTour onFinish={() => setShowTour(false)} />}
            
            <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12">
                <div className="w-full max-w-md mx-auto">
                    
                    {!showFeatures && (
                        <>
                            <div className="text-center mb-8">
                                <div className="inline-block p-4 bg-slate-900 dark:bg-slate-800 rounded-full shadow-lg">
                                    <AdaiLogo className="w-20 h-20" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 space-y-6">
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Tekrar Hoş Geldin!</h1>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2">İngilizce yolculuğuna devam etmeye hazır mısın?</p>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta Adresi</label>
                                        <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-adai-primary focus:outline-none focus:ring-2 focus:ring-adai-primary transition" />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Şifre</label>
                                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-adai-primary focus:outline-none focus:ring-2 focus:ring-adai-primary transition" />
                                    </div>
                                    {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
                                    <div>
                                        <button type="submit" disabled={loading} className="w-full flex justify-center rounded-lg bg-adai-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-adai-secondary disabled:cursor-not-allowed disabled:opacity-70">
                                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}

                    {showFeatures && <FeaturesAccordion />}

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Hesabın yok mu?{' '}
                            <button onClick={onSwitchToSignUp} className="font-semibold text-adai-primary hover:text-adai-secondary">Kayıt Ol</button>
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            veya doğrudan{' '}
                            <a 
                                href="https://www.shopier.com/onurtosuner" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-semibold text-adai-primary hover:text-adai-secondary"
                            >
                                üyelik satın al!
                            </a>
                        </p>
                         <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 flex justify-center items-center gap-6">
                                 <button 
                                    onClick={() => setShowTour(true)}
                                    className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-adai-primary dark:hover:text-adai-primary transition-colors"
                                >
                                    Uygulama Turu ✨
                                </button>
                                
                                <button 
                                    onClick={() => setShowFeatures(!showFeatures)}
                                    className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-adai-primary dark:hover:text-adai-primary transition-colors"
                                >
                                    {showFeatures ? 'Giriş Yap' : 'Özellikleri Gör'}
                                </button>
                         </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
