// Helpers puros (sin dependencias de red/Firebase/Monday) para la trazabilidad
// de empleados. Se mantienen aislados para poder probarlos con Node directamente
// (ver scripts/verify-employee-traceability.mjs).

import type { Expense } from '@/types/expenses';

// Datos mínimos de un empleado que necesitamos para trazabilidad.
export interface EmployeeIdentity {
  uid: string;
  name: string;
  email: string;
  whatsappPhone?: string;
  employeeCode?: string;
}

// Registro de usuario de empresa tal como lo devuelve Firestore.
export interface EmployeeRecord {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  whatsappPhone?: string;
}

// Normaliza un título de columna de Monday para comparaciones tolerantes.
// Evita usar clases de caracteres combinantes (que pueden dar problemas de lint)
// mapeando explícitamente las vocales acentuadas más comunes en español.
const ACCENT_MAP: Record<string, string> = {
  á: 'a', à: 'a', ä: 'a', â: 'a',
  é: 'e', è: 'e', ë: 'e', ê: 'e',
  í: 'i', ì: 'i', ï: 'i', î: 'i',
  ó: 'o', ò: 'o', ö: 'o', ô: 'o',
  ú: 'u', ù: 'u', ü: 'u', û: 'u',
  ñ: 'n',
};

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[áàäâéèëêíìïîóòöôúùüûñ]/g, (c) => ACCENT_MAP[c] || c)
    .replace(/\s+/g, ' ')
    .trim();
}

// Columnas de empleado que esperamos en el machote de Monday.
export interface EmployeeColumnMatch {
  // id de la columna en Monday -> tipo de dato del empleado
  nombreColId?: string;
  nombreColType?: string;
  emailColId?: string;
  emailColType?: string;
  idColId?: string;
  idColType?: string;
}

export interface MondayColumnLite {
  id: string;
  title: string;
  type: string;
}

// Detecta, de forma tolerante, las columnas de empleado de un board.
// No falla si faltan: devuelve las que encontró + advertencias por las faltantes.
export function detectEmployeeColumns(columns: MondayColumnLite[]): {
  match: EmployeeColumnMatch;
  warnings: string[];
} {
  const match: EmployeeColumnMatch = {};

  for (const col of columns) {
    const t = normalizeTitle(col.title);

    // ID estable del empleado (uid de Firebase)
    if (!match.idColId && (t === 'empleado id' || t === 'id empleado' || t === 'empleado uid' || t === 'uid empleado')) {
      match.idColId = col.id;
      match.idColType = col.type;
      continue;
    }

    // Email estable del empleado
    if (
      !match.emailColId &&
      (t === 'empleado email' || t === 'email empleado' || t === 'correo empleado' || t === 'correo del empleado' || t === 'email del empleado')
    ) {
      match.emailColId = col.id;
      match.emailColType = col.type;
      continue;
    }

    // Nombre visible del empleado (columna exacta "Empleado" o variantes de nombre)
    if (!match.nombreColId && (t === 'empleado' || t === 'nombre empleado' || t === 'empleado nombre' || t === 'nombre del empleado')) {
      match.nombreColId = col.id;
      match.nombreColType = col.type;
      continue;
    }
  }

  const warnings: string[] = [];
  if (!match.nombreColId) warnings.push('Empleado');
  if (!match.emailColId) warnings.push('Empleado Email');
  if (!match.idColId) warnings.push('Empleado ID');

  return { match, warnings };
}

// Construye el objeto column_values de Monday con los datos del empleado,
// respetando el tipo de cada columna. Sólo escribe columnas que existen.
export function buildEmployeeColumnValues(
  columns: MondayColumnLite[],
  employee: EmployeeIdentity
): { columnValues: Record<string, unknown>; warnings: string[] } {
  const { match, warnings } = detectEmployeeColumns(columns);
  const columnValues: Record<string, unknown> = {};

  const setValue = (colId: string | undefined, colType: string | undefined, value: string) => {
    if (!colId || !value) return;
    const type = (colType || 'text').toLowerCase();
    if (type === 'email') {
      columnValues[colId] = { email: value, text: value };
    } else if (type === 'text' || type === 'long_text' || type === 'text_long') {
      columnValues[colId] = value;
    } else {
      // Tipo no soportado de forma segura (ej. tags requiere ids precreados).
      // No escribimos para no romper la subida.
    }
  };

  setValue(match.nombreColId, match.nombreColType, employee.name);
  setValue(match.emailColId, match.emailColType, employee.email);
  setValue(match.idColId, match.idColType, employee.uid);

  return { columnValues, warnings };
}

