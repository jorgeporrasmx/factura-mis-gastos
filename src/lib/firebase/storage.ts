import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { getFirebaseStorage } from './config';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  state: 'running' | 'paused' | 'success' | 'error' | 'canceled';
}

export interface UploadResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

// Generate storage path for user files
export function getStoragePath(
  userId: string,
  type: 'csf' | 'receipts',
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

  if (type === 'csf') {
    return `users/${userId}/csf/${timestamp}_${sanitizedFileName}`;
  }

  // For receipts, organize by year/month
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `users/${userId}/receipts/${year}/${month}/${timestamp}_${sanitizedFileName}`;
}

// Upload file with progress tracking
export function uploadFile(
  path: string,
  file: File | Blob,
  onProgress?: (progress: UploadProgress) => void
): { task: UploadTask | null; promise: Promise<UploadResult> } {
  const storage = getFirebaseStorage();

  if (!storage) {
    return {
      task: null,
      promise: Promise.resolve({
        success: false,
        error: 'Firebase Storage no está configurado',
      }),
    };
  }

  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  const promise = new Promise<UploadResult>((resolve) => {
    task.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress: UploadProgress = {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
          state: snapshot.state as UploadProgress['state'],
        };
        onProgress?.(progress);
      },
      (error) => {
        resolve({
          success: false,
          error: error.message || 'Error al subir el archivo',
        });
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(task.snapshot.ref);
          resolve({
            success: true,
            downloadUrl,
          });
        } catch {
          resolve({
            success: false,
            error: 'Error al obtener la URL del archivo',
          });
        }
      }
    );
  });

  return { task, promise };
}

// Simple upload without progress (for small files)
export async function uploadFileSimple(
  path: string,
  file: File | Blob
): Promise<UploadResult> {
  const { promise } = uploadFile(path, file);
  return promise;
}

// Get download URL for a file
export async function getFileDownloadUrl(path: string): Promise<string | null> {
  const storage = getFirebaseStorage();
  if (!storage) return null;

  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch {
    return null;
  }
}

// Delete a file
export async function deleteFile(path: string): Promise<boolean> {
  const storage = getFirebaseStorage();
  if (!storage) return false;

  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch {
    return false;
  }
}

// Cancel an upload
export function cancelUpload(task: UploadTask | null): boolean {
  if (!task) return false;
  return task.cancel();
}

// Pause an upload
export function pauseUpload(task: UploadTask | null): boolean {
  if (!task) return false;
  return task.pause();
}

// Resume an upload
export function resumeUpload(task: UploadTask | null): boolean {
  if (!task) return false;
  return task.resume();
}
