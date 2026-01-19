import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Helper to check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    typeof window !== 'undefined'
  );
}

// Lazy initialization - only initialize when needed and in client
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _storage: FirebaseStorage | null = null;
let _firestore: Firestore | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!_app) {
    if (getApps().length === 0) {
      _app = initializeApp(firebaseConfig);
    } else {
      _app = getApps()[0];
    }
  }

  return _app;
}

// Getter for auth - lazy initialization with explicit persistence
export function getFirebaseAuth(): Auth | null {
  if (!_auth) {
    const app = getFirebaseApp();
    if (app) {
      _auth = getAuth(app);
      // Configure explicit persistence for browser
      // This ensures auth state survives page reloads and redirects
      setPersistence(_auth, browserLocalPersistence).catch((err) => {
        console.error('Error setting auth persistence:', err);
      });
    }
  }
  return _auth;
}

// Getter for storage - lazy initialization
export function getFirebaseStorage(): FirebaseStorage | null {
  if (!_storage) {
    const app = getFirebaseApp();
    if (app) {
      _storage = getStorage(app);
    }
  }
  return _storage;
}

// Getter for firestore - lazy initialization
export function getFirestoreDb(): Firestore | null {
  if (!_firestore) {
    const app = getFirebaseApp();
    if (app) {
      _firestore = getFirestore(app);
    }
  }
  return _firestore;
}

// Export getFirebaseApp for use in other modules
export { getFirebaseApp };

// Legacy exports for compatibility (will be null on server or when not configured)
export const firebaseApp = typeof window !== 'undefined' ? getFirebaseApp() : null;
export const firebaseAuth = typeof window !== 'undefined' ? getFirebaseAuth() : null;
export const firebaseStorage = typeof window !== 'undefined' ? getFirebaseStorage() : null;
export const firebaseFirestore = typeof window !== 'undefined' ? getFirestoreDb() : null;
