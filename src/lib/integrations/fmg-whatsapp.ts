import { createHash } from 'node:crypto';

const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_FILE_API_URL = 'https://api.monday.com/v2/file';
const DEFAULT_BOARD_ID = '8964055261';
const DEFAULT_TEMPLATE_NAME = 'solicitud_factura_jorge_recibo';
const DEFAULT_TEMPLATE_LANGUAGE = 'es_MX';
const DEFAULT_PHONE_NUMBER_ID = '1006728382529440';
const DEFAULT_GRAPH_API_VERSION = 'v23.0';
const MAX_MEDIA_BYTES = 16 * 1024 * 1024;

export const FMG_MONDAY_COLUMNS = {
  method: 'proyecto',
  phone: 'phone_mm10z3aw',
  purchaseDate: 'text_mkthrxct',
  total: 'n_meros',
  receiptDriveUrl: 'enlace4',
  whatsAppMessageId: 'text_mm5q5vg6',
  whatsAppState: 'color_mm5qc2dz',
} as const;

export const FMG_MONDAY_SUBITEM_COLUMNS = {
  file: 'archivo',
  state: 'estado',
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
  subitems?: Array<{ id: string; name: string }>;
};

type MondayApiPayload<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

export type InvoiceRequest = {
  boardId: string;
  itemId: string;
  merchant: string;
  phone: string;
  purchaseDate: string;
  total: string;
  receiptDriveFileId: string;
};

export type SendInvoiceRequestResult =
  | { status: 'sent'; messageId: string; idempotencyKey: string }
  | { status: 'duplicate'; messageId?: string; idempotencyKey: string };

export type WhatsAppDeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type InboundWhatsAppDocument = {
  messageId: string;
  contextMessageId: string;
  from: string;
  mediaId: string;
  fileName?: string;
  mimeType?: string;
};

type DownloadedFile = {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
};

class PermanentWorkflowError extends Error {
  readonly permanent = true;
}

