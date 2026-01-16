// Tipos para la integración Monday.com de Gastos/Facturas

// Configuración de columnas del tablero de gastos en Monday
export interface MondayExpenseColumns {
  // Columnas requeridas
  monto: string;           // Columna de números (monto del gasto)
  fecha: string;           // Columna de fecha
  proveedor: string;       // Columna de texto
  estado: string;          // Columna status

  // Columnas opcionales
  categoria?: string;      // Columna dropdown
  factura_url?: string;    // Columna link o files
  recibo_url?: string;     // Columna files
  notas?: string;          // Columna texto largo
  rfc?: string;            // Columna texto
  folio?: string;          // Columna texto
  usuario_email?: string;  // Columna email (para vincular con usuario de la app)
}

// Configuración completa de un board de gastos
export interface MondayExpenseBoardConfig {
  boardId: string;
  boardName: string;
  columns: MondayExpenseColumns;
  groups?: MondayExpenseGroups;
}

// Grupos del tablero (opcional, para categorización)
export interface MondayExpenseGroups {
  pendientes?: string;
  enProceso?: string;
  facturados?: string;
  rechazados?: string;
}

// Valor de columna raw de Monday API
export interface MondayColumnValue {
  id: string;
  type: string;
  text: string | null;
  value: string | null;
}

// Item raw de Monday API
export interface MondayExpenseItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  column_values: MondayColumnValue[];
  group: {
    id: string;
    title: string;
  };
}

// Respuesta de query de items
export interface MondayItemsPageResponse {
  cursor: string | null;
  items: MondayExpenseItem[];
}

// Respuesta de query GraphQL a Monday
export interface MondayQueryResponse<T = unknown> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    extensions?: Record<string, unknown>;
  }>;
}

// Estructura de board para query
export interface MondayBoardData {
  boards: Array<{
    id: string;
    name: string;
    columns: Array<{
      id: string;
      title: string;
      type: string;
    }>;
    items_page: MondayItemsPageResponse;
  }>;
}

// Información de columna de un board
export interface MondayColumnInfo {
  id: string;
  title: string;
  type: string;
}

// Resultado de verificación de board
export interface BoardVerificationResult {
  valid: boolean;
  boardName?: string;
  columns?: MondayColumnInfo[];
  suggestedMapping?: Partial<MondayExpenseColumns>;
  missingColumns?: string[];
  error?: string;
}

// Mapeo de tipos de columna de Monday a nuestros campos
export const MONDAY_COLUMN_TYPE_MAP: Record<string, keyof MondayExpenseColumns> = {
  'numbers': 'monto',
  'numeric': 'monto',
  'date': 'fecha',
  'status': 'estado',
  'dropdown': 'categoria',
  'text': 'proveedor',
  'long_text': 'notas',
  'link': 'factura_url',
  'file': 'recibo_url',
  'email': 'usuario_email',
};

// Mapeo de estados de Monday a nuestros estados
export const MONDAY_STATUS_MAP: Record<string, string> = {
  // Variaciones comunes en español
  'pendiente': 'pendiente',
  'nuevo': 'pendiente',
  'por revisar': 'pendiente',
  'sin procesar': 'pendiente',

  'en proceso': 'en_proceso',
  'en_proceso': 'en_proceso',
  'procesando': 'en_proceso',
  'en revisión': 'en_proceso',
  'en revision': 'en_proceso',

  'facturado': 'facturado',
  'completado': 'facturado',
  'listo': 'facturado',
  'finalizado': 'facturado',
  'emitido': 'facturado',

  'rechazado': 'rechazado',
  'cancelado': 'rechazado',
  'no procede': 'rechazado',
  'sin facturar': 'rechazado',
};

