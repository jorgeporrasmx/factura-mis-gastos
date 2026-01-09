import { NextRequest, NextResponse } from 'next/server';
import { getFirstDataClient, getErrorMessage } from '@/lib/firstdata';

interface RouteParams {
  params: Promise<{ transactionId: string }>;
}

/**
 * GET /api/payments/[transactionId]
 *
 * Consulta el estado de una transacción
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { transactionId } = await params;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'ID de transacción requerido' },
        { status: 400 }
      );
    }

    const client = getFirstDataClient();

    if (!client.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Sistema de pagos no configurado' },
        { status: 500 }
      );
    }

    const result = await client.getTransaction(transactionId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        transaction: {
          id: result.transactionId,
          status: result.status,
          amount: result.amount,
          currency: result.currency,
          approvalCode: result.approvalCode,
          card: result.card,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.errorMessage || 'Transacción no encontrada',
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error consultando transacción:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments/[transactionId]
 *
 * Realiza operaciones sobre una transacción existente (void/refund)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { transactionId } = await params;
    const body = await request.json();
    const { action, amount } = body as { action: 'void' | 'refund'; amount?: number };

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'ID de transacción requerido' },
        { status: 400 }
      );
    }

    if (!action || !['void', 'refund'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Acción inválida. Usar "void" o "refund"' },
        { status: 400 }
      );
    }

    const client = getFirstDataClient();

    if (!client.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Sistema de pagos no configurado' },
        { status: 500 }
      );
    }

    let result;

    if (action === 'void') {
      result = await client.void({ transactionId });
    } else {
      result = await client.refund({
        transactionId,
        amount: amount || undefined,
      });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: action === 'void' ? 'Transacción anulada' : 'Reembolso procesado',
        transaction: {
          id: result.transactionId,
          status: result.status,
          approvalCode: result.approvalCode,
        },
      });
    } else {
      const errorMessage = result.errorCode
        ? getErrorMessage(result.errorCode)
        : result.errorMessage || 'Error procesando la operación';

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error procesando operación:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
