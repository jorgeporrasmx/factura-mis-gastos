'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { MondayExpenseColumns } from '@/types/monday-expenses';

interface SyncState {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  error: string | null;
  result: {
    itemsProcessed: number;
    itemsCreated: number;
    itemsUpdated: number;
    errors?: string[];
  } | null;
}

interface UseExpenseSyncResult extends SyncState {
  sync: (columnMapping?: MondayExpenseColumns) => Promise<boolean>;
  clearError: () => void;
}

export function useExpenseSync(): UseExpenseSyncResult {
  const { user } = useAuth();

  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    lastSyncAt: null,
    error: null,
    result: null,
  });

  const sync = useCallback(
    async (columnMapping?: MondayExpenseColumns): Promise<boolean> => {
      if (!user?.uid) {
        setState((prev) => ({ ...prev, error: 'Usuario no autenticado' }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        isSyncing: true,
        error: null,
      }));

      try {
        const body = columnMapping ? JSON.stringify({ columnMapping }) : undefined;

        const response = await fetch('/api/expenses/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-uid': user.uid,
          },
          body,
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Error al sincronizar');
        }

        setState({
          isSyncing: false,
          lastSyncAt: new Date(data.data.lastSyncAt),
          error: null,
          result: {
            itemsProcessed: data.data.itemsProcessed,
            itemsCreated: data.data.itemsCreated,
            itemsUpdated: data.data.itemsUpdated,
            errors: data.data.errors,
          },
        });

        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isSyncing: false,
          error: err instanceof Error ? err.message : 'Error desconocido',
        }));
        return false;
      }
    },
    [user?.uid]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    sync,
    clearError,
  };
}

// Hook para verificar estado del board de Monday
export function useMondayBoardStatus() {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [boardInfo, setBoardInfo] = useState<{
    valid: boolean;
    boardName?: string;
    columns?: Array<{ id: string; title: string; type: string }>;
    suggestedMapping?: Partial<MondayExpenseColumns>;
    error?: string;
  } | null>(null);

  const verifyBoard = useCallback(
    async (boardId: string) => {
      if (!user?.uid) return null;

      setIsVerifying(true);

      try {
        // Esta verificación se haría a través de una API que llame a Monday
        // Por ahora, simulamos la llamada
        const response = await fetch(`/api/monday/verify?boardId=${boardId}`, {
          headers: {
            'x-user-uid': user.uid,
          },
        });

        if (!response.ok) {
          throw new Error('Error verificando tablero');
        }

        const data = await response.json();
        setBoardInfo(data);
        return data;
      } catch (err) {
        const errorInfo = {
          valid: false,
          error: err instanceof Error ? err.message : 'Error desconocido',
        };
        setBoardInfo(errorInfo);
        return errorInfo;
      } finally {
        setIsVerifying(false);
      }
    },
    [user?.uid]
  );

  return {
    isVerifying,
    boardInfo,
    verifyBoard,
  };
}