// Mapeo de categorías de Monday a nuestras categorías
export const MONDAY_CATEGORY_MAP: Record<string, string> = {
  // Alimentación
  'alimentacion': 'alimentacion',
  'alimentación': 'alimentacion',
  'alimentos': 'alimentacion',
  'comida': 'alimentacion',
  'restaurante': 'alimentacion',
  'comidas': 'alimentacion',

  // Transporte
  'transporte': 'transporte',
  'uber': 'transporte',
  'taxi': 'transporte',
  'gasolina': 'transporte',
  'estacionamiento': 'transporte',
  'peaje': 'transporte',
  'casetas': 'transporte',

  // Hospedaje
  'hospedaje': 'hospedaje',
  'hotel': 'hospedaje',
  'alojamiento': 'hospedaje',
  'airbnb': 'hospedaje',

  // Servicios
  'servicios': 'servicios',
  'servicio': 'servicios',
  'software': 'servicios',
  'suscripcion': 'servicios',
  'suscripción': 'servicios',

  // Materiales
  'materiales': 'materiales',
  'material': 'materiales',
  'papelería': 'materiales',
  'papeleria': 'materiales',
  'oficina': 'materiales',
  'equipo': 'materiales',

  // Otros (default)
  'otros': 'otros',
  'otro': 'otros',
  'varios': 'otros',
  'miscelaneos': 'otros',
  'misceláneos': 'otros',
};

// Helper para detectar automáticamente el mapeo de columnas
export function detectColumnMapping(columns: MondayColumnInfo[]): Partial<MondayExpenseColumns> {
  const mapping: Partial<MondayExpenseColumns> = {};

  for (const col of columns) {
    const titleLower = col.title.toLowerCase();
    const typeLower = col.type.toLowerCase();

    // Detección por nombre de columna
    if (titleLower.includes('monto') || titleLower.includes('importe') || titleLower.includes('total')) {
      mapping.monto = col.id;
    } else if (titleLower.includes('fecha')) {
      mapping.fecha = col.id;
    } else if (titleLower.includes('proveedor') || titleLower.includes('comercio') || titleLower.includes('establecimiento')) {
      mapping.proveedor = col.id;
    } else if (titleLower.includes('estado') || titleLower.includes('status')) {
      mapping.estado = col.id;
    } else if (titleLower.includes('categoria') || titleLower.includes('categoría') || titleLower.includes('tipo')) {
      mapping.categoria = col.id;
    } else if (titleLower.includes('nota') || titleLower.includes('comentario') || titleLower.includes('descripcion')) {
      mapping.notas = col.id;
    } else if (titleLower.includes('factura')) {
      mapping.factura_url = col.id;
    } else if (titleLower.includes('recibo') || titleLower.includes('comprobante') || titleLower.includes('ticket')) {
      mapping.recibo_url = col.id;
    } else if (titleLower.includes('rfc')) {
      mapping.rfc = col.id;
    } else if (titleLower.includes('folio')) {
      mapping.folio = col.id;
    } else if (titleLower.includes('email') || titleLower.includes('correo') || titleLower.includes('usuario')) {
      if (typeLower === 'email') {
        mapping.usuario_email = col.id;
      }
    }

    // Si no se detectó por nombre, intentar por tipo
    if (!mapping.monto && (typeLower === 'numbers' || typeLower === 'numeric')) {
      mapping.monto = col.id;
    }
    if (!mapping.fecha && typeLower === 'date') {
      mapping.fecha = col.id;
    }
    if (!mapping.estado && typeLower === 'status') {
      mapping.estado = col.id;
    }
  }

  return mapping;
}

// Validar que un mapeo tiene las columnas requeridas
export function validateColumnMapping(mapping: Partial<MondayExpenseColumns>): {
  valid: boolean;
  missingColumns: string[];
} {
  const required: (keyof MondayExpenseColumns)[] = ['monto', 'fecha', 'proveedor', 'estado'];
  const missing = required.filter(key => !mapping[key]);

  return {
    valid: missing.length === 0,
    missingColumns: missing,
  };
}
