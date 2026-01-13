'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  sendMagicLink,
  completeMagicLinkSignIn,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getGoogleRedirectResult,
} from '@/lib/firebase/auth';
import type { User, AuthState, AuthResult, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
        error: null,
      });
    });

    // Check for redirect result (mobile Google sign-in)
    getGoogleRedirectResult().then((result) => {
      if (result.error) {
        setState((prev) => ({ ...prev, error: result.error?.message || null }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const result = await firebaseSignInWithGoogle();

    if (!result.success) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error?.message || 'Error al iniciar sesión',
      }));
    }

    return result;
  }, []);

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (email: string): Promise<AuthResult> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const result = await sendMagicLink(email);

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: result.success ? null : (result.error?.message || 'Error al enviar enlace'),
    }));

    return result;
  }, []);

  // Verify magic link
  const verifyMagicLink = useCallback(async (url: string): Promise<AuthResult> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const result = await completeMagicLinkSignIn(url);

    if (!result.success) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error?.message || 'Error al verificar enlace',
      }));
    }

    return result;
  }, []);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    await firebaseSignOut();
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  }, []);

  // Refresh user (force reload)
  const refreshUser = useCallback(async (): Promise<void> => {
    // The auth state listener will handle updates
    setState((prev) => ({ ...prev, isLoading: true }));
  }, []);

  const value: AuthContextType = {
    ...state,
    signInWithGoogle,
    signInWithMagicLink,
    verifyMagicLink,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}

export { AuthContext };
