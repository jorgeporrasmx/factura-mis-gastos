'use client';

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ExternalLink,
  FileText,
  Image,
  MoreHorizontal,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Expense, ExpenseSortOptions, ExpenseSortField } from '@/types/expenses';
import {
  formatMonto,
  formatFecha,
  EXPENSE_STATUS_LABELS,
  EXPENSE_STATUS_COLORS,
  EXPENSE_CATEGORY_LABELS,
} from '@/types/expenses';

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading?: boolean;
  sort?: ExpenseSortOptions;
  onSortChange?: (sort: ExpenseSortOptions) => void;
  showUserColumn?: boolean;
  onViewExpense?: (expense: Expense) => void;
}

// Componente de estado con badge
function StatusBadge({ estado }: { estado: Expense['estado'] }) {
  const colors = EXPENSE_STATUS_COLORS[estado];
  const label = EXPENSE_STATUS_LABELS[estado];

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}

// Skeleton para loading
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
        </tr>
      ))}
    </>
  );
}

// Header de columna ordenable
function SortableHeader({
  label,
  field,
  currentSort,
  onSort,
}: {
  label: string;
  field: ExpenseSortField;
  currentSort?: ExpenseSortOptions;
  onSort: (field: ExpenseSortField) => void;
}) {
  const isActive = currentSort?.field === field;
  const isAsc = isActive && currentSort?.direction === 'asc';

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
    >
      {label}
      <span className="flex flex-col">
        <ChevronUp
          className={`w-3 h-3 -mb-1 ${isActive && isAsc ? 'text-blue-600' : 'text-gray-300'}`}
        />
        <ChevronDown
          className={`w-3 h-3 ${isActive && !isAsc ? 'text-blue-600' : 'text-gray-300'}`}
        />
      </span>
    </button>
  );
}

export function ExpenseTable({
  expenses,
  isLoading,
  sort,
  onSortChange,
  showUserColumn = false,
  onViewExpense,
}: ExpenseTableProps) {
  const handleSort = (field: ExpenseSortField) => {
    if (!onSortChange) return;

    const newDirection =
      sort?.field === field && sort.direction === 'desc' ? 'asc' : 'desc';
    onSortChange({ field, direction: newDirection });
  };

  if (!isLoading && expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No hay gastos</h3>
        <p className="text-gray-500">
          No se encontraron gastos con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm">
                <SortableHeader
                  label="Fecha"
                  field="fecha"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Concepto
              </th>
              {showUserColumn && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Usuario
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm">
                <SortableHeader
                  label="Proveedor"
                  field="proveedor"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Categoría
              </th>
              <th className="px-4 py-3 text-right text-sm">
                <SortableHeader
                  label="Monto"
                  field="monto"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm">
                <SortableHeader
                  label="Estado"
                  field="estado"
                  currentSort={sort}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                Archivos
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <TableSkeleton rows={5} />
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatFecha(expense.fecha)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
                      {expense.nombre}
                    </div>
                    {expense.notas && (
                      <div className="text-xs text-gray-500 max-w-[200px] truncate">
                        {expense.notas}
                      </div>
                    )}
                  </td>
                  {showUserColumn && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {expense.userName}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">
                    {expense.proveedor}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {EXPENSE_CATEGORY_LABELS[expense.categoria]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium text-right whitespace-nowrap">
                    {formatMonto(expense.monto)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge estado={expense.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {expense.reciboUrl && (
                        <a
                          href={expense.reciboUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver recibo"
                        >
                          <Image className="w-4 h-4" />
                        </a>
                      )}
                      {expense.facturaUrl && (
                        <a
                          href={expense.facturaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Ver factura"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {onViewExpense && (
                      <button
                        onClick={() => onViewExpense(expense)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Versión compacta para móvil
export function ExpenseList({
  expenses,
  isLoading,
  onViewExpense,
}: Pick<ExpenseTableProps, 'expenses' | 'isLoading' | 'onViewExpense'>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No hay gastos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="bg-white rounded-lg border border-gray-200 p-4"
          onClick={() => onViewExpense?.(expense)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{expense.nombre}</p>
              <p className="text-sm text-gray-500">{expense.proveedor}</p>
            </div>
            <p className="font-semibold text-gray-900 ml-2">{formatMonto(expense.monto)}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{formatFecha(expense.fecha)}</span>
            <StatusBadge estado={expense.estado} />
          </div>
        </div>
      ))}
    </div>
  );
}
