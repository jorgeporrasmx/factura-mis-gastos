// Monday.com API Client para Gastos/Facturas
// Lee items de tableros de gastos y los transforma a nuestro modelo

import type {
  MondayExpenseColumns,
  MondayExpenseItem,
  MondayColumnValue,
  MondayQueryResponse,
  MondayBoardData,
  MondayColumnInfo,
  BoardVerificationResult,
  MondayItemsPageResponse,
  MONDAY_STATUS_MAP,
  MONDAY_CATEGORY_MAP,
  detectColumnMapping,
  validateColumnMapping,
} from '@/types/monday-expenses';
import type { Expense, ExpenseStatus, ExpenseCategory } from '@/types/expenses';

// API URL de Monday
const MONDAY_API_URL = 'https://api.monday.com/v2';

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Ejecutar query GraphQL a Monday
 */
async function executeMondayQuery<T>(query: string): Promise<MondayQueryResponse<T>> {
  const apiKey = process.env.MONDAY_API_KEY;

  if (!apiKey) {
    throw new Error('MONDAY_API_KEY no configurada');
  }

  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Monday API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(`Monday GraphQL error: ${result.errors[0].message}`);
  }

  return result;
}

// ============================================================================
// BOARD OPERATIONS
// ============================================================================

/**
 * Verificar acceso a un board y obtener su estructura
 */
