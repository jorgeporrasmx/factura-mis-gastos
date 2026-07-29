import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import {
  cleanEnv,
  DEFAULT_BOARD_ID,
  DEFAULT_GRAPH_API_VERSION,
  DEFAULT_PHONE_NUMBER_ID,
  DEFAULT_TEMPLATE_LANGUAGE,
  DEFAULT_TEMPLATE_NAME,
  buildWhatsAppTemplatePayload,
  extractDriveFileId,
  formatInvoiceTotal,
  getInvoiceRequestIdempotencyKey,
  hashTraceValue,
  MAX_MEDIA_BYTES,
  normalizeWhatsAppPhone,
  PermanentWorkflowError,
  type InvoiceRequest,
} from './fmg-whatsapp-core';
import {
  runInvoiceRequestValidation,
  runInvoiceRequestWorkflow,
} from './fmg-whatsapp-workflow';

const MONDAY_API_URL = 'https://api.monday.com/v2';
const IDEMPOTENCY_COLLECTION = 'fmg_whatsapp_invoice_requests';

export const FMG_MONDAY_COLUMNS = {
  method: 'proyecto',
  phone: 'phone_mm10z3aw',
  purchaseDate: 'text_mkthrxct',
  total: 'n_meros',
  receiptDriveUrl: 'enlace4',
  whatsAppMessageId: 'text_mm5q5vg6',
  whatsAppState: 'color_mm5qc2dz',
} as const;

type MondayColumnValue = {
  id: string;
  text: string | null;
  value: string | null;
  type: string;
};

type MondayItem = {
  id: string;
  name: string;
  board: { id: string };
  column_values: MondayColumnValue[];
};

type MondayApiPayload<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type DownloadedFile = {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
};

export type SendInvoiceRequestResult =
  | { status: 'sent'; messageId: string; idempotencyKey: string }
  | { status: 'duplicate'; messageId?: string; idempotencyKey: string };

export type InvoiceRequestDryRun = {
  status: 'validated';
  itemId: string;
  merchant: string;
  phone: string;
  purchaseDate: string;
  total: string;
  templateName: string;
  templateLanguage: string;
  receipt: {
    fileName: string;
    mimeType: string;
    bytes: number;
  };
  idempotencyKey: string;
};

function requiredEnv(...names: string[]): string {
  for (const name of names) {
    const value = cleanEnv(process.env[name]);
    if (value) return value;
  }
  throw new Error(`${names.join(' o ')} no configurada`);
}

function graphApiVersion(): string {
  return (
    cleanEnv(process.env.WHATSAPP_GRAPH_API_VERSION) ||
    cleanEnv(process.env.WHATSAPP_GRAPH_VERSION) ||
    DEFAULT_GRAPH_API_VERSION
  );
}

function templateName(): string {
  return cleanEnv(process.env.WHATSAPP_TEMPLATE_NAME) || DEFAULT_TEMPLATE_NAME;
}

function whatsAppToken(): string {
  return requiredEnv('WHATSAPP_CLOUD_ACCESS_TOKEN', 'WHATSAPP_SYSTEM_USER_TOKEN');
}

function getColumn(item: MondayItem, columnId: string): MondayColumnValue | undefined {
  return item.column_values.find((column) => column.id === columnId);
}

async function mondayRequest<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      Authorization: requiredEnv('MONDAY_API_KEY'),
      'Content-Type': 'application/json',
      'API-Version': process.env.MONDAY_API_VERSION || '2026-07',
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  const payload = (await response.json()) as MondayApiPayload<T>;
  if (!response.ok || payload.errors?.length || !payload.data) {
    const detail = payload.errors?.[0]?.message || `${response.status} ${response.statusText}`;
    throw new Error(`Monday API: ${detail}`);
  }

  return payload.data;
}

