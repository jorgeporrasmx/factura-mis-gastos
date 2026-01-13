// Archivo en proceso de upload
export interface UploadFile {
  id: string;
  file: File;
  preview: string;      // Data URL para preview
  progress: number;     // 0-100
  status: UploadStatus;
  error?: string;
  downloadUrl?: string; // URL final en Storage
  storagePath?: string; // Path en Storage
}

export type UploadStatus =
  | 'pending'
  | 'compressing'
  | 'uploading'
  | 'success'
  | 'error';

// Configuración de upload
export interface UploadConfig {
  maxFileSize: number;              // En bytes
  maxFiles: number;                 // Máximo de archivos simultáneos
  acceptedTypes: readonly string[]; // MIME types permitidos
  acceptExtensions?: string;        // Extensiones para input accept
  maxDimension?: number;            // Dimensión máxima para redimensionar
  quality?: number;                 // Calidad de compresión (0-1)
}

// Configuraciones predefinidas
export const UPLOAD_CONFIGS = {
  csf: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    acceptExtensions: '.pdf,.jpg,.jpeg,.png',
  },
  receipts: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'],
    acceptExtensions: '.jpg,.jpeg,.png,.heic,.heif,.pdf',
    maxDimension: 1920,
    quality: 0.85,
  },
} as const;

// Helpers
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidFileType(file: File, acceptedTypes: readonly string[]): boolean {
  return acceptedTypes.includes(file.type);
}

export function isValidFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

export function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
