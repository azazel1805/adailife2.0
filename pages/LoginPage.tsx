import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Tekrar Hoş Geldin!
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            İngilizce yolculuğuna devam etmeye hazır mısın?
                        </p>
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
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Giriş Yapılıyor...
                                    </>
                                ) : 'Giriş Yap'}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="text-center mt-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Hesabın yok mu?{' '}
                        <button onClick={onSwitchToSignUp} className="font-semibold text-adai-primary hover:text-adai-secondary">
                            Kayıt Ol
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;