export async function verifyBoardAccess(boardId: string): Promise<BoardVerificationResult> {
  const query = `
    query {
      boards(ids: ${boardId}) {
        id
        name
        columns {
          id
          title
          type
        }
      }
    }
  `;

  try {
    const result = await executeMondayQuery<{ boards: Array<{ id: string; name: string; columns: MondayColumnInfo[] }> }>(query);

    const board = result.data.boards?.[0];
    if (!board) {
      return { valid: false, error: 'Board no encontrado' };
    }

    // Importar helpers de tipos
    const { detectColumnMapping, validateColumnMapping } = await import('@/types/monday-expenses');

    // Detectar mapeo automático
    const suggestedMapping = detectColumnMapping(board.columns);
    const validation = validateColumnMapping(suggestedMapping);

    return {
      valid: validation.valid,
      boardName: board.name,
      columns: board.columns,
      suggestedMapping,
      missingColumns: validation.missingColumns,
      error: validation.valid ? undefined : `Faltan columnas requeridas: ${validation.missingColumns.join(', ')}`,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Obtener items de un board con paginación
 */
export async function fetchBoardItems(
  boardId: string,
  cursor?: string,
  itemLimit: number = 100
): Promise<{ items: MondayExpenseItem[]; nextCursor: string | null }> {
  const cursorParam = cursor ? `, cursor: "${cursor}"` : '';

  const query = `
    query {
      boards(ids: ${boardId}) {
        items_page(limit: ${itemLimit}${cursorParam}) {
          cursor
          items {
            id
            name
            created_at
            updated_at
            group {
              id
              title
            }
            column_values {
              id
              type
              text
              value
            }
          }
        }
      }
    }
  `;

  const result = await executeMondayQuery<MondayBoardData>(query);

  const board = result.data.boards?.[0];
  if (!board) {
    throw new Error('Board no encontrado');
  }

  return {
    items: board.items_page.items,
    nextCursor: board.items_page.cursor,
  };
}

/**
 * Obtener todos los items de un board (con paginación automática)
 */
export async function fetchAllBoardItems(boardId: string): Promise<MondayExpenseItem[]> {
  const allItems: MondayExpenseItem[] = [];
  let cursor: string | undefined;

  do {
    const { items, nextCursor } = await fetchBoardItems(boardId, cursor);
    allItems.push(...items);
    cursor = nextCursor ?? undefined;
  } while (cursor);

  return allItems;
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

/**
 * Parsear valor de columna de Monday según su tipo
 */
function parseColumnValue(column: MondayColumnValue): string | number | null {
  if (!column.value && !column.text) return null;

  const type = column.type.toLowerCase();

  switch (type) {
    case 'numeric':
    case 'numbers':
      // Intentar parsear el texto o el valor
      if (column.text) {
        const num = parseFloat(column.text.replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? 0 : num;
      }
      if (column.value) {
        try {
          const parsed = JSON.parse(column.value);
          return parsed.value ?? parsed ?? 0;
        } catch {
          return 0;
        }
      }
      return 0;

    case 'date':
      if (column.text) return column.text;
      if (column.value) {
        try {
          const parsed = JSON.parse(column.value);
          return parsed.date || null;
        } catch {
          return null;
        }
      }
      return null;

    case 'status':
    case 'dropdown':
      return column.text;

    case 'link':
      if (column.value) {
        try {
          const parsed = JSON.parse(column.value);
          return parsed.url || null;
        } catch {
          return column.text;
        }
      }
      return column.text;

    case 'file':
    case 'files':
      if (column.value) {
        try {
          const parsed = JSON.parse(column.value);
          // Puede ser un array de archivos
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].url || parsed[0].public_url || null;
          }
          return null;
        } catch {
          return null;
        }
      }
      return null;

    case 'email':
      if (column.value) {
        try {
          const parsed = JSON.parse(column.value);
          return parsed.email || column.text;
        } catch {
          return column.text;
        }
      }
      return column.text;

    default:
      return column.text;
  }
}

/**
 * Mapear estado de Monday a nuestro enum
 */
function mapEstado(mondayStatus: string | null): ExpenseStatus {
  if (!mondayStatus) return 'pendiente';

  const { MONDAY_STATUS_MAP } = require('@/types/monday-expenses');
  const normalized = mondayStatus.toLowerCase().trim();
  return (MONDAY_STATUS_MAP[normalized] as ExpenseStatus) || 'pendiente';
}

/**
 * Mapear categoría de Monday a nuestro enum
 */
function mapCategoria(mondayCategoria: string | null): ExpenseCategory {
  if (!mondayCategoria) return 'otros';

  const { MONDAY_CATEGORY_MAP } = require('@/types/monday-expenses');
  const normalized = mondayCategoria.toLowerCase().trim();
  return (MONDAY_CATEGORY_MAP[normalized] as ExpenseCategory) || 'otros';
}

/**
 * Transformar item de Monday a Expense
 */
export function transformMondayItem(
  item: MondayExpenseItem,
  columnMapping: MondayExpenseColumns,
  companyId: string,
  defaultUserId: string,
  defaultUserName: string,
  defaultUserEmail: string
): Expense {
  // Crear mapa de columnas por ID
  const columns: Record<string, MondayColumnValue> = {};
  item.column_values.forEach(col => {
    columns[col.id] = col;
  });

  // Helper para obtener valor de columna
  const getCol = (key: keyof MondayExpenseColumns): string | number | null => {
    const colId = columnMapping[key];
    if (!colId || !columns[colId]) return null;
    return parseColumnValue(columns[colId]);
  };

  // Parsear fecha
  const fechaStr = getCol('fecha') as string | null;
  const fecha = fechaStr ? new Date(fechaStr) : new Date();

  // Determinar usuario (si hay columna de email, buscar usuario por email)
  const userEmail = (getCol('usuario_email') as string) || defaultUserEmail;

  const now = new Date();

  return {
    id: item.id,
    mondayItemId: item.id,

    // Vinculación
    companyId,
    userId: defaultUserId, // Se puede mejorar para buscar por email
    userName: defaultUserName,
    userEmail,

    // Datos del gasto
    nombre: item.name,
    monto: (getCol('monto') as number) || 0,
    fecha,
    proveedor: (getCol('proveedor') as string) || 'Sin proveedor',
    categoria: mapCategoria(getCol('categoria') as string),
    estado: mapEstado(getCol('estado') as string),

    // Archivos
    reciboUrl: (getCol('recibo_url') as string) || undefined,
    facturaUrl: (getCol('factura_url') as string) || undefined,

    // Información adicional
    notas: (getCol('notas') as string) || undefined,
    rfcProveedor: (getCol('rfc') as string) || undefined,
    folioFiscal: (getCol('folio') as string) || undefined,

    // Metadatos
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    syncedAt: now,
  };
}

/**
 * Sincronizar items de Monday a array de Expenses
 */
export async function syncBoardToExpenses(
  boardId: string,
  columnMapping: MondayExpenseColumns,
  companyId: string,
  defaultUserId: string,
  defaultUserName: string,
  defaultUserEmail: string
): Promise<{
  expenses: Expense[];
  itemsProcessed: number;
  errors: string[];
}> {
  const expenses: Expense[] = [];
  const errors: string[] = [];

  try {
    const items = await fetchAllBoardItems(boardId);

    for (const item of items) {
      try {
        const expense = transformMondayItem(
          item,
          columnMapping,
          companyId,
          defaultUserId,
          defaultUserName,
          defaultUserEmail
        );
        expenses.push(expense);
      } catch (error) {
        errors.push(`Error procesando item ${item.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    return {
      expenses,
      itemsProcessed: items.length,
      errors,
    };
  } catch (error) {
    throw new Error(`Error sincronizando board: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verificar si Monday está configurado
 */
export function isMondayConfigured(): boolean {
  return Boolean(process.env.MONDAY_API_KEY);
}

/**
 * Obtener columnas de un board para mostrar en UI de configuración
 */
export async function getBoardColumns(boardId: string): Promise<MondayColumnInfo[]> {
  const result = await verifyBoardAccess(boardId);
  return result.columns || [];
}
