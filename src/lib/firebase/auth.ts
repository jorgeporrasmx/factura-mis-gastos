import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './config';
import type { User, AuthResult } from '@/types/auth';

// Google Auth Provider (lazy init)
let googleProvider: GoogleAuthProvider | null = null;

function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
  }
  return googleProvider;
}

// Error when Firebase is not configured
const notConfiguredError: AuthResult = {
  success: false,
  error: {
    code: 'auth/not-configured',
    message: 'Firebase no está configurado. Por favor configura las variables de entorno.',
  },
};

// Convert Firebase User to our User type
export function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
  };
}

// Sign in with Google (popup - for desktop)
export async function signInWithGoogle(): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return notConfiguredError;

  try {
    const result = await signInWithPopup(auth, getGoogleProvider());
    return {
      success: true,
      user: mapFirebaseUser(result.user),
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: err.message || 'Error al iniciar sesión con Google',
      },
    };
  }
}

// Sign in with Google (redirect - for mobile)
export async function signInWithGoogleRedirect(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;

  await signInWithRedirect(auth, getGoogleProvider());
}

// Get redirect result after Google redirect
export async function getGoogleRedirectResult(): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return { success: false };

  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return {
        success: true,
        user: mapFirebaseUser(result.user),
      };
    }
    return { success: false };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: err.message || 'Error al obtener resultado de redirección',
      },
    };
  }
}

// Send magic link to email
export async function sendMagicLink(email: string): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return notConfiguredError;

  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/verify`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // Save email locally to complete sign-in when user returns
    window.localStorage.setItem('emailForSignIn', email);

    return { success: true };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: err.message || 'Error al enviar el enlace',
      },
    };
  }
}

// Check if current URL is a magic link
export function isMagicLink(url: string): boolean {
  const auth = getFirebaseAuth();
  if (!auth) return false;

  return isSignInWithEmailLink(auth, url);
}

// Complete magic link sign-in
export async function completeMagicLinkSignIn(url: string, email?: string): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return notConfiguredError;

  try {
    // Get email from localStorage if not provided
    const signInEmail = email || window.localStorage.getItem('emailForSignIn');

    if (!signInEmail) {
      return {
        success: false,
        error: {
          code: 'auth/missing-email',
          message: 'No se encontró el email. Por favor ingresa tu email nuevamente.',
        },
      };
    }

    const result = await signInWithEmailLink(auth, signInEmail, url);

    // Clear stored email
    window.localStorage.removeItem('emailForSignIn');

    return {
      success: true,
      user: mapFirebaseUser(result.user),
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: err.message || 'Error al verificar el enlace',
      },
    };
  }
}

// Sign out
export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;

  await firebaseSignOut(auth);
}

// Listen to auth state changes
export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  const auth = getFirebaseAuth();

  if (!auth) {
    // If auth is not configured, call callback with null once and return noop
    callback(null);
    return () => {};
  }

  return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
  });
}

// Get current user
export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  const firebaseUser = auth.currentUser;
  return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
}
