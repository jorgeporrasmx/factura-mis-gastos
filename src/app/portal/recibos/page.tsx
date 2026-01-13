'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { ReceiptGrid } from '@/components/receipts/ReceiptGrid';
import { ReceiptCapture } from '@/components/receipts/ReceiptCapture';
import { ReceiptUploader } from '@/components/receipts/ReceiptUploader';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { Receipt } from '@/types/documents';

function RecibosContent() {
  const searchParams = useSearchParams();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showCapture, setShowCapture] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [csfValid, setCsfValid] = useState(false);

  // Check CSF status
  useEffect(() => {
    const csfUploaded = localStorage.getItem('csf_uploaded');
    if (csfUploaded) {
      const uploadDate = new Date(csfUploaded);
      const expiresAt = new Date(uploadDate);
      expiresAt.setMonth(expiresAt.getMonth() + 3);
      setCsfValid(new Date() < expiresAt);
    }
  }, []);

  // Handle action from URL params
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'capture' && csfValid) {
      setShowCapture(true);
    } else if (action === 'upload' && csfValid) {
      setShowUploader(true);
    }
  }, [searchParams, csfValid]);

  // Load receipts from localStorage (mock)
  useEffect(() => {
    const stored = localStorage.getItem('receipts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setReceipts(parsed.map((r: Receipt) => ({
          ...r,
          uploadedAt: new Date(r.uploadedAt),
        })));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleCapture = (blob: Blob) => {
    // Create a receipt from the captured blob
    const receipt: Receipt = {
      id: `receipt-${Date.now()}`,
      userId: 'user',
      fileUrl: URL.createObjectURL(blob),
      fileName: `recibo-${Date.now()}.jpg`,
      fileSize: blob.size,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
      status: 'pending',
      storagePath: '',
    };

    const newReceipts = [receipt, ...receipts];
    setReceipts(newReceipts);
    localStorage.setItem('receipts', JSON.stringify(newReceipts));
    setShowCapture(false);
  };

  const handleUploadComplete = (files: Array<{ url: string; path: string; name: string }>) => {
    const newReceipts = files.map((file) => ({
      id: `receipt-${Date.now()}-${Math.random()}`,
      userId: 'user',
      fileUrl: file.url,
      storagePath: file.path,
      fileName: file.name,
      fileSize: 0,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
      status: 'pending' as const,
    }));

    const allReceipts = [...newReceipts, ...receipts];
    setReceipts(allReceipts);
    localStorage.setItem('receipts', JSON.stringify(allReceipts));
    setShowUploader(false);
  };

  // If CSF is not valid, show message
  if (!csfValid) {
    return (
      <div>
        <PortalHeader title="Mis Recibos" />
        <div className="p-4 md:p-6">
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              CSF requerida
            </h2>
            <p className="text-gray-600 mb-6">
              Para subir recibos, primero necesitas tener tu Constancia de Situación Fiscal vigente.
            </p>
            <Link href="/portal/csf">
              <Button>Subir mi CSF</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PortalHeader title="Mis Recibos" />

      <div className="p-4 md:p-6 space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => setShowCapture(true)} className="flex-1 sm:flex-none">
            <Camera className="w-4 h-4 mr-2" />
            Tomar foto
          </Button>
          <Button variant="outline" onClick={() => setShowUploader(true)} className="flex-1 sm:flex-none">
            <Upload className="w-4 h-4 mr-2" />
            Subir desde galería
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
          >
            <Plus className="w-6 h-6" />
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
