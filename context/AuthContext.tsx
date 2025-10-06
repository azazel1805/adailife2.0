import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    User, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut
} from 'firebase/auth';
import { auth, db } from '/src/firebase';
import { doc, onSnapshot, Timestamp } from "firebase/firestore";

// Kullanıcının Firestore'daki profil verisi için bir tip tanımı
interface UserProfile {
    email: string;
    createdAt: Timestamp;
    subscription?: {
        status: string;
        endDate: Timestamp; // Firestore'dan Timestamp bu şekilde gelir
    }
}

// Context'in tip tanımı
interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    isSubscribed: boolean; // Üyelik durumunu kolayca kontrol etmek için
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let profileUnsubscribe: () => void | undefined; // Firestore listener'ını temizlemek için

        const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            
            // Eğer daha önce bir profil dinleyicisi varsa temizle
            if (profileUnsubscribe) {
                profileUnsubscribe();
            }

            if (currentUser) {
                // Kullanıcı giriş yaptıysa, Firestore'dan profilini ANLIK olarak dinle
                const userDocRef = doc(db, "users", currentUser.uid);
                profileUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserProfile(snapshot.data() as UserProfile);
                    } else {
                        console.error("Kullanıcı profili bulunamadı. Bu durum, kayıt sırasında bir hata oluştuğunu gösterebilir.");
                        setUserProfile(null);
                    }
                    setLoading(false);
                });
            } else {
                // Kullanıcı çıkış yaptıysa, tüm verileri temizle
                setUserProfile(null);
                setLoading(false);
            }
        });

        // Component DOM'dan kaldırıldığında her iki listener'ı da temizle
        return () => {
            authUnsubscribe();
            if (profileUnsubscribe) {
                profileUnsubscribe();
            }
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Giriş sırasında hata oluştu:", error);
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
    
    // Üyelik durumunu kontrol eden kullanışlı bir boolean değişken
    const isSubscribed = 
        !!userProfile && 
        userProfile.subscription?.status === 'active' &&
        userProfile.subscription.endDate.toDate() > new Date();
    
    const value = {
        user,
        userProfile,
        isSubscribed,
        loading,
        login,
        logout,
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
