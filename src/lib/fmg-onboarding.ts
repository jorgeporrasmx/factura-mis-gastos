import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import {
  ensureCompanyDriveFolder,
  isDriveConfigured,
  shareFolderWithUser,
  createUserFolder,
} from '@/lib/google-drive';
import type { CompanyPlan } from '@/types/company';
import {
  extractDomainFromEmail,
  generateInviteCode,
  generateUniqueCompanyDomain,
  isPublicEmailDomain,
} from '@/types/company';

export type OnboardingAccountType = 'empresa' | 'personal' | 'empleado';

export interface ActivateSubscriptionInput {
  transactionId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  planId?: string;
  planName?: string;
  companyName?: string;
  accountType?: OnboardingAccountType;
  companyId?: string;
  uid?: string;
  orderId?: string;
  subscriptionId?: string;
  amount?: number | string;
  currency?: string;
  paymentEnvironment?: string;
  mondaySubscriptionItemId?: string;
  mondayBoardId?: string;
  mondayBoardUrl?: string;
  driveFolderId?: string;
  driveDocsFolderId?: string;
  driveLink?: string;
  source?: string;
}

export interface CreateDriveFolderInput {
  companyId?: string;
  transactionId?: string;
  customerEmail: string;
  customerName?: string;
  companyName?: string;
  accountType?: OnboardingAccountType;
  uid?: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function asPlan(value: string | undefined): CompanyPlan {
  if (value === 'personal' || value === 'equipos' || value === 'empresa' || value === 'corporativo') {
    return value;
  }
  if (value === 'freelancer') return 'personal';
  return 'personal';
}

function shortHash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 10);
}

function pendingUserId(email: string): string {
  return shortHash(normalizeEmail(email));
}

function inferCompanyName(input: Pick<ActivateSubscriptionInput, 'companyName' | 'customerName' | 'customerEmail' | 'accountType'>): string {
  if (input.accountType === 'personal') return input.customerName.trim();
  return (input.companyName || input.customerName || input.customerEmail).trim();
}

function inferCompanyDomain(companyName: string, customerEmail: string, uidOrSeed: string): string {
  try {
    const emailDomain = extractDomainFromEmail(customerEmail);
    if (!isPublicEmailDomain(emailDomain)) return emailDomain;
  } catch {
    // Fall through to generated internal domain.
  }

  return generateUniqueCompanyDomain(companyName, uidOrSeed).replace('.personal', '.fmg');
}

async function findUserByEmail(email: string): Promise<{ uid: string; data: FirebaseFirestore.DocumentData } | null> {
  const db = getDb();
  const snapshot = await db.collection('users').where('email', '==', normalizeEmail(email)).limit(1).get();
  const doc = snapshot.docs[0];
  return doc ? { uid: doc.id, data: doc.data() } : null;
}

function getDb(): FirebaseFirestore.Firestore {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin no esta configurado');
  return db;
}

async function findCompany(input: {
  companyId?: string;
  transactionId?: string;
  customerEmail: string;
  companyName: string;
}): Promise<{ id: string; data: FirebaseFirestore.DocumentData } | null> {
  const db = getDb();

  if (input.companyId) {
    const doc = await db.collection('companies').doc(input.companyId).get();
    if (doc.exists) return { id: doc.id, data: doc.data() || {} };
  }

  if (input.transactionId) {
    const byTransaction = await db
      .collection('companies')
      .where('fmgOnboarding.transactionIds', 'array-contains', input.transactionId)
      .limit(1)
      .get();
    const doc = byTransaction.docs[0];
    if (doc) return { id: doc.id, data: doc.data() };
  }

  const email = normalizeEmail(input.customerEmail);
  const byEmail = await db
    .collection('companies')
    .where('fmgOnboarding.customerEmail', '==', email)
    .limit(1)
    .get();
  const emailDoc = byEmail.docs[0];
  if (emailDoc) return { id: emailDoc.id, data: emailDoc.data() };

  const byName = await db
    .collection('companies')
    .where('name', '==', input.companyName)
    .limit(1)
    .get();
  const nameDoc = byName.docs[0];
  return nameDoc ? { id: nameDoc.id, data: nameDoc.data() } : null;
}

