'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, getUserReceipts, saveReceipt } from '@/lib/firebase/firestore';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { ReceiptGrid } from '@/components/receipts/ReceiptGrid';
import { ReceiptCapture } from '@/components/receipts/ReceiptCapture';
import { ReceiptUploader } from '@/components/receipts/ReceiptUploader';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Plus, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { Receipt } from '@/types/documents';

function RecibosContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showCapture, setShowCapture] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [csfValid, setCsfValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const canUseTrialReceipt = !csfValid && receipts.length === 0;
  const canUploadReceipt = csfValid || canUseTrialReceipt;

  // Load receipts from Firestore
  const loadReceipts = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const userReceipts = await getUserReceipts(user.uid);
      setReceipts(userReceipts);
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  }, [user?.uid]);

  // Check CSF status from Firestore (source of truth)
  useEffect(() => {
    async function checkCSFStatus() {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.csfUploadedAt) {
          const uploadDate = new Date(profile.csfUploadedAt);
          const expiresAt = new Date(uploadDate);
          expiresAt.setMonth(expiresAt.getMonth() + 3);
          setCsfValid(new Date() < expiresAt);
        }
        
        // Load receipts from Firestore
        await loadReceipts();
      } catch (error) {
        console.error('Error checking CSF status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkCSFStatus();
  }, [user?.uid, loadReceipts]);

  // Handle action from URL params
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'capture' && canUploadReceipt) {
      setShowCapture(true);
    } else if (action === 'upload' && canUploadReceipt) {
      setShowUploader(true);
    }
  }, [searchParams, canUploadReceipt]);

  // Handle camera capture - uploads to Drive
  const handleCapture = async (blob: Blob) => {
    if (!user?.uid) return;
    
    setIsUploading(true);
    setUploadError(null);
    setShowCapture(false);

    try {
      // Create File from Blob
      const fileName = `recibo-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Drive via API
      const response = await fetch('/api/upload/receipt', {
        method: 'POST',
        headers: {
          'x-user-uid': user.uid,
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al subir el recibo');
      }

      // Create receipt object
      const receipt: Receipt = {
        id: result.file.id || `receipt-${Date.now()}`,
        userId: user.uid,
        fileUrl: result.file.url,
        storagePath: result.file.id,
        fileName: result.file.name,
        fileSize: result.file.size,
        mimeType: result.file.mimeType,
        uploadedAt: new Date(),
        status: 'pending',
        metadata: {
          capturedAt: new Date(),
        },
      };

      // Save to Firestore
      await saveReceipt(receipt);

      // Update local state
      setReceipts(prev => [receipt, ...prev]);

      console.log('[Recibos] Recibo subido exitosamente:', receipt.id);
    } catch (error) {
      console.error('Error uploading receipt:', error);
      setUploadError(error instanceof Error ? error.message : 'Error al subir el recibo');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file upload complete (from ReceiptUploader which already uploads to Drive)
  const handleUploadComplete = async (files: Array<{ url: string; path: string; name: string }>) => {
    if (!user?.uid) return;

    const newReceipts: Receipt[] = [];

    for (const file of files) {
      const receipt: Receipt = {
        id: file.path || `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.uid,
        fileUrl: file.url,
        storagePath: file.path,
        fileName: file.name,
        fileSize: 0,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
        status: 'pending',
      };

      try {
        await saveReceipt(receipt);
        newReceipts.push(receipt);
      } catch (error) {
        console.error('Error saving receipt to Firestore:', error);
      }
    }

    setReceipts(prev => [...newReceipts, ...prev]);
    setShowUploader(false);
  };

  // Show loading state while checking CSF
  if (isLoading) {
    return (
      <div>
        <PortalHeader title="Mis Recibos" />
        <div className="p-4 md:p-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Cargando recibos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PortalHeader title="Mis Recibos" />

      <div className="p-4 md:p-6 space-y-6">
        {!csfValid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-900">
                  {canUseTrialReceipt ? 'Prueba gratis disponible' : 'CSF requerida para continuar'}
                </p>
                <p className="text-sm text-yellow-800">
                  {canUseTrialReceipt
                    ? 'Puedes enviar un recibo de prueba. Sube tu CSF para procesar más recibos.'
                    : 'Tu recibo de prueba ya quedó registrado. Sube tu CSF para seguir usando el servicio.'}
                </p>
              </div>
            </div>
            <Link href="/portal/csf">
              <Button variant="outline">Subir CSF</Button>
            </Link>
          </div>
        )}

        {/* Upload in progress */}
        {isUploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-800">Subiendo recibo a Drive...</span>
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800">{uploadError}</p>
            <button 
              onClick={() => setUploadError(null)}
              className="text-sm text-red-600 underline mt-1"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setShowCapture(true)} 
            className="flex-1 sm:flex-none"
            disabled={isUploading || !canUploadReceipt}
          >
            <Camera className="w-4 h-4 mr-2" />
            Tomar foto
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowUploader(true)} 
            className="flex-1 sm:flex-none"
            disabled={isUploading || !canUploadReceipt}
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir desde galería
          </Button>
          <Button 
            variant="ghost" 
            onClick={loadReceipts} 
            className="sm:ml-auto"
            disabled={isUploading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Receipts grid */}
        <ReceiptGrid
          receipts={receipts}
          emptyMessage="Aún no has subido ningún recibo. ¡Toma una foto o sube desde tu galería!"
        />
      </div>

      {/* FAB for mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <div className="relative">
          <Button
            size="lg"
            className="w-14 h-14 rounded-full shadow-lg"
            onClick={() => setShowCapture(true)}
            disabled={isUploading || !canUploadReceipt}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Camera capture modal */}
      {showCapture && (
        <ReceiptCapture
          onCapture={handleCapture}
          onClose={() => setShowCapture(false)}
        />
      )}

      {/* Upload modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Subir recibos
            </h2>
            <ReceiptUploader
              onUploadComplete={handleUploadComplete}
              onClose={() => setShowUploader(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecibosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <RecibosContent />
    </Suspense>
  );
}
