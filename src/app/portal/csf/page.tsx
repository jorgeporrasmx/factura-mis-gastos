'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { CSFUploader } from '@/components/documents/CSFUploader';
import { CSFStatus } from '@/components/documents/CSFStatus';
import { Button } from '@/components/ui/button';
import { ArrowRight, Info } from 'lucide-react';
import type { CSFStatus as CSFStatusType } from '@/types/documents';

interface CSFData {
  status: CSFStatusType;
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: Date;
  expiresAt?: Date;
  daysUntilExpiry?: number;
}

export default function CSFPage() {
  const router = useRouter();
  const [csfData, setCSFData] = useState<CSFData>({ status: 'pending_upload' });
  const [showUploader, setShowUploader] = useState(false);

  // Load CSF data from localStorage (in production, from Firebase)
  useEffect(() => {
    const csfUploaded = localStorage.getItem('csf_uploaded');
    if (csfUploaded) {
      const uploadDate = new Date(csfUploaded);
      const expiresAt = new Date(uploadDate);
      expiresAt.setMonth(expiresAt.getMonth() + 3);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let status: CSFStatusType = 'valid';
      if (daysUntilExpiry <= 0) status = 'expired';
      else if (daysUntilExpiry <= 15) status = 'expiring_soon';

      setCSFData({
        status,
        fileName: 'constancia_situacion_fiscal.pdf',
        uploadedAt: uploadDate,
        expiresAt,
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
      });
    }
  }, []);

  const handleUploadComplete = (fileUrl: string, storagePath: string) => {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    setCSFData({
      status: 'valid',
      fileUrl,
      fileName: 'constancia_situacion_fiscal.pdf',
      uploadedAt: now,
      expiresAt,
      daysUntilExpiry: 90,
    });

    setShowUploader(false);
  };

  const needsUpload = csfData.status === 'pending_upload' || csfData.status === 'expired';

  return (
    <div>
      <PortalHeader title="Constancia Fiscal" />

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">¿Qué es la CSF?</p>
            <p>
              La Constancia de Situación Fiscal es un documento emitido por el SAT que
              contiene tu información fiscal. La necesitamos para generar tus facturas
              correctamente.
            </p>
            <p className="mt-2">
              <strong>Importante:</strong> La CSF debe tener máximo 3 meses de antigüedad
              y te pediremos actualizarla cada 3 meses.
            </p>
          </div>
        </div>

        {/* Current status */}
        {!needsUpload && !showUploader && (
          <>
            <CSFStatus
              status={csfData.status}
              expiresAt={csfData.expiresAt}
              daysUntilExpiry={csfData.daysUntilExpiry}
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {csfData.status === 'expiring_soon' && (
                <Button onClick={() => setShowUploader(true)}>
                  Actualizar CSF
                </Button>
              )}

              <Button
                variant={csfData.status === 'expiring_soon' ? 'outline' : 'default'}
                onClick={() => router.push('/portal/recibos')}
              >
                Ir a mis recibos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {/* Uploader */}
        {(needsUpload || showUploader) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {csfData.status === 'expired' ? 'Actualiza tu CSF' : 'Sube tu CSF'}
            </h2>

            <CSFUploader
              onUploadComplete={handleUploadComplete}
              existingFile={
                csfData.uploadedAt
                  ? { fileName: csfData.fileName || '', uploadedAt: csfData.uploadedAt }
                  : null
              }
            />

            {showUploader && !needsUpload && (
              <Button
                variant="ghost"
                onClick={() => setShowUploader(false)}
                className="mt-4"
              >
                Cancelar
              </Button>
            )}
          </div>
        )}

        {/* Help link */}
        <div className="text-center">
          <a
            href="https://www.sat.gob.mx/aplicacion/53027/genera-tu-constancia-de-situacion-fiscal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ¿Cómo obtener mi CSF del SAT?
          </a>
        </div>
      </div>
    </div>
  );
}