async function ensureCompany(input: ActivateSubscriptionInput): Promise<{
  companyId: string;
  companyName: string;
  companyData: FirebaseFirestore.DocumentData;
  created: boolean;
}> {
  const db = getDb();
  const email = normalizeEmail(input.customerEmail);
  const companyName = inferCompanyName(input);
  const user = input.uid ? null : await findUserByEmail(email);
  const uidOrSeed = input.uid || user?.uid || `payment-${shortHash(email)}`;
  const existing = await findCompany({
    companyId: input.companyId,
    transactionId: input.transactionId,
    customerEmail: email,
    companyName,
  });

  const plan = asPlan(input.planId);
  const onboardingPatch = {
    customerEmail: email,
    customerName: input.customerName,
    customerPhone: input.customerPhone || '',
    accountType: input.accountType || 'empresa',
    transactionIds: FieldValue.arrayUnion(input.transactionId),
    lastTransactionId: input.transactionId,
    source: input.source || 'n8n',
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (existing) {
    await db.collection('companies').doc(existing.id).set({
      subscriptionStatus: 'active',
      plan,
      status: 'active',
      ...(input.driveFolderId ? { driveFolderId: input.driveFolderId } : {}),
      ...(input.driveDocsFolderId ? { driveDocsFolderId: input.driveDocsFolderId } : {}),
      ...(input.mondayBoardId ? { mondayBoardId: input.mondayBoardId } : {}),
      ...(input.mondayBoardUrl ? { mondayBoardUrl: input.mondayBoardUrl } : {}),
      fmgOnboarding: onboardingPatch,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const updated = await db.collection('companies').doc(existing.id).get();
    return {
      companyId: existing.id,
      companyName: String(existing.data.name || companyName),
      companyData: updated.data() || existing.data,
      created: false,
    };
  }

  const companyRef = db.collection('companies').doc();
  const inviteCodeBase = generateInviteCode(companyName);
  const domain = inferCompanyDomain(companyName, email, uidOrSeed);
  const company = {
    name: companyName,
    domain,
    inviteCode: `${inviteCodeBase}-${shortHash(email).slice(0, 6)}`,
    driveFolderId: input.driveFolderId || '',
    driveDocsFolderId: input.driveDocsFolderId || '',
    driveSharedWith: [email],
    subscriptionStatus: 'active',
    createdBy: uidOrSeed,
    plan,
    status: 'active',
    ...(input.mondayBoardId ? { mondayBoardId: input.mondayBoardId } : {}),
    ...(input.mondayBoardUrl ? { mondayBoardUrl: input.mondayBoardUrl } : {}),
    fmgOnboarding: {
      customerEmail: email,
      customerName: input.customerName,
      customerPhone: input.customerPhone || '',
      accountType: input.accountType || 'empresa',
      transactionIds: [input.transactionId],
      lastTransactionId: input.transactionId,
      source: input.source || 'n8n',
      createdFromPayment: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await companyRef.set(company);
  const created = await companyRef.get();

  return {
    companyId: companyRef.id,
    companyName,
    companyData: created.data() || company,
    created: true,
  };
}

async function updateUserOrPending(input: ActivateSubscriptionInput & { companyId: string; companyName: string }): Promise<{
  userUid?: string;
  pendingUserId?: string;
  existingUser: boolean;
}> {
  const db = getDb();
  const email = normalizeEmail(input.customerEmail);
  const uid = input.uid || (await findUserByEmail(email))?.uid;
  const now = FieldValue.serverTimestamp();

  const patch = {
    email,
    displayName: input.customerName || null,
    companyId: input.companyId,
    companyName: input.companyName,
    role: 'admin',
    status: 'active',
    onboardingCompleted: true,
    accountType: input.accountType || 'empresa',
    whatsappPhone: input.customerPhone || '',
    subscriptionStatus: 'active',
    plan: asPlan(input.planId),
    lastPaymentTransactionId: input.transactionId,
    updatedAt: now,
  };

  if (uid) {
    await db.collection('users').doc(uid).set({
      uid,
      photoURL: null,
      createdAt: now,
      lastLoginAt: now,
      ...patch,
    }, { merge: true });
    return { userUid: uid, existingUser: true };
  }

  const id = pendingUserId(email);
  await db.collection('pending_users').doc(id).set({
    ...patch,
    id,
    createdAt: now,
    source: input.source || 'n8n',
  }, { merge: true });
  return { pendingUserId: id, existingUser: false };
}

async function writeSubscription(input: ActivateSubscriptionInput & { companyId: string; companyName: string }) {
  const db = getDb();
  const email = normalizeEmail(input.customerEmail);
  const transactionRef = db.collection('payment_transactions').doc(input.transactionId);
  const subscriptionRef = db.collection('subscriptions').doc(input.subscriptionId || input.transactionId);
  const now = FieldValue.serverTimestamp();

  const record = {
    transactionId: input.transactionId,
    orderId: input.orderId || input.transactionId,
    subscriptionId: input.subscriptionId || input.transactionId,
    customerEmail: email,
    customerName: input.customerName,
    customerPhone: input.customerPhone || '',
    companyId: input.companyId,
    companyName: input.companyName,
    planId: input.planId || 'personal',
    planName: input.planName || input.planId || 'Personal',
    amount: input.amount ?? null,
    currency: input.currency || 'MXN',
    status: 'active',
    source: input.source || 'n8n',
    paymentEnvironment: input.paymentEnvironment || '',
    ...(input.mondaySubscriptionItemId ? { mondaySubscriptionItemId: input.mondaySubscriptionItemId } : {}),
    ...(input.driveFolderId ? { driveFolderId: input.driveFolderId } : {}),
    ...(input.driveLink ? { driveLink: input.driveLink } : {}),
    ...(input.mondayBoardId ? { mondayBoardId: input.mondayBoardId } : {}),
    ...(input.mondayBoardUrl ? { mondayBoardUrl: input.mondayBoardUrl } : {}),
    updatedAt: now,
  };

  await transactionRef.set({ ...record, createdAt: now }, { merge: true });
  await subscriptionRef.set({ ...record, currentPeriodStart: now, createdAt: now }, { merge: true });
}

export async function activateSubscription(input: ActivateSubscriptionInput) {
  if (!input.transactionId?.trim()) throw new Error('transactionId es obligatorio');
  if (!input.customerEmail?.trim()) throw new Error('customerEmail es obligatorio');
  if (!input.customerName?.trim()) throw new Error('customerName es obligatorio');

  const company = await ensureCompany(input);
  const user = await updateUserOrPending({
    ...input,
    companyId: company.companyId,
    companyName: company.companyName,
  });

  await writeSubscription({
    ...input,
    companyId: company.companyId,
    companyName: company.companyName,
  });

  return {
    success: true,
    companyId: company.companyId,
    companyName: company.companyName,
    companyCreated: company.created,
    userUid: user.userUid,
    pendingUserId: user.pendingUserId,
    existingUser: user.existingUser,
    subscriptionActive: true,
    transactionId: input.transactionId,
    driveFolderId: input.driveFolderId || company.companyData.driveFolderId || '',
    driveLink: input.driveLink || (company.companyData.driveFolderId ? `https://drive.google.com/drive/folders/${company.companyData.driveFolderId}` : ''),
    mondayBoardId: input.mondayBoardId || company.companyData.mondayBoardId || '',
    mondayBoardUrl: input.mondayBoardUrl || company.companyData.mondayBoardUrl || '',
  };
}

export async function createDriveFolderForOnboarding(input: CreateDriveFolderInput) {
  if (!input.customerEmail?.trim()) throw new Error('customerEmail es obligatorio');
  if (!isDriveConfigured()) throw new Error('Google Drive no esta configurado');

  const email = normalizeEmail(input.customerEmail);
  const activationSeed: ActivateSubscriptionInput = {
    transactionId: input.transactionId || `manual-${shortHash(`${email}:${input.companyName || input.customerName || email}`)}`,
    customerEmail: email,
    customerName: input.customerName || input.companyName || email,
    companyName: input.companyName,
    accountType: input.accountType || 'empresa',
    uid: input.uid,
    companyId: input.companyId,
    source: 'n8n',
  };

  const company = await ensureCompany(activationSeed);
  const db = getDb();
  const companyRef = db.collection('companies').doc(company.companyId);
  const current = (await companyRef.get()).data() || {};

  if (current.driveFolderId) {
    return {
      success: true,
      alreadyExists: true,
      companyId: company.companyId,
      companyName: company.companyName,
      driveFolderId: current.driveFolderId,
      driveDocsFolderId: current.driveDocsFolderId || current.driveFolderId,
      driveLink: `https://drive.google.com/drive/folders/${current.driveFolderId}`,
    };
  }

  const folderStructure = await ensureCompanyDriveFolder(company.companyName);
  await shareFolderWithUser(folderStructure.rootFolderId, email, 'writer');

  let userFolderId = '';
  let userFolderLink = '';
  if (input.customerName) {
    const userFolder = await createUserFolder(folderStructure.rootFolderId, input.customerName);
    userFolderId = userFolder.folderId;
    userFolderLink = userFolder.webViewLink;
    await shareFolderWithUser(userFolder.folderId, email, 'writer');
  }

  await companyRef.set({
    driveFolderId: folderStructure.rootFolderId,
    driveDocsFolderId: folderStructure.docsFolderId,
    driveSharedWith: FieldValue.arrayUnion(email),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  const user = input.uid ? { uid: input.uid } : await findUserByEmail(email);
  if (user?.uid && userFolderId) {
    await db.collection('users').doc(user.uid).set({
      driveFolderId: userFolderId,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  const pendingId = pendingUserId(email);
  await db.collection('pending_users').doc(pendingId).set({
    email,
    displayName: input.customerName || null,
    companyId: company.companyId,
    companyName: company.companyName,
    driveFolderId: userFolderId,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return {
    success: true,
    alreadyExists: false,
    companyId: company.companyId,
    companyName: company.companyName,
    driveFolderId: folderStructure.rootFolderId,
    driveDocsFolderId: folderStructure.docsFolderId,
    driveLink: folderStructure.rootWebViewLink || `https://drive.google.com/drive/folders/${folderStructure.rootFolderId}`,
    userFolderId,
    userFolderLink,
  };
}
