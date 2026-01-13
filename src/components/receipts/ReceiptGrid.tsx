'use client';

import { ReceiptCard } from './ReceiptCard';
import type { Receipt } from '@/types/documents';
import { FileText } from 'lucide-react';

interface ReceiptGridProps {
  receipts: Receipt[];
  onReceiptClick?: (receipt: Receipt) => void;
  emptyMessage?: string;
}

export function ReceiptGrid({ receipts, onReceiptClick, emptyMessage }: ReceiptGridProps) {
  if (receipts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">
          {emptyMessage || 'No hay recibos todavía'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {receipts.map((receipt) => (
        <ReceiptCard
          key={receipt.id}
          receipt={receipt}
          onClick={() => onReceiptClick?.(receipt)}
        />
      ))}
    </div>
  );
}
