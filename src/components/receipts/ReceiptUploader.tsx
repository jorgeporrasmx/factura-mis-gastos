'use client';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { UPLOAD_CONFIGS, formatFileSize } from '@/types/uploads';
import { Button } from '@/components/ui/button';
import { Upload, Image, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ReceiptUploaderProps {
  onUploadComplete?: (files: Array<{ url: string; path: string; name: string }>) => void;
  onClose?: () => void;
}

export function ReceiptUploader({ onUploadComplete, onClose }: ReceiptUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [completedFiles, setCompletedFiles] = useState<Array<{ url: string; path: string; name: string }>>([]);

  const {
    files,
    addFiles,
    removeFile,
    uploadAll,
    isUploading,
    totalProgress,
    errors,
    clearAll,
  } = useFileUpload({
    userId: user?.uid || '',
    type: 'receipts',
    config: UPLOAD_CONFIGS.receipts,
    onComplete: (file) => {
      if (file.downloadUrl && file.storagePath) {
        setCompletedFiles((prev) => [
          ...prev,
          { url: file.downloadUrl!, path: file.storagePath!, name: file.file.name },
        ]);
      }
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
      }
      // Reset input
      e.target.value = '';
    },
    [addFiles]
  );

  const handleDone = () => {
    onUploadComplete?.(completedFiles);
    onClose?.();
  };

  const allCompleted = files.length > 0 && files.every((f) => f.status === 'success');
  const hasErrors = files.some((f) => f.status === 'error');
  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={UPLOAD_CONFIGS.receipts.acceptExtensions}
          onChange={handleFileSelect}
          multiple
          className="hidden"
        />

        <Image className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />

        <p className="text-gray-700 font-medium mb-1">
          {isDragging ? 'Suelta las imágenes' : 'Selecciona recibos'}
        </p>
        <p className="text-sm text-gray-500">
          Hasta {UPLOAD_CONFIGS.receipts.maxFiles} archivos • Máx. {formatFileSize(UPLOAD_CONFIGS.receipts.maxFileSize)} cada uno
        </p>
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
            </p>
            {!isUploading && (
              <button
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar todo
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
              >
                {/* Preview image */}
                {file.file.type.startsWith('image/') ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs text-gray-500 text-center px-2">
                      {file.file.name}
                    </span>
                  </div>
                )}

                {/* Overlay for status */}
                {(file.status === 'uploading' || file.status === 'compressing') && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1" />
                      <span className="text-xs">{file.progress}%</span>
                    </div>
                  </div>
                )}

                {file.status === 'success' && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                )}

                {file.status === 'error' && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                )}

                {/* Remove button */}
                {file.status !== 'uploading' && file.status !== 'success' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          {errors.map((error, i) => (
            <p key={i} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subiendo...</span>
            <span className="text-gray-900 font-medium">{totalProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancelar
          </Button>
        )}

        {allCompleted ? (
          <Button onClick={handleDone} className="flex-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            Listo ({completedFiles.length} subidos)
          </Button>
        ) : (
          <Button
            onClick={uploadAll}
            disabled={isUploading || pendingCount === 0}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Subir {pendingCount} recibo{pendingCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