async function updateMondayItem(
  itemId: string,
  values: Record<string, unknown>
): Promise<void> {
  await mondayRequest<{ change_multiple_column_values: { id: string } }>(
    `
      mutation FmgUpdateWhatsapp(
        $boardId: ID!
        $itemId: ID!
        $columnValues: JSON!
      ) {
        change_multiple_column_values(
          board_id: $boardId
          item_id: $itemId
          column_values: $columnValues
        ) {
          id
        }
      }
    `,
    {
      boardId: process.env.MONDAY_FMG_BOARD_ID || DEFAULT_BOARD_ID,
      itemId,
      columnValues: JSON.stringify(values),
    }
  );
}

async function createMondayUpdate(itemId: string, body: string): Promise<void> {
  await mondayRequest<{ create_update: { id: string } }>(
    `
      mutation FmgWhatsappUpdate($itemId: ID!, $body: String!) {
        create_update(item_id: $itemId, body: $body) {
          id
        }
      }
    `,
    { itemId, body }
  );
}

async function fetchMondayItem(itemId: string): Promise<MondayItem | null> {
  const data = await mondayRequest<{ items: MondayItem[] }>(
    `
      query FmgWhatsappItem($itemIds: [ID!]!) {
        items(ids: $itemIds) {
          id
          name
          board { id }
          column_values(ids: [
            "${FMG_MONDAY_COLUMNS.method}",
            "${FMG_MONDAY_COLUMNS.phone}",
            "${FMG_MONDAY_COLUMNS.purchaseDate}",
            "${FMG_MONDAY_COLUMNS.total}",
            "${FMG_MONDAY_COLUMNS.receiptDriveUrl}",
            "${FMG_MONDAY_COLUMNS.whatsAppMessageId}",
            "${FMG_MONDAY_COLUMNS.whatsAppState}"
          ]) {
            id
            text
            value
            type
          }
        }
      }
    `,
    { itemIds: [itemId] }
  );

  return data.items[0] || null;
}

async function loadInvoiceRequest(
  itemId: string
): Promise<InvoiceRequest> {
  const item = await fetchMondayItem(itemId);
  if (!item) {
    throw new PermanentWorkflowError('El recibo de Monday no existe o no es accesible');
  }

  const expectedBoardId = process.env.MONDAY_FMG_BOARD_ID || DEFAULT_BOARD_ID;
  if (item.board.id !== expectedBoardId) {
    throw new PermanentWorkflowError('El recibo pertenece a un tablero no autorizado');
  }

  const method = getColumn(item, FMG_MONDAY_COLUMNS.method)?.text?.trim().toLowerCase();
  if (method !== 'whatsapp') {
    throw new PermanentWorkflowError('El método del recibo ya no es WhatsApp');
  }

  const phone = getColumn(item, FMG_MONDAY_COLUMNS.phone)?.text;
  const purchaseDate = getColumn(item, FMG_MONDAY_COLUMNS.purchaseDate)?.text;
  const total = getColumn(item, FMG_MONDAY_COLUMNS.total)?.text;
  const receiptDriveUrl = getColumn(item, FMG_MONDAY_COLUMNS.receiptDriveUrl)?.text;

  if (!phone) throw new PermanentWorkflowError('El recibo no tiene teléfono de WhatsApp');
  if (!purchaseDate) throw new PermanentWorkflowError('El recibo no tiene fecha de compra');
  if (!total) throw new PermanentWorkflowError('El recibo no tiene total');
  if (!receiptDriveUrl) {
    throw new PermanentWorkflowError('El recibo no tiene imagen en Google Drive');
  }

  return {
    boardId: item.board.id,
    itemId: item.id,
    merchant: item.name,
    phone: normalizeWhatsAppPhone(phone),
    purchaseDate,
    total: formatInvoiceTotal(total),
    receiptDriveFileId: extractDriveFileId(receiptDriveUrl),
  };
}

function fileNameFromDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8) return decodeURIComponent(utf8);
  const quoted = header.match(/filename="([^"]+)"/i)?.[1];
  return quoted || fallback;
}

