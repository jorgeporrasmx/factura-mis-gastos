// Tipos para el Sistema de Reportes de Gastos

// Estado de un gasto
export type ExpenseStatus =
  | 'pendiente'      // Recién subido, esperando procesamiento
  | 'en_proceso'     // En proceso de facturación
  | 'facturado'      // Factura emitida
  | 'rechazado';     // No se puede facturar

// Categoría de gasto
export type ExpenseCategory =
  | 'alimentacion'
  | 'transporte'
  | 'hospedaje'
  | 'servicios'
  | 'materiales'
  | 'otros';

// Mapeo de categorías a labels legibles
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  alimentacion: 'Alimentación',
  transporte: 'Transporte',
  hospedaje: 'Hospedaje',
  servicios: 'Servicios',
  materiales: 'Materiales',
  otros: 'Otros',
};

// Mapeo de estados a labels legibles
export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  facturado: 'Facturado',
  rechazado: 'Rechazado',
};

// Colores para estados (para UI)
export const EXPENSE_STATUS_COLORS: Record<ExpenseStatus, { bg: string; text: string }> = {
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  en_proceso: { bg: 'bg-blue-100', text: 'text-blue-800' },
  facturado: { bg: 'bg-green-100', text: 'text-green-800' },
  rechazado: { bg: 'bg-red-100', text: 'text-red-800' },
};

// Gasto sincronizado desde Monday
export interface Expense {
  id: string;
  mondayItemId: string;

  // Vinculación empresa/usuario
  companyId: string;
  userId: string;
  userName: string;                // Para mostrar en reportes de admin
  userEmail: string;

  // Datos del gasto
  nombre: string;
  monto: number;
  fecha: Date;
  proveedor: string;
  categoria: ExpenseCategory;
  estado: ExpenseStatus;

  // Archivos en Drive
  reciboUrl?: string;              // Link público a Drive
  receiptDriveId?: string;         // ID del archivo en Drive
  facturaUrl?: string;             // Link a factura si existe
  facturaDriveId?: string;

  // Información adicional
  notas?: string;
  rfcProveedor?: string;
  folioFiscal?: string;

  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date;
}

// Filtros para reportes (admin puede filtrar por usuario)
export interface ExpenseFilters {
  userId?: string;                 // Admin filtra por usuario
  estado?: ExpenseStatus;
  categoria?: ExpenseCategory;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;                 // Búsqueda en nombre/proveedor
  montoMin?: number;
  montoMax?: number;
}

// Opciones de ordenamiento
export type ExpenseSortField = 'fecha' | 'monto' | 'proveedor' | 'estado';
export type SortDirection = 'asc' | 'desc';

export interface ExpenseSortOptions {
  field: ExpenseSortField;
  direction: SortDirection;
}

// Paginación
export interface ExpensePagination {
  limit: number;
  cursor?: string;                 // ID del último documento para paginación
}

// Resumen estadístico
export interface ExpenseSummary {
  total: number;
  pendientes: number;
  enProceso: number;
  facturados: number;
  rechazados: number;
  montoTotal: number;
  montoFacturado: number;
  montoPendiente: number;
  montoRechazado: number;

  // Para admin: desglose por usuario
  byUser?: Record<string, {
    userName: string;
    count: number;
    monto: number;
    facturado: number;
  }>;

  // Desglose por categoría
  byCategory?: Record<ExpenseCategory, {
    count: number;
    monto: number;
  }>;
}

// Respuesta de listado de gastos
export interface ExpenseListResponse {
  expenses: Expense[];
  summary: ExpenseSummary;
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
    totalCount?: number;
  };
}

// Respuesta de sincronización
export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  errors?: string[];
  lastSyncAt: Date;
}

// Datos para crear un gasto manualmente (sin Monday)
export interface CreateExpenseData {
  nombre: string;
  monto: number;
  fecha: Date;
  proveedor: string;
  categoria: ExpenseCategory;
  notas?: string;
  receiptFile?: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
  };
}

// Helper para formatear monto como moneda MXN
export function formatMonto(monto: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(monto);
}

// Helper para formatear fecha
export function formatFecha(fecha: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fecha);
}

// Helper para calcular resumen desde array de gastos
export function calculateExpenseSummary(expenses: Expense[]): ExpenseSummary {
  const summary: ExpenseSummary = {
    total: expenses.length,
    pendientes: 0,
    enProceso: 0,
    facturados: 0,
    rechazados: 0,
    montoTotal: 0,
    montoFacturado: 0,
    montoPendiente: 0,
    montoRechazado: 0,
    byUser: {},
    byCategory: {} as Record<ExpenseCategory, { count: number; monto: number }>,
  };

  // Inicializar categorías
  const categories: ExpenseCategory[] = ['alimentacion', 'transporte', 'hospedaje', 'servicios', 'materiales', 'otros'];
  categories.forEach(cat => {
    summary.byCategory![cat] = { count: 0, monto: 0 };
  });

  expenses.forEach(expense => {
    summary.montoTotal += expense.monto;

    // Por estado
    switch (expense.estado) {
      case 'pendiente':
        summary.pendientes++;
        summary.montoPendiente += expense.monto;
        break;
      case 'en_proceso':
        summary.enProceso++;
        summary.montoPendiente += expense.monto;
        break;
      case 'facturado':
        summary.facturados++;
        summary.montoFacturado += expense.monto;
        break;
      case 'rechazado':
        summary.rechazados++;
        summary.montoRechazado += expense.monto;
        break;
    }

    // Por usuario
    if (!summary.byUser![expense.userId]) {
      summary.byUser![expense.userId] = {
        userName: expense.userName,
        count: 0,
        monto: 0,
        facturado: 0,
      };
    }
    summary.byUser![expense.userId].count++;
    summary.byUser![expense.userId].monto += expense.monto;
    if (expense.estado === 'facturado') {
      summary.byUser![expense.userId].facturado += expense.monto;
    }

    // Por categoría
    summary.byCategory![expense.categoria].count++;
    summary.byCategory![expense.categoria].monto += expense.monto;
  });

  return summary;
}
