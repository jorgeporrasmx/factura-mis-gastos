// Firebase configuration and utilities
export { firebaseApp, firebaseAuth, firebaseStorage, isFirebaseConfigured } from './config';

// Auth functions
export {
  signInWithGoogle,
  signInWithGoogleRedirect,
  getGoogleRedirectResult,
  sendMagicLink,
  isMagicLink,
  completeMagicLinkSignIn,
  signOut,
  onAuthStateChanged,
  getCurrentUser,
  mapFirebaseUser,
} from './auth';

// Storage functions
export {
  getStoragePath,
  uploadFile,
  uploadFileSimple,
  getFileDownloadUrl,
  deleteFile,
  cancelUpload,
  pauseUpload,
  resumeUpload,
  type UploadProgress,
  type UploadResult,
} from './storage';
