'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Download, Settings, AlertCircle } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { useExpenseSync } from '@/hooks/useExpenseSync';
import { buildExpensesCsv } from '@/lib/employee-traceability';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { ExpenseSummaryCards } from '@/components/expenses/ExpenseSummaryCards';
import { ExpenseFiltersBar } from '@/components/expenses/ExpenseFilters';
import { ExpenseTable, ExpenseList } from '@/components/expenses/ExpenseTable';
import { Button } from '@/components/ui/button';
import type { ExpenseFilters, ExpenseSortOptions, Expense } from '@/types/expenses';

export default function ReportesPage() {
  const { company, userProfile, companyUsers, isAdmin } = useCompany();
  const { user } = useAuth();
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [sort, setSort] = useState<ExpenseSortOptions>({ field: 'fecha', direction: 'desc' });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const {
    expenses,
    summary,
    isLoading,
    error,
    hasMore,
    refresh,
    loadMore,
    setFilters: updateFilters,
    setSort: updateSort,
  } = useExpenses({ filters, sort, autoFetch: true });

  const { isSyncing, sync, lastSyncAt, error: syncError, result: syncResult } = useExpenseSync();
  const isPersonalAccount = userProfile?.accountType === 'personal';

  // Actualizar filtros en el hook cuando cambian
  useEffect(() => {
    updateFilters(filters);
  }, [filters, updateFilters]);

  useEffect(() => {
    updateSort(sort);
  }, [sort, updateSort]);

  // Manejar sincronización
  const handleSync = async () => {
    const success = await sync();
    if (success) {
      refresh();
    }
  };

  // Exportar a CSV. Descarga todos los gastos que cumplen los filtros actuales,
  // respetando permisos (el backend ya limita al empleado a sus propios gastos).
  const handleExport = async () => {
    if (!user?.uid) return;
    setIsExporting(true);
    setExportError(null);

    try {
      const all: Expense[] = [];
      let cursor: string | undefined;
      let guard = 0; // tope de seguridad: 100 páginas x 100 = 10,000 gastos

      do {
        const params = new URLSearchParams();
        if (filters.userId) params.set('userId', filters.userId);
        if (filters.estado) params.set('estado', filters.estado);
        if (filters.categoria) params.set('categoria', filters.categoria);
        if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde.toISOString());
        if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta.toISOString());
        params.set('sortField', sort.field);
        params.set('sortDirection', sort.direction);
        params.set('limit', '100');
        if (cursor) params.set('cursor', cursor);

        const response = await fetch(`/api/expenses?${params.toString()}`, {
          headers: { 'x-user-uid': user.uid },
        });
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Error al exportar');
        }

        const page: Expense[] = data.data.expenses.map((exp: Expense & { fecha: string }) => ({
          ...exp,
          fecha: new Date(exp.fecha),
        }));
        all.push(...page);

        cursor = data.data.pagination.hasMore ? data.data.pagination.nextCursor : undefined;
        guard++;
      } while (cursor && guard < 100);

      if (all.length === 0) {
        setExportError('No hay gastos para exportar con los filtros actuales.');
        return;
      }

      const csv = buildExpensesCsv(all);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `gastos-${company?.name ? company.name.replace(/\s+/g, '-').toLowerCase() : 'reporte'}-${stamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Error al exportar');
    } finally {
      setIsExporting(false);
    }
  };

  // Ver detalle de gasto
  const handleViewExpense = (expense: Expense) => {
    // TODO: Abrir modal con detalles
    console.log('Ver gasto:', expense);
  };

  // Verificar si hay board de Monday configurado
  const needsMondayConfig = !company?.mondayBoardId;

  return (
    <div>
      <PortalHeader title="Reportes de Gastos" />

      <div className="p-4 md:p-6 space-y-6">
        {/* Alerta si no hay Monday configurado */}
        {needsMondayConfig && isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800">
                  {isPersonalAccount ? 'Estamos preparando tu operación' : 'Configura tu tablero de Monday'}
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {isPersonalAccount
                    ? 'Aún falta conectar el tablero operativo donde se procesarán tus recibos.'
                    : 'Para sincronizar gastos, necesitas configurar el ID de tu tablero de Monday.com'}
                </p>
                {!isPersonalAccount && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      // TODO: Abrir configuración
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header con acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isPersonalAccount ? 'Mis gastos' : isAdmin ? 'Todos los gastos' : 'Mis gastos'}
            </h2>
            {lastSyncAt && (
              <p className="text-sm text-gray-500">
                Última sincronización: {lastSyncAt.toLocaleString('es-MX')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && !needsMondayConfig && (
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
            )}
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
              {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </div>
        </div>

        {/* Error de exportación */}
        {exportError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            {exportError}
          </div>
        )}

        {/* Resultado de sincronización */}
        {syncResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            Sincronización completada: {syncResult.itemsCreated} nuevos, {syncResult.itemsUpdated}{' '}
            actualizados
          </div>
        )}

        {/* Error de sincronización */}
        {syncError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            Error: {syncError}
          </div>
        )}

        {/* Cards de resumen */}
        <ExpenseSummaryCards summary={summary} isLoading={isLoading && !expenses.length} />

        {/* Filtros */}
        <ExpenseFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          showUserFilter={isAdmin && !isPersonalAccount}
          users={companyUsers.map((u) => ({
            uid: u.uid,
            displayName: u.displayName,
            email: u.email,
          }))}
        />

        {/* Error de carga */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Error al cargar gastos</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="outline" size="sm" onClick={refresh} className="mt-2">
              Reintentar
            </Button>
          </div>
        )}

        {/* Tabla de gastos (desktop) */}
        <div className="hidden md:block">
          <ExpenseTable
            expenses={expenses}
            isLoading={isLoading}
            sort={sort}
            onSortChange={setSort}
            showUserColumn={isAdmin && !isPersonalAccount}
            onViewExpense={handleViewExpense}
          />
        </div>

        {/* Lista de gastos (móvil) */}
        <div className="md:hidden">
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            onViewExpense={handleViewExpense}
          />
        </div>

        {/* Cargar más */}
        {hasMore && (
          <div className="text-center">
            <Button variant="outline" onClick={loadMore} disabled={isLoading}>
              {isLoading ? 'Cargando...' : 'Cargar más'}
            </Button>
          </div>
        )}

        {/* Info de paginación */}
        {expenses.length > 0 && (
          <p className="text-center text-sm text-gray-500">
            Mostrando {expenses.length} gastos
            {hasMore && ' (hay más)'}
          </p>
        )}
      </div>
    </div>
  );
}
