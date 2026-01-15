'use client';

import { Receipt, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import type { ExpenseSummary } from '@/types/expenses';
import { formatMonto } from '@/types/expenses';

interface ExpenseSummaryCardsProps {
  summary: ExpenseSummary | null;
  isLoading?: boolean;
}

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple';
  isLoading?: boolean;
}

function SummaryCard({ title, value, subtitle, icon, color, isLoading }: CardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <span className="text-sm font-medium text-gray-500">{title}</span>
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
          <div className="h-4 bg-gray-100 rounded w-16"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  );
}

export function ExpenseSummaryCards({ summary, isLoading }: ExpenseSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total de gastos */}
      <SummaryCard
        title="Total Gastos"
        value={summary?.total ?? 0}
        subtitle={`${formatMonto(summary?.montoTotal ?? 0)}`}
        icon={<Receipt className="w-5 h-5" />}
        color="blue"
        isLoading={isLoading}
      />

      {/* Pendientes */}
      <SummaryCard
        title="Pendientes"
        value={summary?.pendientes ?? 0}
        subtitle="Por procesar"
        icon={<Clock className="w-5 h-5" />}
        color="yellow"
        isLoading={isLoading}
      />

      {/* Facturados */}
      <SummaryCard
        title="Facturados"
        value={summary?.facturados ?? 0}
        subtitle={formatMonto(summary?.montoFacturado ?? 0)}
        icon={<CheckCircle className="w-5 h-5" />}
        color="green"
        isLoading={isLoading}
      />

      {/* Rechazados */}
      <SummaryCard
        title="Rechazados"
        value={summary?.rechazados ?? 0}
        subtitle={formatMonto(summary?.montoRechazado ?? 0)}
        icon={<XCircle className="w-5 h-5" />}
        color="red"
        isLoading={isLoading}
      />

      {/* Monto Total */}
      <SummaryCard
        title="Monto Total"
        value={formatMonto(summary?.montoTotal ?? 0)}
        subtitle={`${summary?.total ?? 0} recibos`}
        icon={<DollarSign className="w-5 h-5" />}
        color="purple"
        isLoading={isLoading}
      />
    </div>
  );
}

// Versión compacta para dashboard
export function ExpenseSummaryCompact({ summary, isLoading }: ExpenseSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <span className="font-semibold text-gray-900">{summary?.total ?? 0}</span>
        <span className="text-gray-500">gastos</span>
      </div>
      <div className="w-px h-4 bg-gray-300"></div>
      <div className="flex items-center gap-1">
        <span className="font-semibold text-green-600">{summary?.facturados ?? 0}</span>
        <span className="text-gray-500">facturados</span>
      </div>
      <div className="w-px h-4 bg-gray-300"></div>
      <div className="flex items-center gap-1">
        <span className="font-semibold text-yellow-600">{summary?.pendientes ?? 0}</span>
        <span className="text-gray-500">pendientes</span>
      </div>
    </div>
  );
}