// Resuelve la identidad del empleado de un item usando el email o el uid que
// vengan de Monday, contra la lista de usuarios de la empresa. Si no hay match,
// usa los valores de fallback (típicamente el admin que sincroniza).
export function resolveEmployeeForItem(
  fromMonday: { empleadoEmail?: string | null; empleadoId?: string | null },
  employees: EmployeeRecord[],
  fallback: { userId: string; userName: string; userEmail: string }
): { userId: string; userName: string; userEmail: string } {
  const byUid = new Map<string, EmployeeRecord>();
  const byEmail = new Map<string, EmployeeRecord>();
  for (const emp of employees) {
    if (emp.uid) byUid.set(emp.uid.trim(), emp);
    if (emp.email) byEmail.set(emp.email.toLowerCase().trim(), emp);
  }

  let matched: EmployeeRecord | undefined;
  const id = fromMonday.empleadoId?.trim();
  const email = fromMonday.empleadoEmail?.toLowerCase().trim();

  if (id && byUid.has(id)) {
    matched = byUid.get(id);
  } else if (email && byEmail.has(email)) {
    matched = byEmail.get(email);
  }

  if (matched) {
    return {
      userId: matched.uid,
      userName: matched.displayName || matched.email || fallback.userName,
      userEmail: matched.email || fallback.userEmail,
    };
  }

  // Sin match en la empresa: si Monday trae al menos un email/id, respetarlo
  // como dato visible aunque no exista en Firestore (mejor que perderlo).
  if (email || id) {
    return {
      userId: id || fallback.userId,
      userName: email || fallback.userName,
      userEmail: email || fallback.userEmail,
    };
  }

  return fallback;
}

// Campos de empleado que nunca deben sobrescribirse con vacío en reprocesos.
const EMPLOYEE_FIELDS = ['userId', 'userName', 'userEmail', 'employeeCode'] as const;

// Regla dura: al actualizar un gasto existente, no vaciar un campo de empleado
// ya poblado con un valor vacío. Devuelve el objeto a escribir.
export function mergeEmployeePreservingNonEmpty<T extends Record<string, unknown>>(
  incoming: T,
  existing: Record<string, unknown> | undefined
): T {
  if (!existing) return incoming;
  const result: Record<string, unknown> = { ...incoming };
  for (const field of EMPLOYEE_FIELDS) {
    const incomingVal = result[field];
    const existingVal = existing[field];
    const incomingEmpty = incomingVal === undefined || incomingVal === null || incomingVal === '';
    const existingHasValue = existingVal !== undefined && existingVal !== null && existingVal !== '';
    if (incomingEmpty && existingHasValue) {
      result[field] = existingVal;
    }
  }
  return result as T;
}

// Escapa un campo para CSV (RFC 4180).
function csvEscape(value: unknown): string {
  const s = value === undefined || value === null ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const CSV_HEADERS = [
  'Fecha',
  'Concepto',
  'Empleado',
  'Email empleado',
  'ID empleado',
  'Proveedor',
  'Categoría',
  'Monto',
  'Estado',
  'Recibo',
  'Factura',
];

// Construye un CSV a partir de una lista de gastos, incluyendo datos del empleado.
export function buildExpensesCsv(expenses: Expense[]): string {
  const rows: string[] = [];
  rows.push(CSV_HEADERS.join(','));

  for (const e of expenses) {
    const fecha = e.fecha instanceof Date ? e.fecha.toISOString().split('T')[0] : String(e.fecha ?? '');
    const row = [
      fecha,
      e.nombre,
      e.userName,
      e.userEmail,
      e.userId,
      e.proveedor,
      e.categoria,
      typeof e.monto === 'number' ? e.monto.toFixed(2) : e.monto,
      e.estado,
      e.reciboUrl || '',
      e.facturaUrl || '',
    ].map(csvEscape);
    rows.push(row.join(','));
  }

  // BOM para que Excel abra UTF-8 correctamente.
  return '\uFEFF' + rows.join('\r\n');
}
