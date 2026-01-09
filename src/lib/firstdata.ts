/**
 * Cliente para la API de First Data (Fiserv) Payment Gateway
 *
 * Documentación: https://docs.fiserv.dev/public/docs/payments-api-quickstart
 *
 * Endpoints:
 * - Production: https://prod.api.firstdata.com/gateway/v2
 * - Sandbox: https://cert.api.firstdata.com/gateway/v2
 */

import crypto from 'crypto';
import {
  FirstDataConfig,
  FirstDataPaymentRequest,
  FirstDataPaymentResponse,
  FirstDataErrorResponse,
  CardInput,
  CardBrand,
  detectCardBrand,
  TransactionStatus,
} from '@/types/payments';

// ============================================
// CONFIGURACIÓN
// ============================================

const ENDPOINTS = {
  sandbox: 'https://cert.api.firstdata.com/gateway/v2',
  production: 'https://prod.api.firstdata.com/gateway/v2',
} as const;

/**
 * Obtiene la configuración de First Data desde variables de entorno
 */
export function getFirstDataConfig(): FirstDataConfig {
  const config: FirstDataConfig = {
    apiKey: process.env.FIRSTDATA_API_KEY || '',
    apiSecret: process.env.FIRSTDATA_API_SECRET || '',
    merchantId: process.env.FIRSTDATA_MERCHANT_ID || '',
    terminalId: process.env.FIRSTDATA_TERMINAL_ID || '',
    environment: (process.env.FIRSTDATA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  };

  return config;
}

/**
 * Valida que la configuración de First Data esté completa
 */
export function validateConfig(config: FirstDataConfig): boolean {
  return !!(
    config.apiKey &&
    config.apiSecret &&
    config.merchantId &&
    config.terminalId
  );
}

// ============================================
// AUTENTICACIÓN HMAC
// ============================================

type HMACHeaders = Record<string, string>;

/**
 * Genera los headers de autenticación HMAC para First Data
 */
function generateHMACHeaders(
  config: FirstDataConfig,
  payload: string
): HMACHeaders {
  const clientRequestId = generateClientRequestId();
  const timestamp = Date.now().toString();

  // Crear el mensaje para HMAC: apiKey + clientRequestId + timestamp + payload
  const message = config.apiKey + clientRequestId + timestamp + payload;

  // Generar el HMAC-SHA256
  const hmac = crypto
    .createHmac('sha256', config.apiSecret)
    .update(message)
    .digest('base64');

  return {
    'Content-Type': 'application/json',
    'Client-Request-Id': clientRequestId,
    'Api-Key': config.apiKey,
    Timestamp: timestamp,
    'Message-Signature': hmac,
  };
}

/**
 * Genera un ID único para la solicitud del cliente
 */
function generateClientRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// ============================================
// CLIENTE API
// ============================================

export class FirstDataClient {
  private config: FirstDataConfig;
  private baseUrl: string;

  constructor(config?: FirstDataConfig) {
    this.config = config || getFirstDataConfig();
    this.baseUrl = ENDPOINTS[this.config.environment];
  }

  /**
   * Verifica si el cliente está configurado correctamente
   */
  isConfigured(): boolean {
    return validateConfig(this.config);
  }

  /**
   * Realiza una solicitud a la API de First Data
   */
  private async request<T>(
    endpoint: string,
    method: 'POST' | 'GET' | 'PUT' | 'DELETE',
    body?: unknown
  ): Promise<T> {
    const payload = body ? JSON.stringify(body) : '';
    const headers = generateHMACHeaders(this.config, payload);
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers,
      body: payload || undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as FirstDataErrorResponse;
      throw new FirstDataError(
        errorData.error?.message || 'Error en la transacción',
        errorData.error?.code || 'UNKNOWN_ERROR',
        errorData
      );
    }

    return data as T;
  }

  // ============================================
  // TRANSACCIONES DE PAGO
  // ============================================

  /**
   * Procesa un pago con tarjeta (venta directa)
   */
  async purchase(params: {
    amount: number; // En centavos
    currency?: string;
    card: CardInput;
    orderId?: string;
    description?: string;
    customerName?: string;
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  }): Promise<PaymentResult> {
    const request: FirstDataPaymentRequest = {
      requestType: 'PaymentCardSaleTransaction',
      transactionAmount: {
        total: (params.amount / 100).toFixed(2),
        currency: params.currency || 'MXN',
      },
      paymentMethod: {
        paymentCard: {
          number: params.card.number.replace(/\s/g, ''),
          expiryDate: {
            month: params.card.expMonth.padStart(2, '0'),
            year: params.card.expYear.length === 2
              ? params.card.expYear
              : params.card.expYear.slice(-2),
          },
          securityCode: params.card.cvv,
        },
      },
    };

    if (params.orderId) {
      request.order = { orderId: params.orderId };
    }

    if (params.billingAddress && params.customerName) {
      const nameParts = params.customerName.split(' ');
      request.billingAddress = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        address1: params.billingAddress.street,
        city: params.billingAddress.city,
        state: params.billingAddress.state,
        postalCode: params.billingAddress.postalCode,
        country: params.billingAddress.country,
      };
    }

    try {
      const response = await this.request<FirstDataPaymentResponse>(
        '/payments',
        'POST',
        request
      );

      return this.parsePaymentResponse(response);
    } catch (error) {
      if (error instanceof FirstDataError) {
        return {
          success: false,
          status: 'error',
          errorCode: error.code,
          errorMessage: error.message,
        };
      }
      throw error;
    }
  }

  /**
   * Pre-autoriza un pago (retiene fondos sin capturar)
   */
  async preauth(params: {
    amount: number;
    currency?: string;
    card: CardInput;
    orderId?: string;
  }): Promise<PaymentResult> {
    const request: FirstDataPaymentRequest = {
      requestType: 'PaymentCardPreAuthTransaction',
      transactionAmount: {
        total: (params.amount / 100).toFixed(2),
        currency: params.currency || 'MXN',
      },
      paymentMethod: {
        paymentCard: {
          number: params.card.number.replace(/\s/g, ''),
          expiryDate: {
            month: params.card.expMonth.padStart(2, '0'),
            year: params.card.expYear.length === 2
              ? params.card.expYear
              : params.card.expYear.slice(-2),
          },
          securityCode: params.card.cvv,
        },
      },
    };

    if (params.orderId) {
      request.order = { orderId: params.orderId };
    }

    try {
      const response = await this.request<FirstDataPaymentResponse>(
        '/payments',
        'POST',
        request
      );

      return this.parsePaymentResponse(response);
    } catch (error) {
      if (error instanceof FirstDataError) {
        return {
          success: false,
          status: 'error',
          errorCode: error.code,
          errorMessage: error.message,
        };
      }
      throw error;
    }
  }

  /**
   * Captura una pre-autorización
   */
  async capture(params: {
    transactionId: string;
    amount?: number;
    currency?: string;
  }): Promise<PaymentResult> {
    const body: Record<string, unknown> = {
      requestType: 'PostAuthTransaction',
    };

    if (params.amount) {
      body.transactionAmount = {
        total: (params.amount / 100).toFixed(2),
        currency: params.currency || 'MXN',
      };
    }

    try {
      const response = await this.request<FirstDataPaymentResponse>(
        `/payments/${params.transactionId}`,
        'POST',
        body
      );

      return this.parsePaymentResponse(response);
    } catch (error) {
      if (error instanceof FirstDataError) {
        return {
          success: false,
          status: 'error',
          errorCode: error.code,
          errorMessage: error.message,
        };
      }
      throw error;
    }
  }

  /**
   * Anula una transacción
   */
  async void(params: { transactionId: string }): Promise<PaymentResult> {
    try {
      const response = await this.request<FirstDataPaymentResponse>(
        `/payments/${params.transactionId}`,
        'POST',
        { requestType: 'VoidTransaction' }
      );

      return this.parsePaymentResponse(response);
    } catch (error) {
      if (error instanceof FirstDataError) {
        return {
          success: false,
          status: 'error',
          errorCode: error.code,
          errorMessage: error.message,
        };
      }
      throw error;
    }
  }

  /**
   * Reembolsa una transacción
   */
  async refund(params: {
    transactionId: string;
    amount?: number;
    currency?: string;
  }): Promise<PaymentResult> {
    const body: Record<string, unknown> = {
      requestType: 'ReturnTransaction',
    };

    if (params.amount) {
      body.transactionAmount = {
        total: (params.amount / 100).toFixed(2),
        currency: params.currency || 'MXN',
      };
    }

    try {
      const response = await this.request<FirstDataPaymentResponse>(
        `/payments/${params.transactionId}`,
        'POST',
        body
      );

      return this.parsePaymentResponse(response);
    } catch (error) {
      if (error instanceof FirstDataError) {
        return {
          success: false,
          status: 'error',
          errorCode: error.code,
          errorMessage: error.message,
        };
      }
      throw error;
    }
  }

  /**
   * Consulta el estado de una transacción
   */
  async getTransaction(transactionId: string): Promise<PaymentResult> {
    try {
      const response = await this.request<FirstDataPaymentResponse>(
        `/payments/${transactionId}`,
        'GET'
      );

      return this.parsePaymentResponse(response);
    } catch (error) {
      if (error instanceof FirstDataError) {
        return {
          success: false,
          status: 'error',
          errorCode: error.code,
          errorMessage: error.message,
        };
      }
      throw error;
    }
  }

  // ============================================
  // TOKENIZACIÓN
  // ============================================

  /**
   * Tokeniza una tarjeta para uso futuro (pagos recurrentes)
   */
  async tokenize(card: CardInput): Promise<TokenizeResult> {
    try {
      const response = await this.request<TokenizeResponse>(
        '/payment-tokens',
        'POST',
        {
          requestType: 'PaymentCardPaymentTokenizationRequest',
          paymentCard: {
            number: card.number.replace(/\s/g, ''),
            expiryDate: {
              month: card.expMonth.padStart(2, '0'),
              year: card.expYear.length === 2
                ? card.expYear
                : card.expYear.slice(-2),
            },
            securityCode: card.cvv,
          },
          createToken: {
            reusable: true,
            declineDuplicates: true,
          },
        }
      );

      const cleanNumber = card.number.replace(/\s/g, '');

      return {
        success: true,
        token: response.paymentToken?.value || '',
        card: {
          brand: detectCardBrand(cleanNumber),
          last4: cleanNumber.slice(-4),
          expMonth: parseInt(card.expMonth, 10),
          expYear: parseInt(card.expYear, 10),
        },
      };
    } catch (error) {
      if (error instanceof FirstDataError) {
        return {
          success: false,
          errorCode: error.code,
          errorMessage: error.message,
        };
      }
      throw error;
    }
  }

  /**
   * Procesa un pago usando un token previamente almacenado
   */
  async purchaseWithToken(params: {
    token: string;
    amount: number;
    currency?: string;
    orderId?: string;
  }): Promise<PaymentResult> {
    try {
      const response = await this.request<FirstDataPaymentResponse>(
        '/payments',
        'POST',
        {
          requestType: 'PaymentTokenSaleTransaction',
          transactionAmount: {
            total: (params.amount / 100).toFixed(2),
            currency: params.currency || 'MXN',
          },
          paymentMethod: {
            paymentToken: {
              value: params.token,
            },
          },
          order: params.orderId ? { orderId: params.orderId } : undefined,
        }
      );

      return this.parsePaymentResponse(response);
    } catch (error) {
      if (error instanceof FirstDataError) {
        return {
          success: false,
          status: 'error',
          errorCode: error.code,
          errorMessage: error.message,
        };
      }
      throw error;
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Parsea la respuesta de First Data a un formato uniforme
   */
  private parsePaymentResponse(response: FirstDataPaymentResponse): PaymentResult {
    const isApproved = response.transactionStatus === 'APPROVED';

    return {
      success: isApproved,
      status: this.mapTransactionStatus(response.transactionStatus),
      transactionId: response.ipgTransactionId,
      orderId: response.orderId,
      approvalCode: response.approvalCode,
      amount: response.approvedAmount?.total,
      currency: response.approvedAmount?.currency,
      card: response.paymentMethodDetails?.paymentCard
        ? {
            brand: response.paymentMethodDetails.paymentCard.type?.toLowerCase() as CardBrand,
            last4: response.paymentMethodDetails.paymentCard.last4,
            expMonth: parseInt(response.paymentMethodDetails.paymentCard.expiryDate?.month || '0', 10),
            expYear: parseInt(response.paymentMethodDetails.paymentCard.expiryDate?.year || '0', 10),
          }
        : undefined,
      processor: {
        referenceNumber: response.processor?.referenceNumber,
        responseCode: response.processor?.responseCode,
        responseMessage: response.processor?.responseMessage,
      },
      errorCode: isApproved ? undefined : response.processor?.responseCode,
      errorMessage: isApproved ? undefined : response.processor?.responseMessage,
    };
  }

  /**
   * Mapea el estado de First Data a nuestro enum
   */
  private mapTransactionStatus(fdStatus: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      APPROVED: 'approved',
      DECLINED: 'declined',
      ERROR: 'error',
      WAITING: 'processing',
    };
    return statusMap[fdStatus] || 'error';
  }
}

