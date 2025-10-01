import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    Auth, 
    User, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { auth } from '/src/firebase'; // Az önce oluşturduğumuz dosyadan auth'u import ediyoruz

// Kullanıcı state'i artık bir string değil, Firebase'in User objesi veya null olabilir.
interface AuthContextType {
    user: User | null;
    loading: boolean; // Sayfa ilk yüklendiğinde auth durumunu kontrol ederken bir yükleme durumu eklemek iyidir.
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Bu useEffect, Firebase'in auth durumundaki değişiklikleri dinler.
    // Kullanıcı giriş yaptığında, çıkış yaptığında veya sayfa yenilendiğinde çalışır.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // Component unmount olduğunda listener'ı temizle
        return () => unsubscribe();
    }, []);

    // Login fonksiyonunu Firebase'e göre güncelliyoruz
    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Giriş sırasında hata oluştu:", error);
            // Hata mesajını kullanıcıya göstermek için burada bir state yönetimi yapabilirsiniz.
            throw error;
        }
    };

    // Logout fonksiyonunu Firebase'e göre güncelliyoruz
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Çıkış sırasında hata oluştu:", error);
        }
    };
    
    const value = {
        user,
        loading,
        login,
        logout,
    };

    // Yükleme tamamlanana kadar çocuk bileşenleri render etme, böylece auth durumu netleşir.
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};