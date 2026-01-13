'use client';

import { CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react';
import type { CSFStatus as CSFStatusType } from '@/types/documents';

interface CSFStatusProps {
  status: CSFStatusType;
  expiresAt?: Date;
  daysUntilExpiry?: number;
}

const statusConfig = {
  pending_upload: {
    icon: FileText,
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    label: 'Pendiente',
    description: 'No has subido tu Constancia de Situación Fiscal',
  },
  uploaded: {
    icon: Clock,
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    label: 'Procesando',
    description: 'Tu CSF está siendo verificada',
  },
  valid: {
    icon: CheckCircle,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    label: 'Vigente',
    description: 'Tu CSF está vigente',
  },
  expiring_soon: {
    icon: AlertTriangle,
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
    label: 'Por vencer',
    description: 'Tu CSF vencerá pronto',
  },
  expired: {
    icon: AlertTriangle,
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    label: 'Expirada',
    description: 'Tu CSF ha expirado. Por favor súbela nuevamente.',
  },
};

export function CSFStatus({ status, expiresAt, daysUntilExpiry }: CSFStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className={`rounded-xl border ${config.borderColor} p-4`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${config.bgColor}`}>
          <Icon className={`w-6 h-6 ${config.textColor}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}>
              {config.label}
            </span>
          </div>

          <p className="text-gray-700 mt-2">{config.description}</p>

          {expiresAt && status !== 'expired' && (
            <p className="text-sm text-gray-500 mt-1">
              {status === 'expiring_soon' ? (
                <span className="text-yellow-600 font-medium">
                  Vence en {daysUntilExpiry} días ({formatDate(expiresAt)})
                </span>
              ) : (
                <>Vence el {formatDate(expiresAt)}</>
              )}
            </p>
          )}

          {status === 'valid' && daysUntilExpiry && (
            <p className="text-sm text-green-600 mt-1">
              {daysUntilExpiry} días restantes de vigencia
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
