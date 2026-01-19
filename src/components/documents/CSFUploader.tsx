'use client';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { UPLOAD_CONFIGS, formatFileSize } from '@/types/uploads';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CSFUploaderProps {
  onUploadComplete?: (fileUrl: string, storagePath: string) => void;
  existingFile?: { fileName: string; uploadedAt: Date } | null;
}

export function CSFUploader({ onUploadComplete, existingFile }: CSFUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    files,
    addFiles,
    removeFile,
    uploadAll,
    isUploading,
    errors,
  } = useFileUpload({
    userId: user?.uid || '',
    userEmail: user?.email || undefined,
    type: 'csf',
    config: UPLOAD_CONFIGS.csf,
    onComplete: (file) => {
      if (file.downloadUrl && file.storagePath) {
        // Save to localStorage for demo
        localStorage.setItem('csf_uploaded', new Date().toISOString());
        onUploadComplete?.(file.downloadUrl, file.storagePath);
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
    },
    [addFiles]
  );

  const currentFile = files[0];

  return (
    <div className="space-y-4">
      {/* Existing file info */}
      {existingFile && !currentFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">{existingFile.fileName}</p>
            <p className="text-xs text-blue-700">
              Subido el {new Date(existingFile.uploadedAt).toLocaleDateString('es-MX')}
            </p>
          </div>
        </div>
      )}

      {/* Drop zone */}
      {!currentFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={UPLOAD_CONFIGS.csf.acceptExtensions}
            onChange={handleFileSelect}
            className="hidden"
          />

          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />

          <p className="text-gray-700 font-medium mb-1">
            {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu CSF aquí'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            o haz clic para seleccionar
          </p>

          <p className="text-xs text-gray-400">
            PDF, JPG o PNG • Máx. {formatFileSize(UPLOAD_CONFIGS.csf.maxFileSize)}
          </p>
        </div>
      )}

      {/* Selected file preview */}
      {currentFile && (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-4">
            {/* Icon or preview */}
            {currentFile.file.type === 'application/pdf' ? (
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
            ) : (
              <img
                src={currentFile.preview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {currentFile.file.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(currentFile.file.size)}
              </p>

              {/* Status */}
              {currentFile.status === 'uploading' && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo... {currentFile.progress}%
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${currentFile.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {currentFile.status === 'compressing' && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Optimizando...
                </div>
              )}

              {currentFile.status === 'success' && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  ¡Subido correctamente!
                </div>
              )}

              {currentFile.status === 'error' && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {currentFile.error}
                </div>
              )}
            </div>

            {/* Remove button */}
            {currentFile.status !== 'uploading' && currentFile.status !== 'success' && (
              <button
                onClick={() => removeFile(currentFile.id)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
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

      {/* Upload button */}
      {currentFile && currentFile.status === 'pending' && (
        <Button onClick={uploadAll} disabled={isUploading} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Subir Constancia
            </>
          )}
        </Button>
      )}

      {/* Success message */}
      {currentFile?.status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-medium text-green-800">¡CSF subida correctamente!</p>
          <p className="text-sm text-green-700 mt-1">
            Tu constancia fiscal ha sido guardada y está vigente por 3 meses.
          </p>
        </div>
      )}
    </div>
  );
}
