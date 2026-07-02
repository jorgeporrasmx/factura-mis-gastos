import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminFirestore } from '@/lib/firebase/admin';

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

  // Comparación segura contra timing attacks.
  // timingSafeEqual lanza si las longitudes difieren: comparar longitudes primero
  // para responder 401 en vez de caer al catch (que respondería 200).
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

// ============================================
// HANDLERS DE EVENTOS
// ============================================

/**
 * Actualiza el estado de la transacción en payment_transactions y deja
 * registro del evento en la subcolección webhook_events (auditoría).
 */
async function updateTransactionFromWebhook(
  event: WebhookEvent,
  status: 'approved' | 'declined' | 'voided' | 'refunded' | 'fraud_alert' | 'chargeback'
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) {
    console.error('[webhook] Firebase Admin no configurado; evento no persistido');
    return;
  }

  const transactionId = event.orderId || event.transactionId;
  if (!transactionId) return;

  const now = new Date();
  const transactionRef = db.collection('payment_transactions').doc(transactionId);

  await transactionRef.set(
    {
      status,
      lastWebhookEvent: event.eventType,
      lastWebhookAt: now,
      updatedAt: now,
      processorResponseCode: event.processor?.responseCode ?? null,
      processorResponseMessage: event.processor?.responseMessage ?? null,
    },
    { merge: true }
  );

  await transactionRef.collection('webhook_events').add({
    eventType: event.eventType,
    transactionId: event.transactionId,
    orderId: event.orderId ?? null,
    amount: event.amount ?? null,
    processor: event.processor ?? null,
    timestamp: event.timestamp,
    receivedAt: now,
  });
}

async function handleTransactionApproved(event: WebhookEvent): Promise<void> {
  console.log('Transacción aprobada:', event.transactionId);
  await updateTransactionFromWebhook(event, 'approved');
}

async function handleTransactionDeclined(event: WebhookEvent): Promise<void> {
  console.log('Transacción rechazada:', event.transactionId);
  await updateTransactionFromWebhook(event, 'declined');
}

async function handleTransactionVoided(event: WebhookEvent): Promise<void> {
  console.log('Transacción anulada:', event.transactionId);
  await updateTransactionFromWebhook(event, 'voided');
}

async function handleTransactionRefunded(event: WebhookEvent): Promise<void> {
  console.log('Transacción reembolsada:', event.transactionId);
  await updateTransactionFromWebhook(event, 'refunded');
}

async function handleFraudAlert(event: WebhookEvent): Promise<void> {
  console.error('⚠️ Alerta de fraude:', event);
  await updateTransactionFromWebhook(event, 'fraud_alert');
}

async function handleChargeback(event: WebhookEvent): Promise<void> {
  console.error('⚠️ Contracargo recibido:', event);
  await updateTransactionFromWebhook(event, 'chargeback');
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
