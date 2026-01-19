'use client';

import { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadFile, getStoragePath, type UploadProgress } from '@/lib/firebase/storage';
import {
  type UploadFile,
  type UploadConfig,
  type UploadStatus,
  generateFileId,
  isValidFileType,
  isValidFileSize,
} from '@/types/uploads';

interface UseFileUploadOptions {
  userId: string;
  type: 'csf' | 'receipts';
  config: UploadConfig;
  onComplete?: (file: UploadFile) => void;
  onError?: (file: UploadFile, error: string) => void;
}

interface UseFileUploadReturn {
  files: UploadFile[];
  addFiles: (fileList: FileList | File[]) => void;
  removeFile: (fileId: string) => void;
  uploadAll: () => Promise<void>;
  uploadSingle: (fileId: string) => Promise<void>;
  clearCompleted: () => void;
  clearAll: () => void;
  isUploading: boolean;
  totalProgress: number;
  errors: string[];
}

export function useFileUpload({
  userId,
  type,
  config,
  onComplete,
  onError,
}: UseFileUploadOptions): UseFileUploadReturn {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Update file state helper
  const updateFile = useCallback((fileId: string, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
    );
  }, []);

  // Add files with validation
  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const newFiles: UploadFile[] = [];
      const newErrors: string[] = [];
      const filesArray = Array.from(fileList);

      // Check max files limit
      const currentCount = files.filter((f) => f.status !== 'error').length;
      const availableSlots = config.maxFiles - currentCount;

      if (filesArray.length > availableSlots) {
        newErrors.push(
          `Solo puedes subir ${config.maxFiles} archivos. ${availableSlots} espacios disponibles.`
        );
      }

      const filesToAdd = filesArray.slice(0, availableSlots);

      for (const file of filesToAdd) {
        // Validate file type
        if (!isValidFileType(file, config.acceptedTypes)) {
          newErrors.push(`${file.name}: Tipo de archivo no permitido`);
          continue;
        }

        // Validate file size
        if (!isValidFileSize(file, config.maxFileSize)) {
          newErrors.push(`${file.name}: Archivo muy grande (máx ${config.maxFileSize / 1024 / 1024}MB)`);
          continue;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);

        newFiles.push({
          id: generateFileId(),
          file,
          preview,
          progress: 0,
          status: 'pending',
        });
      }

      if (newErrors.length > 0) {
        setErrors((prev) => [...prev, ...newErrors]);
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
      }
    },
    [files, config]
  );

  // Remove a file
  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  // Compress image if needed
  const compressImage = useCallback(
    async (file: File): Promise<File | Blob> => {
      // Skip compression for PDFs
      if (file.type === 'application/pdf') {
        return file;
      }

      // Skip if no compression settings
      if (!config.maxDimension && !config.quality) {
        return file;
      }

      try {
        const options = {
          maxSizeMB: config.maxFileSize / 1024 / 1024,
          maxWidthOrHeight: config.maxDimension || 1920,
          useWebWorker: true,
          initialQuality: config.quality || 0.85,
        };

        return await imageCompression(file, options);
      } catch {
        // Return original file if compression fails
        return file;
      }
    },
    [config]
  );

  // Upload a single file
  const uploadSingle = useCallback(
    async (fileId: string) => {
      const uploadFile_ = files.find((f) => f.id === fileId);
      if (!uploadFile_ || uploadFile_.status === 'uploading' || uploadFile_.status === 'success') {
        return;
      }

      // Update status to compressing
      updateFile(fileId, { status: 'compressing' as UploadStatus });

      try {
        // Compress the file
        const compressedFile = await compressImage(uploadFile_.file);

        // Update status to uploading
        updateFile(fileId, { status: 'uploading' as UploadStatus });

        // For receipts, use Google Drive API via /api/upload/receipt
        if (type === 'receipts') {
          // Simulate initial progress
          updateFile(fileId, { progress: 30 });

          const formData = new FormData();
          formData.append('file', compressedFile, uploadFile_.file.name);

          const response = await fetch('/api/upload/receipt', {
            method: 'POST',
            headers: { 'x-user-uid': userId },
            body: formData,
          });

          // Simulate progress after upload
          updateFile(fileId, { progress: 80 });

          const result = await response.json();

          if (result.success && result.file) {
            const updatedFile: UploadFile = {
              ...uploadFile_,
              status: 'success',
              progress: 100,
              downloadUrl: result.file.url,
              storagePath: result.file.id, // Drive file ID
            };
            updateFile(fileId, updatedFile);
            onComplete?.(updatedFile);
          } else {
            const errorMsg = result.error || 'Error al subir el archivo a Drive';
            updateFile(fileId, { status: 'error' as UploadStatus, error: errorMsg });
            onError?.(uploadFile_, errorMsg);
          }
        } else if (type === 'csf') {
          // For CSF, use Google Drive API via /api/upload/csf
          // Simulate initial progress
          updateFile(fileId, { progress: 20 });

          const formData = new FormData();
          formData.append('file', compressedFile, uploadFile_.file.name);

          // Simulate progress while uploading
          updateFile(fileId, { progress: 40 });

          const response = await fetch('/api/upload/csf', {
            method: 'POST',
            headers: { 'x-user-uid': userId },
            body: formData,
          });

          // Simulate progress after upload
          updateFile(fileId, { progress: 80 });

          const result = await response.json();

          if (result.success && result.file) {
            const updatedFile: UploadFile = {
              ...uploadFile_,
              status: 'success',
              progress: 100,
              downloadUrl: result.file.url,
              storagePath: result.file.id, // Drive file ID
            };
            updateFile(fileId, updatedFile);
            onComplete?.(updatedFile);
          } else {
            const errorMsg = result.error || 'Error al subir la constancia fiscal';
            updateFile(fileId, { status: 'error' as UploadStatus, error: errorMsg });
            onError?.(uploadFile_, errorMsg);
          }
        } else {
          // For other types, use Firebase Storage (fallback)
          const storagePath = getStoragePath(userId, type, uploadFile_.file.name);

          const { promise } = uploadFile(storagePath, compressedFile, (progress: UploadProgress) => {
            updateFile(fileId, { progress: progress.progress });
          });

          const result = await promise;

          if (result.success && result.downloadUrl) {
            const updatedFile: UploadFile = {
              ...uploadFile_,
              status: 'success',
              progress: 100,
              downloadUrl: result.downloadUrl,
              storagePath,
            };
            updateFile(fileId, updatedFile);
            onComplete?.(updatedFile);
          } else {
            const errorMsg = result.error || 'Error al subir el archivo';
            updateFile(fileId, { status: 'error' as UploadStatus, error: errorMsg });
            onError?.(uploadFile_, errorMsg);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        updateFile(fileId, { status: 'error' as UploadStatus, error: errorMsg });
        onError?.(uploadFile_, errorMsg);
      }
    },
    [files, userId, type, compressImage, updateFile, onComplete, onError]
  );

  // Upload all pending files
  const uploadAll = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error');

    // Upload in parallel (max 3 at a time)
    const batchSize = 3;
    for (let i = 0; i < pendingFiles.length; i += batchSize) {
      const batch = pendingFiles.slice(i, i + batchSize);
      await Promise.all(batch.map((f) => uploadSingle(f.id)));
    }
  }, [files, uploadSingle]);

  // Clear completed files
  const clearCompleted = useCallback(() => {
    setFiles((prev) => {
      prev
        .filter((f) => f.status === 'success')
        .forEach((f) => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });
      return prev.filter((f) => f.status !== 'success');
    });
  }, []);

  // Clear all files
  const clearAll = useCallback(() => {
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    setErrors([]);
  }, [files]);

  // Calculate total progress
  const totalProgress =
    files.length === 0
      ? 0
      : Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length);

  // Check if any file is uploading
  const isUploading = files.some(
    (f) => f.status === 'uploading' || f.status === 'compressing'
  );

  return {
    files,
    addFiles,
    removeFile,
    uploadAll,
    uploadSingle,
    clearCompleted,
    clearAll,
    isUploading,
    totalProgress,
    errors,
  };
}
