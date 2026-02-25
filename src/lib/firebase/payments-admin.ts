// Firestore operations for payments (server-side only)
import { getAdminFirestore } from './admin';
import { FieldValue, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import type {
  PlanId,
  Customer,
  CustomerAddress,
  Transaction,
  TransactionType,
  TransactionStatus,
  Subscription,
  SubscriptionStatus,
  PaymentMethod,
  CardBrand,
} from '@/types/payments';

// ============================================================================
// CUSTOMER OPERATIONS
// ============================================================================

/**
 * Create or update a customer in Firestore
 */
export async function upsertCustomer(data: {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  taxId?: string;
  address?: CustomerAddress;
}): Promise<Customer> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

  const docRef = db.collection('customers').doc(data.id);
  const existing = await docRef.get();

  if (existing.exists) {
    await docRef.update({
      name: data.name,
      phone: data.phone || null,
      company: data.company || null,
      taxId: data.taxId || null,
      address: data.address || null,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    await docRef.set({
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      company: data.company || null,
      taxId: data.taxId || null,
      address: data.address || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone,
    company: data.company,
    taxId: data.taxId,
    address: data.address,
    createdAt: existing.exists ? existing.data()?.createdAt?.toDate() ?? new Date() : new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get a customer by ID
 */
export async function getCustomer(customerId: string): Promise<Customer | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const doc = await db.collection('customers').doc(customerId).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  } as Customer;
}

/**
 * Find a customer by email
 */
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const snapshot = await db
    .collection('customers')
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  } as Customer;
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

/**
 * Save a transaction record
 */
export async function createTransaction(data: {
  id: string;
  customerId: string;
  subscriptionId?: string;
  paymentMethodId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  description: string;
  firstDataTransactionId?: string;
  firstDataApprovalCode?: string;
  firstDataResponseCode?: string;
  firstDataResponseMessage?: string;
  metadata?: Record<string, string>;
}): Promise<Transaction> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

  const docRef = db.collection('transactions').doc(data.id);
  await docRef.set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Update a transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  extra?: Record<string, unknown>
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

  await db.collection('transactions').doc(transactionId).update({
    status,
    ...extra,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Find a transaction by First Data transaction ID
 */
export async function getTransactionByFirstDataId(
  firstDataTransactionId: string
): Promise<Transaction | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const snapshot = await db
    .collection('transactions')
    .where('firstDataTransactionId', '==', firstDataTransactionId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  } as Transaction;
}

/**
 * Find a transaction by order ID (our internal transaction ID)
 */
export async function getTransactionByOrderId(orderId: string): Promise<Transaction | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const doc = await db.collection('transactions').doc(orderId).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  } as Transaction;
}

// ============================================================================
// SUBSCRIPTION OPERATIONS
// ============================================================================

/**
 * Create a subscription
 */
export async function createSubscription(data: {
  id: string;
  customerId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  paymentMethodId: string;
}): Promise<Subscription> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const subscription: Omit<Subscription, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof FieldValue.serverTimestamp>;
    updatedAt: ReturnType<typeof FieldValue.serverTimestamp>;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  } = {
    id: data.id,
    customerId: data.customerId,
    planId: data.planId,
    status: data.status,
    paymentMethodId: data.paymentMethodId,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const docRef = db.collection('subscriptions').doc(data.id);
  await docRef.set(subscription);

  return {
    id: data.id,
    customerId: data.customerId,
    planId: data.planId,
    status: data.status,
    paymentMethodId: data.paymentMethodId,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus,
  extra?: Record<string, unknown>
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

  await db.collection('subscriptions').doc(subscriptionId).update({
    status,
    ...extra,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<Subscription | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const doc = await db.collection('subscriptions').doc(subscriptionId).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    currentPeriodStart: data.currentPeriodStart?.toDate() ?? new Date(),
    currentPeriodEnd: data.currentPeriodEnd?.toDate() ?? new Date(),
    canceledAt: data.canceledAt?.toDate(),
    trialEnd: data.trialEnd?.toDate(),
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  } as Subscription;
}

/**
 * Find active subscription for a customer
 */
export async function getActiveSubscriptionByCustomer(
  customerId: string
): Promise<Subscription | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const snapshot = await db
    .collection('subscriptions')
    .where('customerId', '==', customerId)
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    currentPeriodStart: data.currentPeriodStart?.toDate() ?? new Date(),
    currentPeriodEnd: data.currentPeriodEnd?.toDate() ?? new Date(),
    canceledAt: data.canceledAt?.toDate(),
    trialEnd: data.trialEnd?.toDate(),
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  } as Subscription;
}

// ============================================================================
// PAYMENT METHOD OPERATIONS
// ============================================================================

/**
 * Save a tokenized payment method
 */
export async function createPaymentMethod(data: {
  id: string;
  customerId: string;
  card: {
    brand: CardBrand;
    last4: string;
    expMonth: number;
    expYear: number;
    holderName: string;
  };
  token: string;
  isDefault: boolean;
}): Promise<PaymentMethod> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

  // If setting as default, unset any existing default
  if (data.isDefault) {
    const existing = await db
      .collection('paymentMethods')
      .where('customerId', '==', data.customerId)
      .where('isDefault', '==', true)
      .get();

    const batch = db.batch();
    existing.docs.forEach((existingDoc: QueryDocumentSnapshot) => {
      batch.update(existingDoc.ref, { isDefault: false });
    });
    await batch.commit();
  }

  const docRef = db.collection('paymentMethods').doc(data.id);
  await docRef.set({
    ...data,
    type: 'card',
    createdAt: FieldValue.serverTimestamp(),
  });

  return {
    ...data,
    type: 'card',
    createdAt: new Date(),
  };
}

/**
 * Get a payment method by ID
 */
export async function getPaymentMethod(paymentMethodId: string): Promise<PaymentMethod | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const doc = await db.collection('paymentMethods').doc(paymentMethodId).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() ?? new Date(),
  } as PaymentMethod;
}

/**
 * Get default payment method for a customer
 */
export async function getDefaultPaymentMethod(
  customerId: string
): Promise<PaymentMethod | null> {
  const db = getAdminFirestore();
  if (!db) return null;

  const snapshot = await db
    .collection('paymentMethods')
    .where('customerId', '==', customerId)
    .where('isDefault', '==', true)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() ?? new Date(),
  } as PaymentMethod;
}
