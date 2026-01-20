// Firebase Admin SDK for server-side operations
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;

// Check if Firebase Admin is configured
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

// Initialize Firebase Admin
function getAdminApp(): App | null {
  if (!isAdminConfigured()) {
    console.warn('Firebase Admin no está configurado');
    return null;
  }

  if (!_adminApp) {
    const existingApps = getApps();

    if (existingApps.length > 0) {
      _adminApp = existingApps[0];
    } else {
      // Try to initialize with service account credentials
      const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (clientEmail && privateKey && projectId) {
        // Use service account credentials
        _adminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else if (projectId) {
        // Use default credentials (works in GCP environments)
        // Or Application Default Credentials
        _adminApp = initializeApp({
          projectId,
        });
      } else {
        console.warn('No se encontraron credenciales de Firebase Admin');
        return null;
      }
    }
  }

  return _adminApp;
}

// Get Firestore instance for admin operations
export function getAdminFirestore(): Firestore | null {
  if (!_adminDb) {
    const app = getAdminApp();
    if (app) {
      _adminDb = getFirestore(app);
    }
  }
  return _adminDb;
}

// Export for use in server-side code
export { getAdminApp };
