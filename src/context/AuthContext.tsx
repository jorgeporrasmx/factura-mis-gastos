'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  companyId?: string;
  role?: 'admin' | 'user';
  createdAt?: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          // Create basic user data if doesn't exist
          const newUserData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'admin',
          };
          setUserData(newUserData);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Create or update user document in Firestore
  const createUserDocument = async (user: User, additionalData?: Partial<UserData>) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData?.displayName || null,
        photoURL: user.photoURL,
        role: 'admin',
        ...additionalData,
      };

      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
      });

      return userData;
    }

    return userSnap.data() as UserData;
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión con Google';
      setError(errorMessage);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      let errorMessage = 'Error al iniciar sesión';
      if (err instanceof Error) {
        if (err.message.includes('user-not-found')) {
          errorMessage = 'No existe una cuenta con este correo';
        } else if (err.message.includes('wrong-password')) {
          errorMessage = 'Contraseña incorrecta';
        } else if (err.message.includes('invalid-email')) {
          errorMessage = 'Correo electrónico inválido';
        }
      }
      setError(errorMessage);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with name
      await updateProfile(result.user, { displayName: name });

      // Create user document
      await createUserDocument(result.user, { displayName: name });
    } catch (err: unknown) {
      let errorMessage = 'Error al crear la cuenta';
      if (err instanceof Error) {
        if (err.message.includes('email-already-in-use')) {
          errorMessage = 'Ya existe una cuenta con este correo';
        } else if (err.message.includes('weak-password')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (err.message.includes('invalid-email')) {
          errorMessage = 'Correo electrónico inválido';
        }
      }
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(errorMessage);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      let errorMessage = 'Error al enviar el correo de recuperación';
      if (err instanceof Error) {
        if (err.message.includes('user-not-found')) {
          errorMessage = 'No existe una cuenta con este correo';
        }
      }
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
