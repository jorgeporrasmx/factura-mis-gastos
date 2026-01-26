import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe,
  type ConfirmationResult,
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
    // Always show account selector when multiple accounts are available
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }
  return googleProvider;
}

// Phone auth confirmation result
let phoneConfirmationResult: ConfirmationResult | null = null;

// Error when Firebase is not configured
const notConfiguredError: AuthResult = {
  success: false,
  error: {
    code: 'auth/not-configured',
    message: 'Firebase no está configurado. Por favor configura las variables de entorno.',
  },
};

// Spanish error messages for better UX
function getSpanishErrorMessage(code?: string): string | null {
  const messages: Record<string, string> = {
    // General
    'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Permite ventanas emergentes e intenta de nuevo.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de inicio de sesión. Intenta de nuevo.',
    'auth/cancelled-popup-request': 'Se canceló la solicitud. Intenta de nuevo.',
    'auth/redirect-cancelled-by-user': 'Cancelaste el inicio de sesión. Intenta de nuevo.',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet e intenta de nuevo.',
    'auth/too-many-requests': 'Demasiados intentos. Espera un momento e intenta de nuevo.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
    'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado.',
    'auth/invalid-credential': 'Las credenciales son inválidas. Intenta de nuevo.',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email usando otro método de inicio de sesión.',
    'auth/credential-already-in-use': 'Esta credencial ya está asociada a otra cuenta.',
    'auth/timeout': 'La solicitud tardó demasiado. Intenta de nuevo.',
    'auth/web-storage-unsupported': 'Tu navegador no soporta almacenamiento local. Habilítalo o usa otro navegador.',
    // Phone auth
    'auth/invalid-phone-number': 'El número de teléfono no es válido. Usa el formato +52 seguido de 10 dígitos.',
    'auth/missing-phone-number': 'Por favor ingresa un número de teléfono.',
    'auth/quota-exceeded': 'Se excedió el límite de SMS. Intenta más tarde.',
    'auth/invalid-verification-code': 'El código de verificación es incorrecto.',
    'auth/code-expired': 'El código ha expirado. Solicita uno nuevo.',
    'auth/captcha-check-failed': 'Error de verificación reCAPTCHA. Intenta de nuevo.',
    'auth/missing-verification-code': 'Por favor ingresa el código de verificación.',
    // Email/password
    'auth/email-already-in-use': 'Este email ya está registrado. Intenta iniciar sesión.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/user-not-found': 'No existe una cuenta con este email.',
    'auth/invalid-email': 'El email no es válido.',
  };
  return code ? messages[code] || null : null;
}

// Convert Firebase User to our User type
export function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  const providerId = firebaseUser.providerData[0]?.providerId;

  let provider: User['provider'] = 'email';
  if (providerId === 'google.com') provider = 'google';
  else if (providerId === 'phone') provider = 'phone';
  else if (providerId === 'password') provider = 'password';

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    phoneNumber: firebaseUser.phoneNumber,
    provider,
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
  };
}

// ============================================
// GOOGLE AUTH
// ============================================

// Sign in with Google (popup - for desktop)
export async function signInWithGoogle(): Promise<AuthResult> {
  const auth = getFirebaseAuth();

  if (!auth) {
    console.error('[GoogleAuth] Firebase Auth not configured');
    return notConfiguredError;
  }

  console.log('[GoogleAuth] Starting Google sign-in with popup...');

  try {
    const provider = getGoogleProvider();
    console.log('[GoogleAuth] Provider configured, opening popup...');

    const result = await signInWithPopup(auth, provider);

    console.log('[GoogleAuth] Sign-in successful, user:', result.user.email);

    return {
      success: true,
      user: mapFirebaseUser(result.user),
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };

    console.error('[GoogleAuth] Sign-in error:', err.code, err.message);

    // Errores cancelados por usuario no deberían mostrarse
    if (err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request') {
      console.log('[GoogleAuth] User cancelled sign-in');
      return { success: false };
    }

    const spanishMessage = getSpanishErrorMessage(err.code);
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: spanishMessage || err.message || 'Error al iniciar sesión con Google',
      },
    };
  }
}

