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
    let mounted = true;
    let hasResolved = false;

    // Safety timeout - ensure loading state resolves after 5 seconds max
    const timeout = setTimeout(() => {
      if (mounted && !hasResolved) {
        console.warn('Auth state timeout - forcing loading to false');
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
        hasResolved = true;
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged((user) => {
      if (mounted) {
        hasResolved = true;
        setState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
          error: null,
        });
      }
    });

    // Check for redirect result (after Google sign-in redirect)
    // We must handle success explicitly because onAuthStateChanged may fire
    // with null before Firebase processes the redirect result
    getGoogleRedirectResult()
      .then((result) => {
        if (mounted) {
          if (result.success && result.user) {
            // Success: update state with the authenticated user
            setState({
              user: result.user,
              isLoading: false,
              isAuthenticated: true,
              error: null,
            });
          } else if (result.error) {
            // Error: show error message
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: result.error?.message || null
            }));
          }
        }
      })
      .catch((err) => {
        console.error('Error getting redirect result:', err);
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Error al procesar inicio de sesión'
          }));
        }
      });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
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
  // Note: We don't set isLoading here because this only sends an email,
  // not a full authentication. The MagicLinkForm component handles its own
  // loading state (isSending). Setting isLoading here would unmount the form
  // and lose its internal state (like isSent), causing the user to see
  // the form again instead of the success message.
  const signInWithMagicLink = useCallback(async (email: string): Promise<AuthResult> => {
    setState((prev) => ({ ...prev, error: null }));

    const result = await sendMagicLink(email);

    if (!result.success) {
      setState((prev) => ({
        ...prev,
        error: result.error?.message || 'Error al enviar enlace',
      }));
    }

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