// ============================================
// TIPOS DE RESULTADO
// ============================================

export interface PaymentResult {
  success: boolean;
  status: TransactionStatus;
  transactionId?: string;
  orderId?: string;
  approvalCode?: string;
  amount?: number;
  currency?: string;
  card?: {
    brand: CardBrand;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  processor?: {
    referenceNumber?: string;
    responseCode?: string;
    responseMessage?: string;
  };
  errorCode?: string;
  errorMessage?: string;
}

export interface TokenizeResult {
  success: boolean;
  token?: string;
  card?: {
    brand: CardBrand;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  errorCode?: string;
  errorMessage?: string;
}

interface TokenizeResponse {
  paymentToken?: {
    value: string;
    reusable: boolean;
  };
}

// ============================================
// ERRORES PERSONALIZADOS
// ============================================

export class FirstDataError extends Error {
  code: string;
  details: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'FirstDataError';
    this.code = code;
    this.details = details;
  }
}

// ============================================
// CÓDIGOS DE ERROR COMUNES
// ============================================

export const ERROR_CODES = {
  // Errores de tarjeta
  CARD_DECLINED: 'La tarjeta fue rechazada',
  CARD_EXPIRED: 'La tarjeta ha expirado',
  CARD_INVALID: 'Número de tarjeta inválido',
  CVV_INVALID: 'Código de seguridad inválido',
  INSUFFICIENT_FUNDS: 'Fondos insuficientes',

  // Errores de autenticación
  AUTH_FAILED: 'Error de autenticación con el procesador',
  INVALID_CREDENTIALS: 'Credenciales de API inválidas',

  // Errores generales
  NETWORK_ERROR: 'Error de conexión con el procesador de pagos',
  TIMEOUT: 'Tiempo de espera agotado',
  UNKNOWN_ERROR: 'Error desconocido',
} as const;

/**
 * Traduce códigos de error de First Data a mensajes amigables
 */
export function getErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    '00': 'Transacción aprobada',
    '05': 'La tarjeta fue rechazada. Contacta a tu banco.',
    '14': 'Número de tarjeta inválido',
    '33': 'La tarjeta ha expirado',
    '41': 'Tarjeta reportada como perdida',
    '43': 'Tarjeta reportada como robada',
    '51': 'Fondos insuficientes',
    '54': 'La tarjeta ha expirado',
    '55': 'PIN incorrecto',
    '57': 'Transacción no permitida para esta tarjeta',
    '61': 'Límite de retiro excedido',
    '62': 'Tarjeta restringida',
    '65': 'Límite de transacciones excedido',
    '91': 'Banco emisor no disponible. Intenta más tarde.',
    N7: 'Código de seguridad (CVV) incorrecto',
  };

  return errorMessages[code] || 'Error procesando el pago. Intenta de nuevo.';
}

// ============================================
// INSTANCIA POR DEFECTO
// ============================================

let defaultClient: FirstDataClient | null = null;

/**
 * Obtiene o crea el cliente por defecto de First Data
 */
export function getFirstDataClient(): FirstDataClient {
  if (!defaultClient) {
    defaultClient = new FirstDataClient();
  }
  return defaultClient;
}

/**
 * Crea un nuevo cliente de First Data con configuración personalizada
 */
export function createFirstDataClient(config: FirstDataConfig): FirstDataClient {
  return new FirstDataClient(config);
}
