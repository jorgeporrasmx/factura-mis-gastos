import { createHash } from 'node:crypto';
import type {
  InvoiceRequestAutomation,
  InvoiceRequestFiscalProfile,
  InvoiceRequestMondayColumns,
} from '@/types/company';

export const GENERIC_TEMPLATE_NAME = 'solicitud_factura_fmg_v1';

export type InvoiceRequestTenant = {
  companyId: string;
  companyName: string;
  boardId: string;
  fiscalProfile: InvoiceRequestFiscalProfile;
  columns: InvoiceRequestMondayColumns;
};

export type InvoiceRequestMondayTarget = {
  companyId: string;
  boardId: string;
  itemId: string;
  columns: InvoiceRequestMondayColumns;
};

export type MondayBoardColumn = {
  id: string;
  title: string;
  type: string;
};

const REQUIRED_COLUMN_TITLES = {
  method: ['método', 'metodo'],
  phone: ['whatsapp'],
  purchaseDate: ['fecha de compra'],
  total: ['total'],
  receiptDriveUrl: ['id', 'recibo'],
  whatsAppMessageId: ['whatsapp id'],
  whatsAppState: ['whatsapp estado'],
} as const;

const EXPECTED_COLUMN_TYPES: Record<keyof InvoiceRequestMondayColumns, string[]> = {
  method: ['status'],
  phone: ['phone'],
  purchaseDate: ['text', 'date'],
  total: ['numbers'],
  receiptDriveUrl: ['text', 'link'],
  whatsAppMessageId: ['text'],
  whatsAppState: ['status'],
};

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase();
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Perfil fiscal incompleto: ${field}`);
  }
  return value.trim();
}

export function getFiscalProfileVersion(
  profile: Omit<InvoiceRequestFiscalProfile, 'version'>
): string {
  return createHash('sha256')
    .update(
      [
        profile.legalName,
        profile.rfc,
        profile.taxRegime,
        profile.postalCode,
        profile.cfdiUse,
        profile.invoiceEmail,
        profile.csfUrl,
        profile.verifiedAt,
        profile.verifiedBy,
      ].join('\n')
    )
    .digest('hex');
}

export function validateFiscalProfile(
  value: unknown
): InvoiceRequestFiscalProfile {
  if (!value || typeof value !== 'object') {
    throw new Error('La empresa no tiene un perfil fiscal verificado');
  }

  const candidate = value as Partial<InvoiceRequestFiscalProfile>;
  const profile: InvoiceRequestFiscalProfile = {
    legalName: requiredText(candidate.legalName, 'razón social'),
    rfc: requiredText(candidate.rfc, 'RFC').toUpperCase(),
    taxRegime: requiredText(candidate.taxRegime, 'régimen fiscal'),
    postalCode: requiredText(candidate.postalCode, 'código postal'),
    cfdiUse: requiredText(candidate.cfdiUse, 'uso de CFDI'),
    invoiceEmail: requiredText(candidate.invoiceEmail, 'correo de facturación').toLowerCase(),
    csfUrl: requiredText(candidate.csfUrl, 'enlace de CSF'),
    verifiedAt: requiredText(candidate.verifiedAt, 'fecha de verificación'),
    verifiedBy: requiredText(candidate.verifiedBy, 'responsable de verificación'),
    version: requiredText(candidate.version, 'versión del perfil'),
  };

  if (!/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/.test(profile.rfc)) {
    throw new Error('El RFC verificado no tiene un formato válido');
  }
  if (!/^\d{5}$/.test(profile.postalCode)) {
    throw new Error('El código postal fiscal debe tener 5 dígitos');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.invoiceEmail)) {
    throw new Error('El correo de facturación no es válido');
  }
  let csfUrl: URL;
  try {
    csfUrl = new URL(profile.csfUrl);
  } catch {
    throw new Error('El enlace de la CSF no es válido');
  }
  if (csfUrl.protocol !== 'https:') {
    throw new Error('El enlace de la CSF debe usar HTTPS');
  }

  const { version: _version, ...versionInput } = profile;
  void _version;
  if (getFiscalProfileVersion(versionInput) !== profile.version) {
    throw new Error('La versión del perfil fiscal no coincide con sus datos verificados');
  }

  return profile;
}

export function validateMondayColumns(
  value: unknown
): InvoiceRequestMondayColumns {
  if (!value || typeof value !== 'object') {
    throw new Error('La empresa no tiene un mapeo de columnas de Monday');
  }
  const candidate = value as Partial<InvoiceRequestMondayColumns>;
  return {
    method: requiredText(candidate.method, 'columna Método'),
    phone: requiredText(candidate.phone, 'columna WhatsApp'),
    purchaseDate: requiredText(candidate.purchaseDate, 'columna Fecha de compra'),
    total: requiredText(candidate.total, 'columna Total'),
    receiptDriveUrl: requiredText(candidate.receiptDriveUrl, 'columna Recibo'),
    whatsAppMessageId: requiredText(candidate.whatsAppMessageId, 'columna WhatsApp ID'),
    whatsAppState: requiredText(candidate.whatsAppState, 'columna WhatsApp estado'),
  };
}

export function buildVerifiedTenant(input: {
  companyId: string;
  companyName: string;
  companyStatus?: string;
  boardId?: string;
  automation?: InvoiceRequestAutomation;
}): InvoiceRequestTenant {
  if (input.companyStatus !== 'active') {
    throw new Error('La empresa no está activa');
  }
  if (!input.boardId) throw new Error('La empresa no tiene tablero de Monday');
  if (!input.automation?.enabled || input.automation.status !== 'ready') {
    throw new Error('La automatización de WhatsApp no está habilitada para esta empresa');
  }

  return {
    companyId: input.companyId,
    companyName: input.companyName,
    boardId: input.boardId,
    fiscalProfile: validateFiscalProfile(input.automation.fiscalProfile),
    columns: validateMondayColumns(input.automation.mondayColumns),
  };
}

export function resolveMondayColumnMap(
  columns: MondayBoardColumn[]
): InvoiceRequestMondayColumns {
  const resolved = {} as InvoiceRequestMondayColumns;

  for (const [key, titles] of Object.entries(REQUIRED_COLUMN_TITLES) as Array<
    [keyof InvoiceRequestMondayColumns, readonly string[]]
  >) {
    const matches = columns.filter((column) =>
      titles.includes(normalizeTitle(column.title))
    );
    if (matches.length !== 1) {
      throw new Error(
        matches.length === 0
          ? `Falta la columna ${titles[0]} en el tablero`
          : `La columna ${titles[0]} está duplicada en el tablero`
      );
    }
    if (!EXPECTED_COLUMN_TYPES[key].includes(matches[0].type)) {
      throw new Error(`La columna ${matches[0].title} tiene un tipo incompatible`);
    }
    resolved[key] = matches[0].id;
  }

  return resolved;
}

export function isTenantMondayTrigger(
  event: {
    boardId?: number | string;
    pulseId?: number | string;
    columnId?: string;
    value?: { label?: { text?: string } };
  } | undefined,
  tenant: Pick<InvoiceRequestTenant, 'boardId' | 'columns'>
): boolean {
  return Boolean(
    event?.pulseId &&
      String(event.boardId) === tenant.boardId &&
      event.columnId === tenant.columns.method &&
      event.value?.label?.text?.trim().toLowerCase() === 'whatsapp'
  );
}
