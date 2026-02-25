import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getTransactionByFirstDataId,
  getTransactionByOrderId,
  updateTransactionStatus,
  getSubscription,
  updateSubscriptionStatus,
} from '@/lib/firebase/payments-admin';

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
// HELPERS
// ============================================

/**
 * Busca la transacción en nuestra BD usando el ID de First Data o el orderId
 */
async function findTransaction(event: WebhookEvent) {
  // Primero intentar por First Data transaction ID
  let transaction = await getTransactionByFirstDataId(event.transactionId);
  if (transaction) return transaction;

  // Luego intentar por orderId (nuestro ID interno)
  if (event.orderId) {
    transaction = await getTransactionByOrderId(event.orderId);
    if (transaction) return transaction;
  }

  return null;
}

// ============================================
// HANDLERS DE EVENTOS
// ============================================

async function handleTransactionApproved(event: WebhookEvent): Promise<void> {
  console.log('Transacción aprobada:', event.transactionId);

  const transaction = await findTransaction(event);
  if (!transaction) {
    console.warn('Transacción no encontrada en BD para webhook approved:', event.transactionId);
    return;
  }

  // Actualizar estado de transacción
  await updateTransactionStatus(transaction.id, 'approved', {
    firstDataTransactionId: event.transactionId,
    firstDataResponseCode: event.processor?.responseCode,
    firstDataResponseMessage: event.processor?.responseMessage,
  });

  // Si tiene suscripción asociada, asegurar que esté activa
  if (transaction.subscriptionId) {
    const subscription = await getSubscription(transaction.subscriptionId);
    if (subscription && subscription.status !== 'active') {
      await updateSubscriptionStatus(transaction.subscriptionId, 'active');
    }
  }
}

async function handleTransactionDeclined(event: WebhookEvent): Promise<void> {
  console.log('Transacción rechazada:', event.transactionId);

  const transaction = await findTransaction(event);
  if (!transaction) {
    console.warn('Transacción no encontrada en BD para webhook declined:', event.transactionId);
    return;
  }

  // Actualizar estado de transacción
  await updateTransactionStatus(transaction.id, 'declined', {
    firstDataResponseCode: event.processor?.responseCode,
    firstDataResponseMessage: event.processor?.responseMessage,
  });

  // Si es pago recurrente, marcar suscripción como past_due
  if (transaction.subscriptionId) {
    const subscription = await getSubscription(transaction.subscriptionId);
    if (subscription && subscription.status === 'active') {
      await updateSubscriptionStatus(transaction.subscriptionId, 'past_due');
    }
  }
}

async function handleTransactionVoided(event: WebhookEvent): Promise<void> {
  console.log('Transacción anulada:', event.transactionId);

  const transaction = await findTransaction(event);
  if (!transaction) {
    console.warn('Transacción no encontrada en BD para webhook voided:', event.transactionId);
    return;
  }

  await updateTransactionStatus(transaction.id, 'voided', {
    firstDataResponseCode: event.processor?.responseCode,
    firstDataResponseMessage: event.processor?.responseMessage,
  });

  // Si tiene suscripción y era el pago inicial, cancelar
  if (transaction.subscriptionId) {
    const subscription = await getSubscription(transaction.subscriptionId);
    if (subscription && subscription.status === 'active') {
      await updateSubscriptionStatus(transaction.subscriptionId, 'canceled', {
        canceledAt: new Date(),
      });
    }
  }
}

async function handleTransactionRefunded(event: WebhookEvent): Promise<void> {
  console.log('Transacción reembolsada:', event.transactionId);

  const transaction = await findTransaction(event);
  if (!transaction) {
    console.warn('Transacción no encontrada en BD para webhook refunded:', event.transactionId);
    return;
  }

  await updateTransactionStatus(transaction.id, 'refunded', {
    firstDataResponseCode: event.processor?.responseCode,
    firstDataResponseMessage: event.processor?.responseMessage,
  });
}

async function handleFraudAlert(event: WebhookEvent): Promise<void> {
  console.error('Alerta de fraude:', {
    transactionId: event.transactionId,
    orderId: event.orderId,
    amount: event.amount,
    paymentMethod: event.paymentMethod,
  });

  const transaction = await findTransaction(event);
  if (!transaction) {
    console.warn('Transacción no encontrada en BD para fraud alert:', event.transactionId);
    return;
  }

  // Marcar transacción como error con metadata de fraude
  await updateTransactionStatus(transaction.id, 'error', {
    fraudAlert: true,
    fraudAlertAt: new Date(),
    firstDataResponseCode: event.processor?.responseCode,
    firstDataResponseMessage: event.processor?.responseMessage,
  });

  // Suspender suscripción si existe
  if (transaction.subscriptionId) {
    const subscription = await getSubscription(transaction.subscriptionId);
    if (subscription && subscription.status === 'active') {
      await updateSubscriptionStatus(transaction.subscriptionId, 'paused', {
        pausedReason: 'fraud_alert',
        pausedAt: new Date(),
      });
    }
  }
}

async function handleChargeback(event: WebhookEvent): Promise<void> {
  console.error('Contracargo recibido:', {
    transactionId: event.transactionId,
    orderId: event.orderId,
    amount: event.amount,
  });

  const transaction = await findTransaction(event);
  if (!transaction) {
    console.warn('Transacción no encontrada en BD para chargeback:', event.transactionId);
    return;
  }

  // Marcar transacción con metadata de contracargo
  await updateTransactionStatus(transaction.id, 'refunded', {
    chargeback: true,
    chargebackAt: new Date(),
    firstDataResponseCode: event.processor?.responseCode,
    firstDataResponseMessage: event.processor?.responseMessage,
  });

  // Suspender suscripción
  if (transaction.subscriptionId) {
    const subscription = await getSubscription(transaction.subscriptionId);
    if (subscription && subscription.status !== 'canceled') {
      await updateSubscriptionStatus(transaction.subscriptionId, 'paused', {
        pausedReason: 'chargeback',
        pausedAt: new Date(),
      });
    }
  }
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
