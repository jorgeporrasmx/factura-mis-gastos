import { NextRequest, NextResponse } from 'next/server';
import { getFirstDataClient, getErrorMessage } from '@/lib/firstdata';
import {
  PLANS,
  PlanId,
  CheckoutRequest,
  CheckoutResponse,
  validateCardNumber,
  validateExpiry,
  validateCVV,
  detectCardBrand,
  generateTransactionId,
  generateCustomerId,
  generateSubscriptionId,
} from '@/types/payments';
import {
  upsertCustomer,
  createTransaction,
  createSubscription,
  createPaymentMethod,
} from '@/lib/firebase/payments-admin';

/**
 * POST /api/payments/checkout
 *
 * Procesa un pago para suscribirse a un plan
 */
export async function POST(request: NextRequest): Promise<NextResponse<CheckoutResponse>> {
  try {
    const body: CheckoutRequest = await request.json();

    // Validar campos requeridos
    const validationError = validateCheckoutRequest(body);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: validationError,
          error: { code: 'VALIDATION_ERROR', message: validationError },
        },
        { status: 400 }
      );
    }

    // Obtener el plan
    const plan = PLANS[body.planId];
    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          message: 'Plan no encontrado',
          error: { code: 'PLAN_NOT_FOUND', message: 'El plan seleccionado no existe' },
        },
        { status: 400 }
      );
    }

    // Los planes corporativos requieren cotización personalizada
    if (plan.isCustom) {
      return NextResponse.json(
        {
          success: false,
          message: 'El plan Corporativo requiere cotización personalizada',
          error: {
            code: 'CUSTOM_PLAN',
            message: 'Contacta a ventas para una cotización personalizada',
          },
        },
        { status: 400 }
      );
    }

    // Obtener cliente de First Data
    const client = getFirstDataClient();

    if (!client.isConfigured()) {
      console.error('First Data no está configurado correctamente');
      return NextResponse.json(
        {
          success: false,
          message: 'Error de configuración del sistema de pagos',
          error: {
            code: 'CONFIG_ERROR',
            message: 'El sistema de pagos no está configurado correctamente',
          },
        },
        { status: 500 }
      );
    }

    // Generar IDs únicos
    const transactionId = generateTransactionId();
    const customerId = generateCustomerId();
    const subscriptionId = generateSubscriptionId();
    const paymentMethodId = `pm_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 10)}`;

    // Procesar el pago
    const result = await client.purchase({
      amount: plan.price,
      currency: 'MXN',
      card: body.card,
      orderId: transactionId,
      customerName: body.customer.name,
      billingAddress: body.billingAddress,
    });

    if (result.success) {
      // 1. Crear/actualizar cliente en Firestore
      await upsertCustomer({
        id: customerId,
        email: body.customer.email,
        name: body.customer.name,
        phone: body.customer.phone,
        company: body.customer.company,
        taxId: body.customer.taxId,
        address: body.billingAddress,
      });

      // 2. Tokenizar la tarjeta para pagos recurrentes
      let tokenValue: string | undefined;
      try {
        const tokenResult = await client.tokenize(body.card);
        if (tokenResult.success && tokenResult.token) {
          tokenValue = tokenResult.token;
          await createPaymentMethod({
            id: paymentMethodId,
            customerId,
            card: {
              brand: tokenResult.card?.brand || detectCardBrand(body.card.number),
              last4: tokenResult.card?.last4 || body.card.number.replace(/\s/g, '').slice(-4),
              expMonth: tokenResult.card?.expMonth || parseInt(body.card.expMonth, 10),
              expYear: tokenResult.card?.expYear || parseInt(body.card.expYear, 10),
              holderName: body.card.holderName,
            },
            token: tokenResult.token,
            isDefault: true,
          });
        } else {
          console.warn('Tokenización falló, continuando sin token:', tokenResult.errorMessage);
        }
      } catch (tokenError) {
        // No fallar el checkout por error de tokenización
        console.error('Error tokenizando tarjeta:', tokenError);
      }

      // 3. Crear suscripción
      await createSubscription({
        id: subscriptionId,
        customerId,
        planId: body.planId,
        status: 'active',
        paymentMethodId: tokenValue ? paymentMethodId : '',
      });

      // 4. Registrar transacción
      await createTransaction({
        id: transactionId,
        customerId,
        subscriptionId,
        paymentMethodId: tokenValue ? paymentMethodId : '',
        type: 'purchase',
        status: 'approved',
        amount: plan.price,
        currency: 'MXN',
        description: `Suscripción al plan ${plan.name}`,
        firstDataTransactionId: result.transactionId,
        firstDataApprovalCode: result.approvalCode,
        firstDataResponseCode: result.processor?.responseCode,
        firstDataResponseMessage: result.processor?.responseMessage,
      });

      // Enviar notificación a Monday.com (opcional)
      await notifyMondayNewSubscription({
        customerId,
        customerName: body.customer.name,
        customerEmail: body.customer.email,
        customerPhone: body.customer.phone,
        planName: plan.name,
        amount: plan.priceDisplay,
        transactionId: result.transactionId || transactionId,
      });

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId || transactionId,
        subscriptionId,
        approvalCode: result.approvalCode,
        message: '¡Pago procesado exitosamente! Bienvenido a Factura Mis Gastos.',
      });
    } else {
      // Pago rechazado — registrar transacción fallida
      try {
        await upsertCustomer({
          id: customerId,
          email: body.customer.email,
          name: body.customer.name,
          phone: body.customer.phone,
          company: body.customer.company,
          taxId: body.customer.taxId,
          address: body.billingAddress,
        });

        await createTransaction({
          id: transactionId,
          customerId,
          type: 'purchase',
          status: 'declined',
          paymentMethodId: '',
          amount: plan.price,
          currency: 'MXN',
          description: `Intento fallido: plan ${plan.name}`,
          firstDataTransactionId: result.transactionId,
          firstDataResponseCode: result.errorCode,
          firstDataResponseMessage: result.errorMessage,
        });
      } catch (dbError) {
        console.error('Error guardando transacción rechazada:', dbError);
      }

      const errorMessage = result.errorCode
        ? getErrorMessage(result.errorCode)
        : result.errorMessage || 'Error procesando el pago';

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          error: {
            code: result.errorCode || 'PAYMENT_FAILED',
            message: errorMessage,
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error en checkout:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Ocurrió un error inesperado. Intenta de nuevo.',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Valida los datos del checkout
 */
function validateCheckoutRequest(data: CheckoutRequest): string | null {
  // Validar plan
  if (!data.planId || !isValidPlanId(data.planId)) {
    return 'Plan inválido';
  }

  // Validar datos del cliente
  if (!data.customer) {
    return 'Datos del cliente requeridos';
  }

  if (!data.customer.email || !isValidEmail(data.customer.email)) {
    return 'Email inválido';
  }

  if (!data.customer.name || data.customer.name.trim().length < 2) {
    return 'Nombre inválido';
  }

  // Validar tarjeta
  if (!data.card) {
    return 'Datos de tarjeta requeridos';
  }

  if (!data.card.number || !validateCardNumber(data.card.number)) {
    return 'Número de tarjeta inválido';
  }

  if (!data.card.expMonth || !data.card.expYear) {
    return 'Fecha de expiración requerida';
  }

  if (!validateExpiry(data.card.expMonth, data.card.expYear)) {
    return 'La tarjeta ha expirado';
  }

  const cardBrand = detectCardBrand(data.card.number);
  if (!data.card.cvv || !validateCVV(data.card.cvv, cardBrand)) {
    return 'Código de seguridad inválido';
  }

  if (!data.card.holderName || data.card.holderName.trim().length < 2) {
    return 'Nombre del titular requerido';
  }

  return null;
}

function isValidPlanId(planId: string): planId is PlanId {
  return ['personal', 'equipos', 'empresa', 'corporativo'].includes(planId);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Notifica a Monday.com sobre una nueva suscripción
 */
async function notifyMondayNewSubscription(data: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  planName: string;
  amount: string;
  transactionId: string;
}): Promise<void> {
  const apiKey = process.env.MONDAY_API_KEY;
  if (!apiKey) {
    console.warn('MONDAY_API_KEY no configurado, omitiendo notificación');
    return;
  }

  try {
    // Board de suscripciones (usar un board diferente al de leads)
    const boardId = process.env.MONDAY_SUBSCRIPTIONS_BOARD_ID || '18393740781';

    const mutation = `
      mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item(
          board_id: $boardId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
        }
      }
    `;

    const columnValues = JSON.stringify({
      email_mkz7ydhm: { email: data.customerEmail, text: data.customerEmail },
      phone_mkz742fw: data.customerPhone || '',
      text_mkz75aj8: data.planName,
      text_mkz7hm0p: data.amount,
      text_mkz7v1b1: `Transaction ID: ${data.transactionId}`,
      date_mkz7qq3d: { date: new Date().toISOString().split('T')[0] },
      color_mkz79aj8: { label: 'Activo' },
    });

    await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          boardId,
          itemName: `${data.customerName} - ${data.planName}`,
          columnValues,
        },
      }),
    });
  } catch (error) {
    console.error('Error notificando a Monday:', error);
    // No fallar la transacción por esto
  }
}
