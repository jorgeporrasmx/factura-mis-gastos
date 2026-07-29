import { timingSafeEqual } from 'node:crypto';
import {
  isPermanentWorkflowError,
  sendInvoiceRequest,
} from '@/lib/integrations/fmg-whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type MondayWebhookPayload = {
  challenge?: string;
  event?: {
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
};

function hasValidSecret(request: Request): boolean {
  const configured =
    process.env.MONDAY_WHATSAPP_WEBHOOK_SECRET || process.env.FMG_AUTOMATION_SECRET;
  if (!configured) return false;

  const url = new URL(request.url);
  const received =
    request.headers.get('x-fmg-webhook-secret') || url.searchParams.get('secret') || '';

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
  const expectedBoardId = process.env.MONDAY_FMG_BOARD_ID || '8964055261';
  const label = event?.value?.label?.text?.trim().toLowerCase();

  if (
    !event?.pulseId ||
    String(event.boardId) !== expectedBoardId ||
    event.columnId !== 'proyecto' ||
    label !== 'whatsapp'
  ) {
    return Response.json({ accepted: false, reason: 'Evento fuera del disparador FMG' });
  }

  try {
    const result = await sendInvoiceRequest(String(event.pulseId));
    return Response.json({
      accepted: true,
      status: result.status,
      messageId: result.messageId || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[FMG WhatsApp] Error enviando solicitud', {
      itemId: String(event.pulseId),
      triggerUuid: event.triggerUuid || null,
      error: message,
    });

    if (isPermanentWorkflowError(error)) {
      return Response.json({ accepted: false, error: message }, { status: 422 });
    }

    return Response.json({ accepted: false, error: 'Error temporal de integración' }, { status: 500 });
  }
}
