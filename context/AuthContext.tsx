import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    User, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,    // YENİ EKLENDİ
    signInWithPopup        // YENİ EKLENDİ
} from 'firebase/auth';
import { auth } from '/src/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signInWithGoogle: () => Promise<void>; // YENİ EKLENDİ: Google ile giriş fonksiyonu
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Giriş sırasında hata oluştu:", error);
            throw error;
        }
    };
    
    // YENİ EKLENDİ: Google ile giriş fonksiyonunun mantığı
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // Başarılı girişten sonra onAuthStateChanged tetiklenecek ve user state'ini güncelleyecektir.
        } catch (error) {
            console.error("Google ile giriş sırasında hata oluştu:", error);
            throw error;
        }
    };

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
        signInWithGoogle, // YENİ EKLENDİ: Fonksiyonu context'e ekliyoruz
    };

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