// Sign in with Google (redirect - for mobile)
export async function signInWithGoogleRedirect(): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return notConfiguredError;

  try {
    await signInWithRedirect(auth, getGoogleProvider());
    // The page will redirect to Google, so this return won't be reached in success case
    return { success: true };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: err.message || 'Error al redirigir a Google',
      },
    };
  }
}

// Get redirect result after OAuth redirect
export async function getGoogleRedirectResult(): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return { success: false };

  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return {
        success: true,
        user: mapFirebaseUser(result.user),
      };
    }
    // No hay resultado de redirect - esto es normal si no venimos de un redirect
    return { success: false };
  } catch (error) {
    const err = error as { code?: string; message?: string };

    // Errores cancelados por usuario no deberían mostrarse como error persistente
    if (err.code === 'auth/redirect-cancelled-by-user' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request') {
      console.log('User cancelled sign-in');
      return { success: false };
    }

    const spanishMessage = getSpanishErrorMessage(err.code);
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: spanishMessage || err.message || 'Error al iniciar sesión',
      },
    };
  }
}

// ============================================
// EMAIL + PASSWORD AUTH
// ============================================

// Sign up with email and password
export async function signUpWithEmailPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return notConfiguredError;

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Send verification email
    try {
      await sendEmailVerification(result.user, {
        url: `${window.location.origin}/auth/login`,
      });
    } catch (verifyError) {
      console.error('Error sending verification email:', verifyError);
    }

    return {
      success: true,
      user: mapFirebaseUser(result.user),
      needsEmailVerification: true,
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    const spanishMessage = getSpanishErrorMessage(err.code);
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: spanishMessage || err.message || 'Error al crear cuenta',
      },
    };
  }
}

// Sign in with email and password
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return notConfiguredError;

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: mapFirebaseUser(result.user),
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    const spanishMessage = getSpanishErrorMessage(err.code);
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: spanishMessage || err.message || 'Error al iniciar sesión',
      },
    };
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return notConfiguredError;

  try {
    await firebaseSendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/auth/login`,
    });
    return { success: true };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    const spanishMessage = getSpanishErrorMessage(err.code);
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: spanishMessage || err.message || 'Error al enviar email',
      },
    };
  }
}

// ============================================
// PHONE AUTH (SMS)
// ============================================

// Setup reCAPTCHA verifier
export function setupRecaptcha(containerId: string): RecaptchaVerifier | null {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  try {
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // reCAPTCHA expired
      },
    });
    return verifier;
  } catch (error) {
    console.error('Error setting up reCAPTCHA:', error);
    return null;
  }
}

// Send SMS verification code
export async function sendPhoneVerification(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return notConfiguredError;

  try {
    // Formato mexicano: asegurar que empiece con +52
    const formattedPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+52${phoneNumber.replace(/\D/g, '')}`;

    phoneConfirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      recaptchaVerifier
    );

    return {
      success: true,
      verificationId: phoneConfirmationResult.verificationId,
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    const spanishMessage = getSpanishErrorMessage(err.code);
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: spanishMessage || err.message || 'Error al enviar código SMS',
      },
    };
  }
}

// Verify SMS code
export async function verifyPhoneCode(code: string): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) return notConfiguredError;

  if (!phoneConfirmationResult) {
    return {
      success: false,
      error: {
        code: 'auth/no-verification',
        message: 'No hay verificación pendiente. Solicita un nuevo código.',
      },
    };
  }

  try {
    const result = await phoneConfirmationResult.confirm(code);
    phoneConfirmationResult = null; // Clear after use

    return {
      success: true,
      user: mapFirebaseUser(result.user),
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    const spanishMessage = getSpanishErrorMessage(err.code);
    return {
      success: false,
      error: {
        code: err.code || 'unknown',
        message: spanishMessage || err.message || 'Error al verificar código',
      },
    };
  }
}

// ============================================
// MAGIC LINK AUTH
// ============================================

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

// ============================================
// COMMON
// ============================================

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
