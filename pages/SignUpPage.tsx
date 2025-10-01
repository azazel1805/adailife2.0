import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '/src/firebase'; // Firebase yapılandırmamızı import ediyoruz

// LoginPage'deki logoyu tekrar kullanabiliriz, buraya da ekleyelim
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
    onSwitchToLogin: () => void; // Login sayfasına dönmek için bir fonksiyon prop'u
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Firebase'in kullanıcı oluşturma fonksiyonunu çağırıyoruz
            await createUserWithEmailAndPassword(auth, email, password);
            // Kayıt başarılı olduğunda AuthContext'teki onAuthStateChanged
            // bunu algılayacak ve kullanıcıyı otomatik olarak içeri alacaktır.
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Bu e-posta adresi zaten kullanılıyor.');
            } else if (err.code === 'auth/weak-password') {
                setError('Şifre en az 6 karakter olmalıdır.');
            } else {
                setError('Kayıt sırasında bir hata oluştu.');
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
                            Hesap Oluştur
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            ADAI dünyasına katıl ve öğrenmeye başla!
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* E-posta ve Şifre inputları LoginPage ile aynı */}
                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta Adresi</label>
                            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-adai-primary focus:outline-none focus:ring-2 focus:ring-adai-primary transition" />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Şifre</label>
                            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-adai-primary focus:outline-none focus:ring-2 focus:ring-adai-primary transition" />
                        </div>

                        {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}

                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center rounded-lg bg-adai-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-adai-secondary disabled:cursor-not-allowed disabled:opacity-70">
                                {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Zaten bir hesabın var mı?{' '}
                        {/* Bu linke tıklandığında Login sayfasına döneceğiz */}
                        <button onClick={onSwitchToLogin} className="font-semibold text-adai-primary hover:text-adai-secondary">
                            Giriş Yap
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;