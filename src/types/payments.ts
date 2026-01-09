/**
 * Tipos y modelos para el sistema de pagos con First Data
 */

// ============================================
// PLANES Y PRECIOS
// ============================================

export type PlanId = 'personal' | 'equipos' | 'empresa' | 'corporativo';

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  price: number; // en centavos MXN (0 para corporativo)
  priceDisplay: string;
  unit: string;
  description: string;
  features: string[];
  receiptsLimit: number; // -1 para ilimitado
  usersLimit: number; // -1 para ilimitado
  isCustom: boolean; // true para plan corporativo
  popular: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  personal: {
    id: 'personal',
    name: 'Personal',
    tagline: 'Ideal para freelancers y negocios pequeños.',
    price: 1000, // $10 MXN por recibo (en centavos)
    priceDisplay: '$10',
    unit: 'MXN/recibo',
    description: 'Hasta 50 recibos al mes.',
    features: [
      'Hasta 50 recibos mensuales',
      '1 usuario',
      'Reporte mensual incluido',
      'Envío por WhatsApp o correo',
      'Soporte por correo',
    ],
    receiptsLimit: 50,
    usersLimit: 1,
    isCustom: false,
    popular: false,
  },
  equipos: {
    id: 'equipos',
    name: 'Equipos',
    tagline: 'Para empresas con gastos recurrentes.',
    price: 129900, // $1,299 MXN/mes (en centavos)
    priceDisplay: '$1,299',
    unit: 'MXN/mes',
    description: 'Hasta 150 recibos y 3 usuarios.',
    features: [
      '150 recibos mensuales',
      'Hasta 3 usuarios',
      'Reportes por persona',
      'Reglas de aprobación',
      'Dashboard de control',
      'Soporte prioritario',
    ],
    receiptsLimit: 150,
    usersLimit: 3,
    isCustom: false,
    popular: false,
  },
  empresa: {
    id: 'empresa',
    name: 'Empresa',
    tagline: 'Control total para operaciones continuas.',
    price: 249900, // $2,499 MXN/mes (en centavos)
    priceDisplay: '$2,499',
    unit: 'MXN/mes',
    description: 'Hasta 300 recibos y 8 usuarios.',
    features: [
      '300 recibos mensuales',
      'Hasta 8 usuarios',
      'Reportes por departamento',
      'Reportes de impuestos',
      'Integración contable',
      'Soporte dedicado',
    ],
    receiptsLimit: 300,
    usersLimit: 8,
    isCustom: false,
    popular: true,
  },
  corporativo: {
    id: 'corporativo',
    name: 'Corporativo',
    tagline: 'Solución a la medida de tu operación.',
    price: 0, // Precio personalizado
    priceDisplay: 'A tu medida',
    unit: '',
    description: 'Para grandes operaciones.',
    features: [
      'Usuarios ilimitados',
      'Facturas ilimitadas',
      'API disponible',
      'Soporte dedicado',
      'Configuración a la medida',
    ],
    receiptsLimit: -1,
    usersLimit: -1,
    isCustom: true,
    popular: false,
  },
};

// ============================================
// MÉTODOS DE PAGO
// ============================================

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface PaymentMethod {
  id: string;
  customerId: string;
  type: 'card';
  card: {
    brand: CardBrand;
    last4: string;
    expMonth: number;
    expYear: number;
    holderName: string;
  };
  token: string; // Token de First Data para pagos recurrentes
  isDefault: boolean;
  createdAt: Date;
}

export interface CardInput {
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  holderName: string;
}

// ============================================
// CLIENTES
// ============================================

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  taxId?: string; // RFC para México
  address?: CustomerAddress;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string; // Default: 'MX'
}

// ============================================
// SUSCRIPCIONES
// ============================================

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'trialing'
  | 'paused';

