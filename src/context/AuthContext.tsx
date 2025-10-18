import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Define the shape of the user object we'll store in the context
interface AppUser {
    uid: string;
    email: string | null;
    name?: string;
    role?: string;
    token?: string;
}

// Define the type for the context value
interface AuthContextType {
    currentUser: AppUser | null;
    isLoading: boolean;
    logout: () => Promise<void>;
}

// Create and EXPORT the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            if (user) {
                // User is signed in, fetch their custom data from Firestore
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                const token = await user.getIdToken();

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setCurrentUser({
                        uid: user.uid,
                        email: user.email,
                        name: userData.name,
                        role: userData.role,
                        token: token,
                    });
                } else {
                     // Handle case where user exists in Auth but not Firestore
                    setCurrentUser({ uid: user.uid, email: user.email, role: 'Not assigned', token: token });
                }
            } else {
                // User is signed out
                setCurrentUser(null);
            }
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        currentUser,
        isLoading,
        logout,
    };

    // Don't render children until the auth state is determined
    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

