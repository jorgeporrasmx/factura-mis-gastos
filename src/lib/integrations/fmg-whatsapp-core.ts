import { createHash } from 'node:crypto';

export const DEFAULT_BOARD_ID = '8964055261';
export const DEFAULT_TEMPLATE_NAME = 'solicitud_factura_jorge_recibo';
export const DEFAULT_TEMPLATE_LANGUAGE = 'es_MX';
export const DEFAULT_PHONE_NUMBER_ID = '1006728382529440';
export const DEFAULT_GRAPH_API_VERSION = 'v23.0';
export const MAX_MEDIA_BYTES = 16 * 1024 * 1024;

export type InvoiceRequest = {
  boardId: string;
  itemId: string;
  merchant: string;
  phone: string;
  purchaseDate: string;
  total: string;
  receiptDriveFileId: string;
};

export type MondayWhatsAppEvent = {
  boardId?: number | string;
  pulseId?: number | string;
  columnId?: string;
  triggerUuid?: string;
  value?: {
    label?: {
      index?: number;
      text?: string;
    };
  };
};

export class PermanentWorkflowError extends Error {
  readonly permanent = true;
}

export function cleanEnv(value: string | undefined): string | undefined {
  return value?.trim().replace(/^["']|["']$/g, '');
}

export function normalizeWhatsAppPhone(rawPhone: string): string {
  let digits = rawPhone.replace(/\D/g, '');

  if (digits.startsWith('00')) digits = digits.slice(2);

  // WhatsApp ya no requiere el "1" histórico entre 52 y el número mexicano.
  if (digits.length === 13 && digits.startsWith('521')) {
    digits = `52${digits.slice(3)}`;
  }

  if (digits.length === 10) digits = `52${digits}`;

  if (!/^\d{11,15}$/.test(digits)) {
    throw new PermanentWorkflowError(
      'El número de WhatsApp no tiene un formato internacional válido'
    );
  }

  return digits;
}

export function extractDriveFileId(value: string): string {
  const trimmed = value.trim();
  const pathMatch = trimmed.match(/\/d\/([A-Za-z0-9_-]+)/);
  if (pathMatch?.[1]) return pathMatch[1];

  try {
    const url = new URL(trimmed);
    const queryId = url.searchParams.get('id');
    if (queryId) return queryId;
  } catch {
    // El error descriptivo se genera abajo.
  }

  if (/^[A-Za-z0-9_-]{20,}$/.test(trimmed)) return trimmed;

  throw new PermanentWorkflowError(
    'El enlace del recibo no contiene un ID válido de Google Drive'
  );
}

export function formatInvoiceTotal(rawTotal: string): string {
  const numeric = Number(rawTotal.replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(numeric)) {
    throw new PermanentWorkflowError('El total del recibo no es numérico');
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(numeric);
}

export function getInvoiceRequestIdempotencyKey(
  request: InvoiceRequest,
  templateName: string
): string {
  return createHash('sha256')
    // Un elemento solo puede generar una solicitud para esta plantilla, aunque
    // sus demás columnas cambien después del primer evento.
    .update([request.boardId, request.itemId, templateName].join(':'))
    .digest('hex');
}

export function hashTraceValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function isMondayWhatsAppTrigger(
  event: MondayWhatsAppEvent | undefined,
  expectedBoardId: string,
  expectedColumnId: string
): event is MondayWhatsAppEvent & { pulseId: number | string } {
  return Boolean(
    event?.pulseId &&
      String(event.boardId) === expectedBoardId &&
      event.columnId === expectedColumnId &&
      event.value?.label?.text?.trim().toLowerCase() === 'whatsapp'
  );
}

export function canSendInvoiceRequest(
  mode: string | undefined,
  itemId: string,
  allowedTestItemId: string | undefined
): boolean {
  const normalizedMode = cleanEnv(mode)?.toLowerCase();
  if (normalizedMode === 'live') return true;
  if (normalizedMode !== 'test') return false;
  return Boolean(cleanEnv(allowedTestItemId) === itemId);
}

export function buildWhatsAppTemplatePayload(
  request: InvoiceRequest,
  mediaId: string,
  selectedTemplate: string,
  language: string
) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: request.phone,
    type: 'template',
    template: {
      name: selectedTemplate,
      language: { code: language },
      components: [
        {
          type: 'header',
          parameters: [{ type: 'image', image: { id: mediaId } }],
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: request.purchaseDate },
            { type: 'text', text: request.total },
          ],
        },
      ],
    },
  };
}
