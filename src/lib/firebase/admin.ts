// Firebase Admin SDK for server-side operations
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;

// Fix private key format - handles various formats from Vercel
function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;

  // Replace escaped newlines with real newlines
  let formatted = key.replace(/\\n/g, '\n');

  // Check if the key already has proper newlines (valid PEM format)
  const lines = formatted.split('\n').filter(line => line.trim());
  if (lines.length > 3) {
    // Key already has newlines, return as-is
    return formatted;
  }

  // Key is on a single line - need to reformat
  // Extract the base64 content between header and footer
  const beginMarker = '-----BEGIN PRIVATE KEY-----';
  const endMarker = '-----END PRIVATE KEY-----';

  const beginIndex = formatted.indexOf(beginMarker);
  const endIndex = formatted.indexOf(endMarker);

  if (beginIndex === -1 || endIndex === -1) {
    // Invalid key format, return as-is and let Firebase handle the error
    return formatted;
  }

  // Extract the base64 content
  const base64Content = formatted
    .substring(beginIndex + beginMarker.length, endIndex)
    .replace(/\s/g, ''); // Remove any whitespace

  // Split into 64-character lines (PEM standard)
  const chunks: string[] = [];
  for (let i = 0; i < base64Content.length; i += 64) {
    chunks.push(base64Content.substring(i, i + 64));
  }

  // Reconstruct the key with proper formatting
  return `${beginMarker}\n${chunks.join('\n')}\n${endMarker}\n`;
}

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
      // Support both naming conventions for credentials
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY);

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