async function downloadPublicDriveImage(fileId: string): Promise<DownloadedFile> {
  const response = await fetch(
    `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`,
    { redirect: 'follow', cache: 'no-store' }
  );
  if (!response.ok) {
    throw new PermanentWorkflowError(
      `No se pudo descargar la imagen del recibo (${response.status})`
    );
  }

  const mimeType = response.headers.get('content-type')?.split(';')[0].trim() || '';
  if (!['image/jpeg', 'image/png'].includes(mimeType)) {
    throw new PermanentWorkflowError(
      `El encabezado de la plantilla requiere JPG o PNG; se recibió ${mimeType || 'sin tipo'}`
    );
  }

  const announcedSize = Number(response.headers.get('content-length') || 0);
  if (announcedSize > MAX_MEDIA_BYTES) {
    throw new PermanentWorkflowError('La imagen del recibo excede 16 MB');
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_MEDIA_BYTES) {
    throw new PermanentWorkflowError('La imagen del recibo excede 16 MB');
  }

  const fallback = mimeType === 'image/png' ? 'recibo.png' : 'recibo.jpg';
  return {
    bytes,
    fileName: fileNameFromDisposition(
      response.headers.get('content-disposition'),
      fallback
    ),
    mimeType,
  };
}

function getFirestoreOrThrow() {
  const db = getAdminFirestore();
  if (!db) {
    throw new Error('Firestore Admin no está disponible para controlar duplicados');
  }
  return db;
}

async function reserveSend(
  request: InvoiceRequest
): Promise<{ key: string; duplicate: boolean; messageId?: string }> {
  const key = getInvoiceRequestIdempotencyKey(request, templateName());
  const db = getFirestoreOrThrow();
  const ref = db.collection(IDEMPOTENCY_COLLECTION).doc(key);

  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists) {
      const data = existing.data();
      return {
        key,
        duplicate: true,
        messageId:
          typeof data?.messageId === 'string' && data.messageId.startsWith('wamid.')
            ? data.messageId
            : undefined,
      };
    }

    transaction.create(ref, {
      state: 'reserved',
      boardId: request.boardId,
      itemId: request.itemId,
      phoneHash: hashTraceValue(request.phone),
      templateName: templateName(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { key, duplicate: false };
  });
}

