'use client';

import { useEffect, useCallback, useState } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Check, RefreshCw } from 'lucide-react';

interface ReceiptCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export function ReceiptCapture({ onCapture, onClose }: ReceiptCaptureProps) {
  const {
    isSupported,
    isActive,
    videoRef,
    error,
    facingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  } = useCamera();

  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // Start camera on mount
  useEffect(() => {
    startCamera('environment');

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = useCallback(async () => {
    const blob = await capturePhoto();
    if (blob) {
      setCapturedBlob(blob);
      setCapturedPreview(URL.createObjectURL(blob));
    }
  }, [capturePhoto]);

  const handleRetake = useCallback(() => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
  }, [capturedPreview]);

  const handleConfirm = useCallback(() => {
    if (capturedBlob) {
      onCapture(capturedBlob);
      onClose();
    }
  }, [capturedBlob, onCapture, onClose]);

  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-sm text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cámara no disponible
          </h3>
          <p className="text-gray-600 mb-4">
            Tu dispositivo no soporta acceso a la cámara o el permiso fue denegado.
          </p>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Camera preview or captured image */}
      {capturedPreview ? (
        <img
          src={capturedPreview}
          alt="Captured"
          className="w-full h-full object-contain"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        {capturedPreview ? (
          /* After capture controls */
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRetake}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retomar
            </Button>
            <Button
              size="lg"
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-5 h-5 mr-2" />
              Usar foto
            </Button>
          </div>
        ) : (
          /* Camera controls */
          <div className="flex items-center justify-center gap-6">
            {/* Switch camera button */}
            <button
              onClick={switchCamera}
              className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
            >
              <RefreshCw className="w-6 h-6" />
            </button>

            {/* Capture button */}
            <button
              onClick={handleCapture}
              disabled={!isActive}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-14 h-14 border-4 border-gray-900 rounded-full" />
            </button>

            {/* Placeholder for symmetry */}
            <div className="w-12" />
          </div>
        )}

        {/* Hint text */}
        {!capturedPreview && (
          <p className="text-white/70 text-center text-sm mt-4">
            Enfoca el recibo y toca el botón para capturar
          </p>
        )}
      </div>
    </div>
  );
}