export interface Subscription {
  id: string;
  customerId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  paymentMethodId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TRANSACCIONES
// ============================================

export type TransactionType =
  | 'purchase' // Cargo normal
  | 'preauth' // Pre-autorización
  | 'preauth_complete' // Completar pre-auth
  | 'refund' // Reembolso
  | 'void'; // Anulación

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'approved'
  | 'declined'
  | 'error'
  | 'voided'
  | 'refunded';

export interface Transaction {
  id: string;
  customerId: string;
  subscriptionId?: string;
  paymentMethodId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // En centavos
  currency: string; // Default: 'MXN'
  description: string;
  // Datos de First Data
  firstDataTransactionId?: string;
  firstDataApprovalCode?: string;
  firstDataResponseCode?: string;
  firstDataResponseMessage?: string;
  // Metadata
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// REQUESTS Y RESPONSES DE API
// ============================================

export interface CheckoutRequest {
  planId: PlanId;
  customer: {
    email: string;
    name: string;
    phone?: string;
    company?: string;
    taxId?: string;
  };
  card: CardInput;
  billingAddress?: CustomerAddress;
}

export interface CheckoutResponse {
  success: boolean;
  transactionId?: string;
  subscriptionId?: string;
  approvalCode?: string;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface TokenizeRequest {
  card: CardInput;
  customerId?: string;
}

export interface TokenizeResponse {
  success: boolean;
  token?: string;
  card?: {
    brand: CardBrand;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================
// FIRST DATA API TYPES
// ============================================

export interface FirstDataConfig {
  apiKey: string;
  apiSecret: string;
  merchantId: string;
  terminalId: string;
  environment: 'sandbox' | 'production';
}

export interface FirstDataPaymentRequest {
  requestType: 'PaymentCardSaleTransaction' | 'PaymentCardPreAuthTransaction';
  transactionAmount: {
    total: string;
    currency: string;
  };
  paymentMethod: {
    paymentCard: {
      number: string;
      expiryDate: {
        month: string;
        year: string;
      };
      securityCode: string;
    };
  };
  order?: {
    orderId: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface FirstDataPaymentResponse {
  clientRequestId: string;
  apiTraceId: string;
  ipgTransactionId: string;
  orderId: string;
  transactionType: string;
  transactionOrigin: string;
  paymentMethodDetails: {
    paymentCard: {
      type: string;
      bin: string;
      last4: string;
      expiryDate: {
        month: string;
        year: string;
      };
    };
    paymentMethodType: string;
  };
  country: string;
  terminalId: string;
  merchantId: string;
  transactionTime: number;
  approvedAmount: {
    total: number;
    currency: string;
  };
  transactionStatus: 'APPROVED' | 'DECLINED' | 'ERROR' | 'WAITING';
  approvalCode?: string;
  schemeTransactionId?: string;
  processor: {
    referenceNumber: string;
    authorizationCode: string;
    responseCode: string;
    responseMessage: string;
    avsResponse?: {
      streetMatch: string;
      postalCodeMatch: string;
    };
    securityCodeResponse?: string;
  };
}

export interface FirstDataErrorResponse {
  clientRequestId: string;
  apiTraceId: string;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

// ============================================
// WEBHOOKS
// ============================================

export type WebhookEventType =
  | 'transaction.approved'
  | 'transaction.declined'
  | 'transaction.refunded'
  | 'transaction.voided'
  | 'subscription.created'
  | 'subscription.canceled'
  | 'subscription.renewed'
  | 'subscription.payment_failed';

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Record<string, unknown>;
  createdAt: Date;
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Formatea un monto en centavos a string con formato de moneda
 */
export function formatAmount(amountInCents: number, currency = 'MXN'): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Detecta la marca de la tarjeta basado en el número
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const cleanNumber = cardNumber.replace(/\D/g, '');

  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';

  return 'unknown';
}

/**
 * Valida un número de tarjeta usando el algoritmo de Luhn
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\D/g, '');

  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Valida la fecha de expiración de la tarjeta
 */
export function validateExpiry(month: string, year: string): boolean {
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Últimos 2 dígitos
  const currentMonth = now.getMonth() + 1;

  const expMonth = parseInt(month, 10);
  const expYear = parseInt(year, 10);

  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;

  return true;
}

/**
 * Valida el CVV según la marca de la tarjeta
 */
export function validateCVV(cvv: string, brand: CardBrand): boolean {
  const cleanCVV = cvv.replace(/\D/g, '');

  if (brand === 'amex') {
    return cleanCVV.length === 4;
  }

  return cleanCVV.length === 3;
}

/**
 * Genera un ID único para transacciones
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `txn_${timestamp}${randomPart}`;
}

/**
 * Genera un ID único para clientes
 */
export function generateCustomerId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `cus_${timestamp}${randomPart}`;
}

/**
 * Genera un ID único para suscripciones
 */
export function generateSubscriptionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `sub_${timestamp}${randomPart}`;
}
