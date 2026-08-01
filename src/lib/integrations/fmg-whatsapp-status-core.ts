import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export type WhatsAppDeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type WhatsAppStatusEvent = {
  messageId: string;
  status: WhatsAppDeliveryStatus;
  timestamp: number;
  recipientId?: string;
  detail?: string;
};

export type WhatsAppInboundMessage = {
  messageId: string;
  from: string;
  timestamp: number;
  type: string;
  content: string;
  contactName?: string;
  contextMessageId?: string;
};

type MetaError = {
  code?: number;
  title?: string;
  message?: string;
  error_data?: { details?: string };
};

type MetaStatus = {
  id?: string;
  status?: string;
  timestamp?: string;
  recipient_id?: string;
  errors?: MetaError[];
};

type MetaMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  context?: { id?: string };
  text?: { body?: string };
  image?: { caption?: string };
  document?: { filename?: string; caption?: string };
  video?: { caption?: string };
  location?: { name?: string; address?: string };
  reaction?: { emoji?: string };
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
};

type MetaWebhookPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string };
        statuses?: MetaStatus[];
        contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
        messages?: MetaMessage[];
      };
    }>;
  }>;
};

const STATUS_LABELS: Record<WhatsAppDeliveryStatus, string> = {
  sent: 'Enviado',
  delivered: 'Entregado',
  read: 'Leído',
  failed: 'Fallido',
};

const STATUS_RANK: Record<WhatsAppDeliveryStatus, number> = {
  sent: 1,
  delivered: 2,
  read: 3,
  failed: 4,
};

function isDeliveryStatus(value: string | undefined): value is WhatsAppDeliveryStatus {
  return value === 'sent' || value === 'delivered' || value === 'read' || value === 'failed';
}

function inboundContent(message: MetaMessage): string {
  if (!message || typeof message !== 'object') return '[Mensaje no compatible]';
  if (message.type === 'text') return message.text?.body?.trim() || '[Mensaje de texto vacío]';
  if (message.type === 'image') {
    return message.image?.caption?.trim() || '[Imagen recibida]';
  }
  if (message.type === 'document') {
    const name = message.document?.filename?.trim();
    const caption = message.document?.caption?.trim();
    return [`[Documento recibido${name ? `: ${name}` : ''}]`, caption].filter(Boolean).join(' ');
  }
  if (message.type === 'video') return message.video?.caption?.trim() || '[Video recibido]';
  if (message.type === 'audio') return '[Audio recibido]';
  if (message.type === 'sticker') return '[Sticker recibido]';
  if (message.type === 'location') {
    return ['[Ubicación recibida]', message.location?.name, message.location?.address]
      .filter(Boolean)
      .join(' · ');
  }
  if (message.type === 'contacts') return '[Contacto recibido]';
  if (message.type === 'reaction') return `[Reacción: ${message.reaction?.emoji || 'sin emoji'}]`;
  if (message.type === 'button') return message.button?.text?.trim() || '[Botón seleccionado]';
  if (message.type === 'interactive') {
    return (
      message.interactive?.button_reply?.title?.trim() ||
      message.interactive?.list_reply?.title?.trim() ||
      '[Respuesta interactiva]'
    );
  }
  return `[Mensaje ${message.type || 'no compatible'} recibido]`;
}

export function extractWhatsAppInboundMessages(
  payload: unknown,
  expectedPhoneNumberId?: string
): WhatsAppInboundMessage[] {
  const body = payload as MetaWebhookPayload;
  if (body?.object !== 'whatsapp_business_account') return [];

  const messages: WhatsAppInboundMessage[] = [];
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'messages') continue;
      const value = change.value;
      if (expectedPhoneNumberId && value?.metadata?.phone_number_id !== expectedPhoneNumberId) {
        continue;
      }

      const names = new Map(
        (value?.contacts || [])
          .filter((contact) => contact.wa_id)
          .map((contact) => [contact.wa_id!, contact.profile?.name?.trim()])
      );

      for (const message of value?.messages || []) {
        if (!message.id || !message.from || !message.timestamp || !/^\d+$/.test(message.timestamp)) {
          continue;
        }
        const timestamp = Number(message.timestamp);
        if (!Number.isSafeInteger(timestamp) || timestamp <= 0) continue;

        messages.push({
          messageId: message.id,
          from: message.from,
          timestamp,
          type: message.type || 'unknown',
          content: inboundContent(message).slice(0, 4000),
          contactName: names.get(message.from) || undefined,
          contextMessageId: message.context?.id,
        });
      }
    }
  }
  return messages;
}

export function getWhatsAppInboundEventKey(messageId: string): string {
  return createHash('sha256').update(messageId).digest('hex');
}

function deliveryDetail(errors: MetaError[] | undefined): string | undefined {
  if (!errors?.length) return undefined;

  const detail = errors
    .map((error) =>
      [error.code, error.title, error.message, error.error_data?.details]
        .filter((value) => value !== undefined && value !== null && String(value).trim())
        .join(' · ')
    )
    .filter(Boolean)
    .join(' | ')
    .slice(0, 500);

  return detail || undefined;
}

export function verifyMetaWebhookSignature(
  rawBody: string,
  signature: string | null,
  appSecret: string | undefined
): boolean {
  const secret = appSecret?.trim().replace(/^["']|["']$/g, '');
  if (!secret || !signature?.startsWith('sha256=')) return false;

  const received = signature.slice('sha256='.length);
  if (!/^[a-f0-9]{64}$/i.test(received)) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const receivedBuffer = Buffer.from(received, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function extractWhatsAppStatusEvents(
  payload: unknown,
  expectedPhoneNumberId?: string
): WhatsAppStatusEvent[] {
  const body = payload as MetaWebhookPayload;
  if (body?.object !== 'whatsapp_business_account') return [];

  const events: WhatsAppStatusEvent[] = [];
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'messages') continue;

      const phoneNumberId = change.value?.metadata?.phone_number_id;
      if (expectedPhoneNumberId && phoneNumberId !== expectedPhoneNumberId) continue;

      for (const status of change.value?.statuses || []) {
        if (!status.id || !isDeliveryStatus(status.status)) continue;
        if (!status.timestamp || !/^\d+$/.test(status.timestamp)) continue;

        const timestamp = Number(status.timestamp);
        if (!Number.isSafeInteger(timestamp) || timestamp <= 0) continue;

        events.push({
          messageId: status.id,
          status: status.status,
          timestamp,
          recipientId: status.recipient_id,
          detail: deliveryDetail(status.errors),
        });
      }
    }
  }

  return events;
}

export function getWhatsAppStatusLabel(status: WhatsAppDeliveryStatus): string {
  return STATUS_LABELS[status];
}

export function getWhatsAppStatusEventKey(event: WhatsAppStatusEvent): string {
  return createHash('sha256')
    .update([event.messageId, event.status, event.timestamp].join(':'))
    .digest('hex');
}

export function shouldApplyWhatsAppStatus(
  currentStatus: WhatsAppDeliveryStatus | undefined,
  currentTimestamp: number | undefined,
  incoming: WhatsAppStatusEvent
): boolean {
  if (!currentStatus || !currentTimestamp) return true;
  if (incoming.timestamp > currentTimestamp) return true;
  if (incoming.timestamp < currentTimestamp) return false;
  return STATUS_RANK[incoming.status] > STATUS_RANK[currentStatus];
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}