async function updateReservation(
  key: string,
  values: Record<string, unknown>
): Promise<void> {
  const db = getFirestoreOrThrow();
  await db.collection(IDEMPOTENCY_COLLECTION).doc(key).set(
    {
      ...values,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function markPreparing(itemId: string, key: string): Promise<void> {
  await updateMondayItem(itemId, {
    [FMG_MONDAY_COLUMNS.whatsAppMessageId]: `processing:${key}`,
    [FMG_MONDAY_COLUMNS.whatsAppState]: { label: 'Preparando' },
  });
}

async function markSendSuccess(
  itemId: string,
  key: string,
  messageId: string
): Promise<void> {
  // Firestore es la trazabilidad autoritativa y se actualiza antes que Monday.
  await updateReservation(key, { state: 'sent', messageId, sentAt: FieldValue.serverTimestamp() });

  // Una falla de espejo en Monday no debe convertir en error un mensaje que
  // Meta ya aceptó ni habilitar un segundo intento.
  const traceResults = await Promise.allSettled([
    updateMondayItem(itemId, {
      [FMG_MONDAY_COLUMNS.whatsAppMessageId]: messageId,
      [FMG_MONDAY_COLUMNS.whatsAppState]: { label: 'Enviado' },
    }),
    createMondayUpdate(
      itemId,
      `<b>Solicitud de factura enviada por WhatsApp</b><br>ID: ${messageId}`
    ),
  ]);

  if (traceResults.some((result) => result.status === 'rejected')) {
    console.error('[FMG WhatsApp] Meta aceptó el mensaje, pero Monday quedó parcialmente actualizado', {
      itemId,
      messageId,
    });
  }
}

async function markSendFailure(
  itemId: string,
  key: string,
  message: string
): Promise<void> {
  const detail = message.slice(0, 500);
  await Promise.allSettled([
    updateReservation(key, { state: 'failed_or_unknown', error: detail }),
    updateMondayItem(itemId, {
      [FMG_MONDAY_COLUMNS.whatsAppMessageId]: `blocked:${key}`,
      [FMG_MONDAY_COLUMNS.whatsAppState]: { label: 'Error' },
    }),
    createMondayUpdate(
      itemId,
      `<b>Error enviando solicitud por WhatsApp; reintento automático bloqueado</b><br>${detail}`
    ),
  ]);
}

async function uploadReceiptToMeta(file: DownloadedFile): Promise<string> {
  const phoneNumberId =
    cleanEnv(process.env.WHATSAPP_PHONE_NUMBER_ID) || DEFAULT_PHONE_NUMBER_ID;
  const form = new FormData();
  form.set('messaging_product', 'whatsapp');
  form.set('type', file.mimeType);
  form.set(
    'file',
    new Blob([Uint8Array.from(file.bytes)], { type: file.mimeType }),
    file.fileName
  );

  const response = await fetch(
    `https://graph.facebook.com/${graphApiVersion()}/${phoneNumberId}/media`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${whatsAppToken()}` },
      body: form,
      cache: 'no-store',
    }
  );

  const payload = (await response.json()) as { id?: string; error?: { message?: string } };
  if (!response.ok || !payload.id) {
    throw new Error(`Meta media: ${payload.error?.message || response.statusText}`);
  }

  return payload.id;
}

async function sendTemplate(request: InvoiceRequest, mediaId: string): Promise<string> {
  const phoneNumberId =
    cleanEnv(process.env.WHATSAPP_PHONE_NUMBER_ID) || DEFAULT_PHONE_NUMBER_ID;
  const language =
    cleanEnv(process.env.WHATSAPP_TEMPLATE_LANGUAGE) || DEFAULT_TEMPLATE_LANGUAGE;

  const response = await fetch(
    `https://graph.facebook.com/${graphApiVersion()}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${whatsAppToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        buildWhatsAppTemplatePayload(request, mediaId, templateName(), language)
      ),
      cache: 'no-store',
    }
  );

  const payload = (await response.json()) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  };
  const messageId = payload.messages?.[0]?.id;
  if (!response.ok || !messageId) {
    throw new Error(`Meta mensaje: ${payload.error?.message || response.statusText}`);
  }

  return messageId;
}

export async function validateInvoiceRequest(itemId: string): Promise<InvoiceRequestDryRun> {
  const { request, receipt } = await runInvoiceRequestValidation(itemId, {
    loadRequest: loadInvoiceRequest,
    downloadReceipt: downloadPublicDriveImage,
  });
  const selectedTemplate = templateName();

  return {
    status: 'validated',
    itemId: request.itemId,
    merchant: request.merchant,
    phone: request.phone,
    purchaseDate: request.purchaseDate,
    total: request.total,
    templateName: selectedTemplate,
    templateLanguage:
      cleanEnv(process.env.WHATSAPP_TEMPLATE_LANGUAGE) || DEFAULT_TEMPLATE_LANGUAGE,
    receipt: {
      fileName: receipt.fileName,
      mimeType: receipt.mimeType,
      bytes: receipt.bytes.byteLength,
    },
    idempotencyKey: getInvoiceRequestIdempotencyKey(request, selectedTemplate),
  };
}

export async function sendInvoiceRequest(
  itemId: string
): Promise<SendInvoiceRequestResult> {
  return runInvoiceRequestWorkflow(itemId, {
    loadRequest: loadInvoiceRequest,
    reserve: reserveSend,
    markPreparing,
    downloadReceipt: downloadPublicDriveImage,
    uploadReceipt: uploadReceiptToMeta,
    sendTemplate,
    markSent: markSendSuccess,
    markFailure: markSendFailure,
  });
}

export function isPermanentWorkflowError(error: unknown): boolean {
  return error instanceof PermanentWorkflowError;
}
