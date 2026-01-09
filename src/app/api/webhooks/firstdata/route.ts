import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/webhooks/firstdata
 *
 * Recibe webhooks/notificaciones de First Data
 *
 * First Data puede enviar notificaciones para:
 * - Transacciones completadas
 * - Transacciones rechazadas
 * - Cambios de estado
 * - Alertas de fraude
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-firstdata-signature');

    // Verificar firma del webhook
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body) as WebhookEvent;

    console.log('Webhook recibido de First Data:', {
      type: event.eventType,
      transactionId: event.transactionId,
      timestamp: new Date().toISOString(),
    });

    // Procesar el evento según su tipo
    switch (event.eventType) {
      case 'TRANSACTION_APPROVED':
        await handleTransactionApproved(event);
        break;

      case 'TRANSACTION_DECLINED':
        await handleTransactionDeclined(event);
        break;

      case 'TRANSACTION_VOIDED':
        await handleTransactionVoided(event);
        break;

      case 'TRANSACTION_REFUNDED':
        await handleTransactionRefunded(event);
        break;

      case 'FRAUD_ALERT':
        await handleFraudAlert(event);
        break;

      case 'CHARGEBACK':
        await handleChargeback(event);
        break;

      default:
        console.log('Evento de webhook no manejado:', event.eventType);
    }

    // Responder inmediatamente para confirmar recepción
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook:', error);

    // Aún así responder 200 para evitar reintentos innecesarios
    // pero registrar el error para investigación
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}

/**
 * Verifica la firma HMAC del webhook
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) {
    // En desarrollo, permitir webhooks sin firma
    if (process.env.NODE_ENV === 'development') {
      console.warn('Webhook sin firma permitido en desarrollo');
      return true;
    }
    return false;
  }

  const webhookSecret = process.env.FIRSTDATA_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('FIRSTDATA_WEBHOOK_SECRET no configurado');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  // Comparación segura contra timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ============================================
// HANDLERS DE EVENTOS
// ============================================

async function handleTransactionApproved(event: WebhookEvent): Promise<void> {
  console.log('Transacción aprobada:', event.transactionId);

  // TODO: Implementar lógica de negocio
  // 1. Actualizar estado de transacción en BD
  // 2. Activar suscripción si es pago inicial
  // 3. Enviar email de confirmación al cliente
  // 4. Actualizar Monday.com
}

async function handleTransactionDeclined(event: WebhookEvent): Promise<void> {
  console.log('Transacción rechazada:', event.transactionId);

  // TODO: Implementar lógica de negocio
  // 1. Actualizar estado de transacción en BD
  // 2. Notificar al cliente
  // 3. Si es pago recurrente, marcar suscripción como "past_due"
}

async function handleTransactionVoided(event: WebhookEvent): Promise<void> {
  console.log('Transacción anulada:', event.transactionId);

  // TODO: Implementar lógica de negocio
  // 1. Actualizar estado de transacción en BD
  // 2. Si aplica, cancelar suscripción
}

async function handleTransactionRefunded(event: WebhookEvent): Promise<void> {
  console.log('Transacción reembolsada:', event.transactionId);

  // TODO: Implementar lógica de negocio
  // 1. Actualizar estado de transacción en BD
  // 2. Notificar al cliente
}

async function handleFraudAlert(event: WebhookEvent): Promise<void> {
  console.error('⚠️ Alerta de fraude:', event);

  // TODO: Implementar lógica de negocio
  // 1. Registrar alerta
  // 2. Notificar al equipo de seguridad
  // 3. Considerar bloquear cliente/tarjeta
}

async function handleChargeback(event: WebhookEvent): Promise<void> {
  console.error('⚠️ Contracargo recibido:', event);

  // TODO: Implementar lógica de negocio
  // 1. Registrar contracargo
  // 2. Notificar al equipo
  // 3. Preparar documentación para disputa
}

// ============================================
// TIPOS
// ============================================

interface WebhookEvent {
  eventType: WebhookEventType;
  transactionId: string;
  orderId?: string;
  merchantId: string;
  amount?: {
    total: number;
    currency: string;
  };
  paymentMethod?: {
    type: string;
    last4: string;
  };
  timestamp: string;
  processor?: {
    responseCode: string;
    responseMessage: string;
  };
  metadata?: Record<string, unknown>;
}

type WebhookEventType =
  | 'TRANSACTION_APPROVED'
  | 'TRANSACTION_DECLINED'
  | 'TRANSACTION_VOIDED'
  | 'TRANSACTION_REFUNDED'
  | 'FRAUD_ALERT'
  | 'CHARGEBACK'
  | 'SETTLEMENT_COMPLETED';
