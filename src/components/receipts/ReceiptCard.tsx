'use client';

import { Clock, CheckCircle, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import type { Receipt, ReceiptStatus } from '@/types/documents';

interface ReceiptCardProps {
  receipt: Receipt;
  onClick?: () => void;
}

const statusConfig: Record<ReceiptStatus, { icon: typeof Clock; color: string; label: string }> = {
  uploading: { icon: Clock, color: 'text-gray-500', label: 'Subiendo' },
  processing: { icon: Clock, color: 'text-blue-500', label: 'Procesando' },
  pending: { icon: Clock, color: 'text-yellow-500', label: 'Pendiente' },
  in_progress: { icon: Clock, color: 'text-blue-500', label: 'En proceso' },
  completed: { icon: CheckCircle, color: 'text-green-500', label: 'Facturado' },
  rejected: { icon: AlertCircle, color: 'text-red-500', label: 'Rechazado' },
};

export function ReceiptCard({ receipt, onClick }: ReceiptCardProps) {
  const config = statusConfig[receipt.status];
  const Icon = config.icon;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Abrir link de Drive en nueva pestaña
  const handleOpenDrive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (receipt.fileUrl) {
      window.open(receipt.fileUrl, '_blank');
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* File icon placeholder instead of image */}
      <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center">
        <FileText className="w-16 h-16 text-gray-300" />

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white shadow-sm ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm text-gray-600 truncate">{receipt.fileName}</p>
        <p className="text-xs text-gray-400 mt-1">{formatDate(receipt.uploadedAt)}</p>
        
        {/* Link to Drive */}
        {receipt.fileUrl && (
          <button
            onClick={handleOpenDrive}
            className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-3 h-3" />
            Ver en Drive
          </button>
        )}
      </div>
    </div>
  );
}
