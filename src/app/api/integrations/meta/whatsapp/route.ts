import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  associateInboundWhatsAppDocument,
  isPermanentWorkflowError,
  recordWhatsAppDeliveryStatus,
  type InboundWhatsAppDocument,
  type WhatsAppDeliveryStatus,
} from '@/lib/integrations/fmg-whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type MetaStatus = {
  id?: string;
  status?: string;
  errors?: Array<{ code?: number; title?: string; message?: string }>;
};

type MetaDocument = {
  id?: string;
  filename?: string;
  mime_type?: string;
};

type MetaMessage = {
  id?: string;
  from?: string;
  type?: string;
  context?: { id?: string };
  document?: MetaDocument;
};

type MetaWebhookPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: {
        statuses?: MetaStatus[];
        messages?: MetaMessage[];
      };
    }>;
  }>;
};

function webhookVerifyToken(): string | undefined {
  return process.env.WHATSAPP_VERIFY_TOKEN
    ?.trim()
    .replace(/^["']|["']$/g, '');
}

function isValidMetaSignature(rawBody: string, signature: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET
    ?.trim()
    .replace(/^["']|["']$/g, '');
  if (!appSecret || !signature?.startsWith('sha256=')) return false;

  const received = signature.slice('sha256='.length);
  const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function deliveryDetail(status: MetaStatus): string | undefined {
  if (!status.errors?.length) return undefined;
  return status.errors
    .map((error) => [error.code, error.title, error.message].filter(Boolean).join(' · '))
    .join(' | ');
}

function toDeliveryStatus(value?: string): WhatsAppDeliveryStatus | null {
  if (value === 'sent' || value === 'delivered' || value === 'read' || value === 'failed') {
    return value;
  }
  return null;
}

function toInboundDocument(message: MetaMessage): InboundWhatsAppDocument | null {
  if (
    message.type !== 'document' ||
    !message.id ||
    !message.from ||
    !message.context?.id ||
    !message.document?.id
  ) {
    return null;
  }

  return {
    messageId: message.id,
    from: message.from,
    contextMessageId: message.context.id,
    mediaId: message.document.id,
    fileName: message.document.filename,
    mimeType: message.document.mime_type,
  };
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (
    mode === 'subscribe' &&
    token &&
    token === webhookVerifyToken() &&
    challenge
  ) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new Response('Verificación rechazada', { status: 403 });
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  if (!isValidMetaSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    return Response.json({ error: 'Firma de Meta inválida' }, { status: 401 });
  }

  let payload: MetaWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload;
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (payload.object !== 'whatsapp_business_account') {
    return Response.json({ accepted: false, reason: 'Objeto no soportado' });
  }

  const statuses: MetaStatus[] = [];
  const documents: InboundWhatsAppDocument[] = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'messages') continue;
      statuses.push(...(change.value?.statuses || []));
      for (const message of change.value?.messages || []) {
        const document = toInboundDocument(message);
        if (document) documents.push(document);
      }
    }
  }

  try {
    const statusResults = [];
    for (const status of statuses) {
      const normalized = toDeliveryStatus(status.status);
      if (!status.id || !normalized) continue;
      statusResults.push(
        await recordWhatsAppDeliveryStatus(
          status.id,
          normalized,
          deliveryDetail(status)
        )
      );
    }

    const documentResults = [];
    for (const document of documents) {
      documentResults.push(await associateInboundWhatsAppDocument(document));
    }

    return Response.json({
      accepted: true,
      statusesProcessed: statusResults.filter(Boolean).length,
      documentsProcessed: documentResults.filter((result) => result.associated).length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[FMG WhatsApp] Error procesando webhook de Meta', { error: message });

    if (isPermanentWorkflowError(error)) {
      // Meta no debe reintentar documentos inválidos de manera indefinida.
      return Response.json({ accepted: false, error: message }, { status: 200 });
    }

    return Response.json(
      { accepted: false, error: 'Error temporal de integración' },
      { status: 500 }
    );
  }
}
