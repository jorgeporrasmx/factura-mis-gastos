'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraReturn {
  isSupported: boolean;
  isActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: string | null;
  facingMode: 'user' | 'environment';
  startCamera: (facing?: 'user' | 'environment') => Promise<boolean>;
  stopCamera: () => void;
  capturePhoto: () => Promise<Blob | null>;
  switchCamera: () => Promise<void>;
}

export function useCamera(): UseCameraReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Check if camera is supported
  useEffect(() => {
    const supported =
      typeof navigator !== 'undefined' &&
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices;
    setIsSupported(supported);
  }, []);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Start camera
  const startCamera = useCallback(
    async (facing: 'user' | 'environment' = 'environment'): Promise<boolean> => {
      if (!isSupported) {
        setError('La cámara no está soportada en este dispositivo');
        return false;
      }

      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);

        setStream(newStream);
        setFacingMode(facing);
        setIsActive(true);
        setError(null);

        // Connect stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          await videoRef.current.play();
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof DOMException
            ? err.name === 'NotAllowedError'
              ? 'Permiso de cámara denegado. Por favor permite el acceso a la cámara.'
              : err.name === 'NotFoundError'
                ? 'No se encontró ninguna cámara en este dispositivo.'
                : `Error de cámara: ${err.message}`
            : 'Error al acceder a la cámara';

        setError(errorMessage);
        setIsActive(false);
        return false;
      }
    },
    [isSupported, stream]
  );

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setError(null);
  }, [stream]);

  // Capture photo from video stream
  const capturePhoto = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || !isActive) {
      setError('La cámara no está activa');
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        setError('Error al crear el contexto de canvas');
        return null;
      }

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          0.9
        );
      });
    } catch (err) {
      setError('Error al capturar la foto');
      return null;
    }
  }, [isActive]);

  // Switch between front and back camera
  const switchCamera = useCallback(async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    await startCamera(newFacing);
  }, [facingMode, startCamera]);

  return {
    isSupported,
    isActive,
    videoRef,
    stream,
    error,
    facingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
  };
}