function cleanEnv(value: string | undefined): string | undefined {
  return value?.trim().replace(/^["']|["']$/g, '');
}

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

function whatsAppToken(): string {
  return requiredEnv('WHATSAPP_CLOUD_ACCESS_TOKEN', 'WHATSAPP_SYSTEM_USER_TOKEN');
}

function getColumn(item: MondayItem, columnId: string): MondayColumnValue | undefined {
  return item.column_values.find((column) => column.id === columnId);
}

export function normalizeWhatsAppPhone(rawPhone: string): string {
  let digits = rawPhone.replace(/\D/g, '');

  if (digits.startsWith('00')) digits = digits.slice(2);

  // Formato histórico de WhatsApp México: 521 + 10 dígitos.
  if (digits.length === 13 && digits.startsWith('521')) {
    digits = `52${digits.slice(3)}`;
  }

  if (digits.length === 10) digits = `52${digits}`;

  if (!/^\d{11,15}$/.test(digits)) {
    throw new PermanentWorkflowError(
      'El número de Whatsapp no tiene un formato internacional válido'
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

  // El flujo OCR actual también puede guardar directamente el ID de Drive.
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
          subitems { id name }
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

export async function loadInvoiceRequest(
  itemId: string
): Promise<{ request: InvoiceRequest; item: MondayItem }> {
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
    throw new PermanentWorkflowError('El método del recibo ya no es Whatsapp');
  }

  const phone = getColumn(item, FMG_MONDAY_COLUMNS.phone)?.text;
  const purchaseDate = getColumn(item, FMG_MONDAY_COLUMNS.purchaseDate)?.text;
  const total = getColumn(item, FMG_MONDAY_COLUMNS.total)?.text;
  const receiptDriveUrl = getColumn(item, FMG_MONDAY_COLUMNS.receiptDriveUrl)?.text;

  if (!phone) throw new PermanentWorkflowError('El recibo no tiene teléfono de Whatsapp');
  if (!purchaseDate) throw new PermanentWorkflowError('El recibo no tiene fecha de compra');
  if (!total) throw new PermanentWorkflowError('El recibo no tiene total');
  if (!receiptDriveUrl) {
    throw new PermanentWorkflowError('El recibo no tiene imagen en Google Drive');
  }

  return {
    request: {
      boardId: item.board.id,
      itemId: item.id,
      merchant: item.name,
      phone: normalizeWhatsAppPhone(phone),
      purchaseDate,
      total: formatInvoiceTotal(total),
      receiptDriveFileId: extractDriveFileId(receiptDriveUrl),
    },
    item,
  };
}

function getIdempotencyKey(request: InvoiceRequest): string {
  return createHash('sha256')
    .update(
      [
        request.boardId,
        request.itemId,
        request.phone,
        request.purchaseDate,
        request.total,
        request.receiptDriveFileId,
        process.env.WHATSAPP_TEMPLATE_NAME || DEFAULT_TEMPLATE_NAME,
      ].join(':')
    )
    .digest('hex');
}

async function reserveSend(
  request: InvoiceRequest,
  item: MondayItem
): Promise<{ key: string; duplicate: boolean; messageId?: string }> {
  const key = getIdempotencyKey(request);
  const currentId = getColumn(item, FMG_MONDAY_COLUMNS.whatsAppMessageId)?.text?.trim();
  const currentState = getColumn(item, FMG_MONDAY_COLUMNS.whatsAppState)?.text
    ?.trim()
    .toLowerCase();

  if (currentId && currentState !== 'error') {
    return {
      key,
      duplicate: true,
      messageId: currentId.startsWith('wamid.') ? currentId : undefined,
    };
  }

  await updateMondayItem(request.itemId, {
    [FMG_MONDAY_COLUMNS.whatsAppMessageId]: `processing:${key}`,
    [FMG_MONDAY_COLUMNS.whatsAppState]: { label: 'Preparando' },
  });

  return { key, duplicate: false };
}

async function markSendSuccess(itemId: string, messageId: string): Promise<void> {
  await updateMondayItem(itemId, {
    [FMG_MONDAY_COLUMNS.whatsAppMessageId]: messageId,
    [FMG_MONDAY_COLUMNS.whatsAppState]: { label: 'Enviado' },
  });
  await createMondayUpdate(
    itemId,
    `<b>Solicitud de factura enviada por WhatsApp</b><br>ID: ${messageId}`
  );
}

async function markSendFailure(itemId: string, message: string): Promise<void> {
  await updateMondayItem(itemId, {
    [FMG_MONDAY_COLUMNS.whatsAppMessageId]: '',
    [FMG_MONDAY_COLUMNS.whatsAppState]: { label: 'Error' },
  });
  await createMondayUpdate(
    itemId,
    `<b>Error enviando solicitud por WhatsApp</b><br>${message.slice(0, 500)}`
  );
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

async function uploadReceiptToMeta(file: DownloadedFile): Promise<string> {
  const phoneNumberId =
    cleanEnv(process.env.WHATSAPP_PHONE_NUMBER_ID) || DEFAULT_PHONE_NUMBER_ID;
  const form = new FormData();
  form.set('messaging_product', 'whatsapp');
  form.set('type', file.mimeType);
  const blobBytes = Uint8Array.from(file.bytes);
  form.set('file', new Blob([blobBytes], { type: file.mimeType }), file.fileName);

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
  const templateName =
    cleanEnv(process.env.WHATSAPP_TEMPLATE_NAME) || DEFAULT_TEMPLATE_NAME;
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
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: request.phone,
        type: 'template',
        template: {
          name: templateName,
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
      }),
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

export async function sendInvoiceRequest(
  itemId: string
): Promise<SendInvoiceRequestResult> {
  const { request, item } = await loadInvoiceRequest(itemId);
  const reservation = await reserveSend(request, item);

  if (reservation.duplicate) {
    return {
      status: 'duplicate',
      messageId: reservation.messageId,
      idempotencyKey: reservation.key,
    };
  }

  try {
    const receipt = await downloadPublicDriveImage(request.receiptDriveFileId);
    const mediaId = await uploadReceiptToMeta(receipt);
    const messageId = await sendTemplate(request, mediaId);
    await markSendSuccess(request.itemId, messageId);
    return { status: 'sent', messageId, idempotencyKey: reservation.key };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    await markSendFailure(request.itemId, message);
    throw error;
  }
}

async function findItemByWhatsAppMessageId(messageId: string): Promise<MondayItem | null> {
  const data = await mondayRequest<{
    boards: Array<{ items_page: { items: MondayItem[] } }>;
  }>(
    `
      query FmgFindWhatsappMessage($boardId: [ID!], $messageId: CompareValue!) {
        boards(ids: $boardId) {
          items_page(
            limit: 1
            query_params: {
              rules: [{
                column_id: "${FMG_MONDAY_COLUMNS.whatsAppMessageId}"
                compare_value: $messageId
                operator: any_of
              }]
            }
          ) {
            items {
              id
              name
              board { id }
              subitems { id name }
              column_values(ids: [
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
        }
      }
    `,
    {
      boardId: [process.env.MONDAY_FMG_BOARD_ID || DEFAULT_BOARD_ID],
      messageId: [messageId],
    }
  );

  return data.boards[0]?.items_page.items[0] || null;
}

export async function recordWhatsAppDeliveryStatus(
  messageId: string,
  status: WhatsAppDeliveryStatus,
  detail?: string
): Promise<boolean> {
  const item = await findItemByWhatsAppMessageId(messageId);
  if (!item) return false;

  const labelByStatus: Record<WhatsAppDeliveryStatus, string> = {
    sent: 'Enviado',
    delivered: 'Entregado',
    read: 'Leído',
    failed: 'Error',
  };
  await updateMondayItem(item.id, {
    [FMG_MONDAY_COLUMNS.whatsAppState]: { label: labelByStatus[status] },
  });

  const safeDetail = detail ? `<br>${detail.slice(0, 500)}` : '';
  await createMondayUpdate(
    item.id,
    `<b>WhatsApp: ${labelByStatus[status]}</b><br>ID: ${messageId}${safeDetail}`
  );
  return true;
}

async function getMetaMedia(mediaId: string): Promise<DownloadedFile> {
  const metadataResponse = await fetch(
    `https://graph.facebook.com/${graphApiVersion()}/${encodeURIComponent(mediaId)}`,
    {
      headers: { Authorization: `Bearer ${whatsAppToken()}` },
      cache: 'no-store',
    }
  );
  const metadata = (await metadataResponse.json()) as {
    url?: string;
    mime_type?: string;
    file_size?: number;
    error?: { message?: string };
  };
  if (!metadataResponse.ok || !metadata.url) {
    throw new Error(
      `Meta media metadata: ${metadata.error?.message || metadataResponse.statusText}`
    );
  }
  if (metadata.file_size && metadata.file_size > MAX_MEDIA_BYTES) {
    throw new PermanentWorkflowError('El documento recibido excede 16 MB');
  }

  const fileResponse = await fetch(metadata.url, {
    headers: { Authorization: `Bearer ${whatsAppToken()}` },
    cache: 'no-store',
  });
  if (!fileResponse.ok) {
    throw new Error(`Meta media download: ${fileResponse.statusText}`);
  }

  const mimeType =
    metadata.mime_type ||
    fileResponse.headers.get('content-type')?.split(';')[0].trim() ||
    'application/octet-stream';
  const allowed = new Set(['application/pdf', 'application/xml', 'text/xml']);
  if (!allowed.has(mimeType)) {
    throw new PermanentWorkflowError(
      `Solo se aceptan PDF o XML; se recibió ${mimeType}`
    );
  }

  const bytes = new Uint8Array(await fileResponse.arrayBuffer());
  if (bytes.byteLength > MAX_MEDIA_BYTES) {
    throw new PermanentWorkflowError('El documento recibido excede 16 MB');
  }

  return {
    bytes,
    mimeType,
    fileName: mimeType === 'application/pdf' ? 'factura.pdf' : 'factura.xml',
  };
}

async function createDocumentSubitem(
  parentItemId: string,
  name: string
): Promise<{ id: string; boardId: string }> {
  const data = await mondayRequest<{
    create_subitem: { id: string; board: { id: string } };
  }>(
    `
      mutation FmgCreateWhatsappDocument(
        $parentItemId: ID!
        $itemName: String!
        $columnValues: JSON!
      ) {
        create_subitem(
          parent_item_id: $parentItemId
          item_name: $itemName
          column_values: $columnValues
        ) {
          id
          board { id }
        }
      }
    `,
    {
      parentItemId,
      itemName: name,
      columnValues: JSON.stringify({
        [FMG_MONDAY_SUBITEM_COLUMNS.state]: { label: 'Hecho' },
      }),
    }
  );

  return {
    id: data.create_subitem.id,
    boardId: data.create_subitem.board.id,
  };
}

async function uploadFileToMonday(
  itemId: string,
  file: DownloadedFile
): Promise<string> {
  const form = new FormData();
  form.set(
    'query',
    `mutation ($file: File!) {
      add_file_to_column(
        item_id: ${itemId}
        column_id: "${FMG_MONDAY_SUBITEM_COLUMNS.file}"
        file: $file
      ) {
        id
      }
    }`
  );
  form.set('map', JSON.stringify({ document: 'variables.file' }));
  const blobBytes = Uint8Array.from(file.bytes);
  form.set(
    'document',
    new Blob([blobBytes], { type: file.mimeType }),
    file.fileName
  );

  const response = await fetch(MONDAY_FILE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: requiredEnv('MONDAY_API_KEY'),
      'API-Version': process.env.MONDAY_API_VERSION || '2026-07',
    },
    body: form,
    cache: 'no-store',
  });
  const payload = (await response.json()) as MondayApiPayload<{
    add_file_to_column: { id: string };
  }>;
  const assetId = payload.data?.add_file_to_column?.id;
  if (!response.ok || payload.errors?.length || !assetId) {
    throw new Error(
      `Monday file API: ${payload.errors?.[0]?.message || response.statusText}`
    );
  }
  return assetId;
}

export async function associateInboundWhatsAppDocument(
  document: InboundWhatsAppDocument
): Promise<{ associated: boolean; duplicate?: boolean; itemId?: string }> {
  const parent = await findItemByWhatsAppMessageId(document.contextMessageId);
  if (!parent) return { associated: false };

  const marker = `[WA:${document.messageId}]`;
  if (parent.subitems?.some((subitem) => subitem.name.includes(marker))) {
    return { associated: true, duplicate: true, itemId: parent.id };
  }

  const file = await getMetaMedia(document.mediaId);
  if (document.fileName?.trim()) file.fileName = document.fileName.trim();
  if (document.mimeType && document.mimeType !== file.mimeType) {
    throw new PermanentWorkflowError('El tipo de documento no coincide con Meta');
  }

  const kind = file.mimeType === 'application/pdf' ? 'PDF' : 'XML';
  const subitem = await createDocumentSubitem(
    parent.id,
    `Factura ${kind} recibida ${marker}`
  );
  await uploadFileToMonday(subitem.id, file);
  await updateMondayItem(parent.id, {
    [FMG_MONDAY_COLUMNS.whatsAppState]: { label: 'Respondido' },
  });
  await createMondayUpdate(
    parent.id,
    `<b>Documento recibido por WhatsApp</b><br>${kind}: ${file.fileName}`
  );

  return { associated: true, itemId: parent.id };
}

export function isPermanentWorkflowError(error: unknown): boolean {
  return error instanceof PermanentWorkflowError;
}
