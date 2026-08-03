import { timingSafeEqual } from 'node:crypto';
import {
  isPermanentWorkflowError,
  sendInvoiceRequest,
  validateInvoiceRequest,
} from '@/lib/integrations/fmg-whatsapp';
import {
  canSendInvoiceRequest,
  type MondayWhatsAppEvent,
} from '@/lib/integrations/fmg-whatsapp-core';
import { resolveInvoiceRequestTenant } from '@/lib/integrations/fmg-whatsapp-tenant';
import {
  isTenantMondayTrigger,
  type InvoiceRequestTenant,
} from '@/lib/integrations/fmg-whatsapp-tenant-core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type MondayWebhookPayload = {
  challenge?: string;
  event?: MondayWhatsAppEvent;
};

function hasValidSecret(request: Request): boolean {
  const configuredRaw =
    process.env.MONDAY_WHATSAPP_WEBHOOK_SECRET || process.env.FMG_AUTOMATION_SECRET;
  const configured = configuredRaw?.trim().replace(/^["']|["']$/g, '');
  if (!configured) return false;

  const url = new URL(request.url);
  const received = (
    request.headers.get('x-fmg-webhook-secret') ||
    url.searchParams.get('secret') ||
    ''
  )
    .trim()
    .replace(/^["']|["']$/g, '');

  const expectedBuffer = Buffer.from(configured);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!hasValidSecret(request)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  let payload: MondayWebhookPayload;
  try {
    payload = (await request.json()) as MondayWebhookPayload;
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (payload.challenge) {
    return Response.json({ challenge: payload.challenge });
  }

  const event = payload.event;
  if (!event?.pulseId || !event.boardId) {
    return Response.json({ accepted: false, reason: 'Evento de Monday incompleto' });
  }
  const boardId = String(event.boardId);
  const itemId = String(event.pulseId);
  const triggerUuid = event.triggerUuid || null;
  let tenant: InvoiceRequestTenant;
  try {
    tenant = await resolveInvoiceRequestTenant(boardId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tablero no autorizado';
    return Response.json({ accepted: false, reason: message }, { status: 422 });
  }

  if (!isTenantMondayTrigger(event, tenant)) {
    return Response.json({ accepted: false, reason: 'Evento fuera del disparador FMG' });
  }

  try {
    if (request.headers.get('x-fmg-dry-run') === '1') {
      const validation = await validateInvoiceRequest(boardId, itemId);
      return Response.json({
        accepted: true,
        dryRun: true,
        validation,
      });
    }

    if (
      !canSendInvoiceRequest(
        process.env.FMG_WHATSAPP_SEND_MODE,
        itemId,
        process.env.FMG_WHATSAPP_TEST_ITEM_ID
      )
    ) {
      return Response.json(
        {
          accepted: false,
          reason: 'Envío real deshabilitado para este elemento',
        },
        { status: 503 }
      );
    }

    const result = await sendInvoiceRequest(boardId, itemId);
    console.info('[FMG WhatsApp] Evento de Monday procesado', {
      companyId: tenant.companyId,
      boardId,
      itemId,
      triggerUuid,
      status: result.status,
      messageId: result.messageId || null,
    });

    return Response.json({
      accepted: true,
      status: result.status,
      messageId: result.messageId || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[FMG WhatsApp] Error enviando solicitud', {
      itemId,
      triggerUuid,
      error: message,
    });

    if (isPermanentWorkflowError(error)) {
      return Response.json({ accepted: false, error: message }, { status: 422 });
    }

    return Response.json({ accepted: false, error: 'Error temporal de integración' }, { status: 500 });
  }
}
