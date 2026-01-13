'use client';

import { Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
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

  const isImage = receipt.mimeType.startsWith('image/');

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Image preview */}
      <div className="aspect-[4/3] bg-gray-100 relative">
        {isImage ? (
          <img
            src={receipt.thumbnailUrl || receipt.fileUrl}
            alt={receipt.fileName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
        )}

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
      </div>
    </div>
  );
}
