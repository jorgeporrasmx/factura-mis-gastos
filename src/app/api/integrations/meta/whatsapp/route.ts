import {
  extractWhatsAppInboundMessages,
  extractWhatsAppStatusEvents,
  verifyMetaWebhookSignature,
} from '@/lib/integrations/fmg-whatsapp-status-core';
import { processWhatsAppStatuses } from '@/lib/integrations/fmg-whatsapp-status';
import { processWhatsAppInboundMessages } from '@/lib/integrations/fmg-whatsapp-inbound';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function cleanEnv(value: string | undefined): string | undefined {
  return value?.trim().replace(/^["']|["']$/g, '');
}

function verifyToken(): string | undefined {
  return cleanEnv(process.env.WHATSAPP_VERIFY_TOKEN);
}

function appSecret(): string | undefined {
  return cleanEnv(process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET);
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === verifyToken() && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new Response('Verificación rechazada', { status: 403 });
}

export async function POST(request: Request): Promise<Response> {
  const secret = appSecret();
  if (!secret) {
    console.error('[FMG WhatsApp] WHATSAPP_APP_SECRET no está configurado');
    return Response.json({ error: 'Webhook de Meta no configurado' }, { status: 503 });
  }

  const rawBody = await request.text();
  if (
    !verifyMetaWebhookSignature(
      rawBody,
      request.headers.get('x-hub-signature-256'),
      secret
    )
  ) {
    return Response.json({ error: 'Firma de Meta inválida' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const events = extractWhatsAppStatusEvents(
    payload,
    cleanEnv(process.env.WHATSAPP_PHONE_NUMBER_ID)
  );
  const inboundMessages = extractWhatsAppInboundMessages(
    payload,
    cleanEnv(process.env.WHATSAPP_PHONE_NUMBER_ID)
  );

  try {
    const results = await processWhatsAppStatuses(events);
    const summary = results.reduce(
      (counts, result) => {
        counts[result.status] += 1;
        return counts;
      },
      { updated: 0, ignored: 0, unmatched: 0 }
    );
    const inboundResults = await processWhatsAppInboundMessages(inboundMessages);
    const inboundSummary = inboundResults.reduce(
      (counts, result) => {
        counts[result.status] += 1;
        return counts;
      },
      { updated: 0, ignored: 0, unmatched: 0 }
    );

    console.info('[FMG WhatsApp] Estados de Meta procesados', {
      statusesReceived: events.length,
      statusSummary: summary,
      messagesReceived: inboundMessages.length,
      inboundSummary,
    });
    return Response.json({
      accepted: true,
      statusesReceived: events.length,
      statusSummary: summary,
      messagesReceived: inboundMessages.length,
      inboundSummary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[FMG WhatsApp] Error procesando estados de Meta', { error: message });
    return Response.json(
      { accepted: false, error: 'Error temporal de integración' },
      { status: 500 }
    );
  }
}
