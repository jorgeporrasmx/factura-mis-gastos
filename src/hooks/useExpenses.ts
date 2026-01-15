'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Expense,
  ExpenseFilters,
  ExpenseSummary,
  ExpenseSortOptions,
} from '@/types/expenses';

interface UseExpensesOptions {
  filters?: ExpenseFilters;
  sort?: ExpenseSortOptions;
  limit?: number;
  autoFetch?: boolean;
}

interface UseExpensesResult {
  expenses: Expense[];
  summary: ExpenseSummary | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;

  // Acciones
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (filters: ExpenseFilters) => void;
  setSort: (sort: ExpenseSortOptions) => void;
}

export function useExpenses(options: UseExpensesOptions = {}): UseExpensesResult {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [filters, setFilters] = useState<ExpenseFilters>(options.filters || {});
  const [sort, setSort] = useState<ExpenseSortOptions>(
    options.sort || { field: 'fecha', direction: 'desc' }
  );
  const limit = options.limit || 20;

  // Construir URL con parámetros
  const buildUrl = useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams();

      if (filters.userId) params.set('userId', filters.userId);
      if (filters.estado) params.set('estado', filters.estado);
      if (filters.categoria) params.set('categoria', filters.categoria);
      if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde.toISOString());
      if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta.toISOString());
      if (filters.search) params.set('search', filters.search);

      params.set('sortField', sort.field);
      params.set('sortDirection', sort.direction);
      params.set('limit', limit.toString());

      if (cursor) params.set('cursor', cursor);

      return `/api/expenses?${params.toString()}`;
    },
    [filters, sort, limit]
  );

  // Fetch gastos
  const fetchExpenses = useCallback(
    async (cursor?: string, append: boolean = false) => {
      if (!user?.uid) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(buildUrl(cursor), {
          headers: {
            'x-user-uid': user.uid,
          },
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Error al cargar gastos');
        }

        // Parsear fechas
        const parsedExpenses = data.data.expenses.map((exp: Expense & { fecha: string; createdAt: string; updatedAt: string; syncedAt: string }) => ({
          ...exp,
          fecha: new Date(exp.fecha),
          createdAt: new Date(exp.createdAt),
          updatedAt: new Date(exp.updatedAt),
          syncedAt: new Date(exp.syncedAt),
        }));

        if (append) {
          setExpenses((prev) => [...prev, ...parsedExpenses]);
        } else {
          setExpenses(parsedExpenses);
          setSummary(data.data.summary);
        }

        setHasMore(data.data.pagination.hasMore);
        setNextCursor(data.data.pagination.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    },
    [user?.uid, buildUrl]
  );

  // Refresh
  const refresh = useCallback(async () => {
    await fetchExpenses();
  }, [fetchExpenses]);

  // Load more
  const loadMore = useCallback(async () => {
    if (nextCursor && !isLoading) {
      await fetchExpenses(nextCursor, true);
    }
  }, [nextCursor, isLoading, fetchExpenses]);

  // Auto fetch on mount and when filters/sort change
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchExpenses();
    }
  }, [fetchExpenses, options.autoFetch]);

  return {
    expenses,
    summary,
    isLoading,
    error,
    hasMore,
    nextCursor,
    refresh,
    loadMore,
    setFilters,
    setSort,
  };
}

// Hook simplificado para resumen
export function useExpenseSummary(userId?: string) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = userId ? `?userId=${userId}` : '';
      const response = await fetch(`/api/expenses/summary${params}`, {
        headers: {
          'x-user-uid': user.uid,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al cargar resumen');
      }

      setSummary(data.data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, userId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refresh: fetchSummary };
}
