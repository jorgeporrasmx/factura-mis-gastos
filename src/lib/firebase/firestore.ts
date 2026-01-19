// Firestore CRUD operations for Companies, Users, and Expenses

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type DocumentReference,
} from 'firebase/firestore';
import { getFirestoreDb } from './config';
import type {
  Company,
  CreateCompanyData,
  UserProfile,
  CreateUserProfileData,
  CompanyUser,
  UserRole,
} from '@/types/company';
import type {
  Expense,
  ExpenseFilters,
  ExpenseSummary,
  ExpenseSortOptions,
  calculateExpenseSummary,
} from '@/types/expenses';

// ============================================================================
// HELPERS
// ============================================================================

function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

function timestampToDate(timestamp: Timestamp | null | undefined): Date {
  return timestamp?.toDate() ?? new Date();
}

// ============================================================================
// COMPANIES
// ============================================================================

/**
 * Crear una nueva empresa
 */
export async function createCompany(data: CreateCompanyData): Promise<Company> {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore no disponible');

  const companyRef = doc(collection(db, 'companies'));
  const now = new Date();

  const company: Company = {
    id: companyRef.id,
    name: data.name,
    domain: data.domain.toLowerCase(),
    rfc: data.rfc,
    driveFolderId: '', // Se actualiza después de crear la carpeta
    driveDocsFolderId: '',
    driveSharedWith: [data.adminEmail],
    createdAt: now,
    updatedAt: now,
    createdBy: data.adminUid,
    plan: 'personal',
    status: 'active',
  };

  await setDoc(companyRef, {
    ...company,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return company;
}

/**
 * Obtener empresa por ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  const db = getFirestoreDb();
  if (!db) return null;

  const docRef = doc(db, 'companies', companyId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as Company;
}

/**
 * Buscar empresa por dominio de email
 */
export async function getCompanyByDomain(domain: string): Promise<Company | null> {
  const db = getFirestoreDb();
  if (!db) return null;

  const q = query(
    collection(db, 'companies'),
    where('domain', '==', domain.toLowerCase()),
    where('status', '==', 'active'),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();

  return {
    ...data,
    id: docSnap.id,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as Company;
}

/**
 * Actualizar empresa
 */
export async function updateCompany(
  companyId: string,
  updates: Partial<Omit<Company, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore no disponible');

  const docRef = doc(db, 'companies', companyId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Actualizar IDs de carpetas de Drive de la empresa
 */
export async function updateCompanyDriveFolders(
  companyId: string,
  driveFolderId: string,
  driveDocsFolderId: string
): Promise<void> {
  await updateCompany(companyId, {
    driveFolderId,
    driveDocsFolderId,
  });
}

// ============================================================================
// USER PROFILES
// ============================================================================

/**
 * Crear perfil de usuario
 */
export async function createUserProfile(data: CreateUserProfileData): Promise<UserProfile> {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore no disponible');

  const now = new Date();

  const profile: UserProfile = {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    companyId: null,
    role: 'user',
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    status: 'pending',
  };

  const docRef = doc(db, 'users', data.uid);
  await setDoc(docRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  return profile;
}

/**
 * Obtener perfil de usuario por UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirestoreDb();
  if (!db) return null;

  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    uid: docSnap.id,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    lastLoginAt: timestampToDate(data.lastLoginAt),
    csfUploadedAt: data.csfUploadedAt ? timestampToDate(data.csfUploadedAt) : undefined,
  } as UserProfile;
}

/**
 * Actualizar perfil de usuario
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore no disponible');

  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Actualizar último login
 */
export async function updateLastLogin(uid: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    lastLoginAt: serverTimestamp(),
  });
}

/**
 * Vincular usuario a empresa
 */
export async function linkUserToCompany(
  uid: string,
  companyId: string,
  companyName: string,
  role: UserRole = 'user',
  driveFolderId?: string
): Promise<void> {
  await updateUserProfile(uid, {
    companyId,
    companyName,
    role,
    driveFolderId,
    status: 'active',
    onboardingCompleted: true,
    accountType: role === 'admin' ? 'empresa' : 'empleado',
  });
}

/**
 * Completar onboarding de usuario
 */
export async function completeOnboarding(
  uid: string,
  accountType: 'empresa' | 'empleado' | 'personal'
): Promise<void> {
  await updateUserProfile(uid, {
    onboardingCompleted: true,
    accountType,
    status: 'active',
  });
}

/**
 * Obtener usuarios de una empresa
 */
export async function getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
  const db = getFirestoreDb();
  if (!db) return [];

  const q = query(
    collection(db, 'users'),
    where('companyId', '==', companyId),
    orderBy('displayName')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      uid: docSnap.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      role: data.role,
      status: data.status,
      driveFolderId: data.driveFolderId,
      createdAt: timestampToDate(data.createdAt),
      lastLoginAt: timestampToDate(data.lastLoginAt),
    } as CompanyUser;
  });
}

/**
 * Cambiar rol de usuario en empresa
 */
export async function changeUserRole(uid: string, newRole: UserRole): Promise<void> {
  await updateUserProfile(uid, { role: newRole });
}

// ============================================================================
// EXPENSES
// ============================================================================

/**
 * Obtener gastos con filtros y paginación
 */
export async function getExpenses(
  companyId: string,
  filters?: ExpenseFilters,
  sort?: ExpenseSortOptions,
  pageLimit: number = 20,
  lastDocId?: string
): Promise<{ expenses: Expense[]; hasMore: boolean; lastId: string | null }> {
  const db = getFirestoreDb();
  if (!db) return { expenses: [], hasMore: false, lastId: null };

  const expensesRef = collection(db, 'companies', companyId, 'expenses');
  const constraints: QueryConstraint[] = [];

  // Aplicar filtros
  if (filters?.userId) {
    constraints.push(where('userId', '==', filters.userId));
  }
  if (filters?.estado) {
    constraints.push(where('estado', '==', filters.estado));
  }
  if (filters?.categoria) {
    constraints.push(where('categoria', '==', filters.categoria));
  }
  if (filters?.fechaDesde) {
    constraints.push(where('fecha', '>=', dateToTimestamp(filters.fechaDesde)));
  }
  if (filters?.fechaHasta) {
    constraints.push(where('fecha', '<=', dateToTimestamp(filters.fechaHasta)));
  }

  // Ordenamiento
  const sortField = sort?.field || 'fecha';
  const sortDirection = sort?.direction || 'desc';
  constraints.push(orderBy(sortField, sortDirection));

  // Límite + 1 para saber si hay más
  constraints.push(limit(pageLimit + 1));

  // Paginación
  if (lastDocId) {
    const lastDocRef = doc(db, 'companies', companyId, 'expenses', lastDocId);
    const lastDocSnap = await getDoc(lastDocRef);
    if (lastDocSnap.exists()) {
      constraints.push(startAfter(lastDocSnap));
    }
  }

  const q = query(expensesRef, ...constraints);
  const snapshot = await getDocs(q);

  const expenses: Expense[] = [];
  let lastId: string | null = null;

  const docsToProcess = snapshot.docs.slice(0, pageLimit);

  docsToProcess.forEach(docSnap => {
    const data = docSnap.data();
    expenses.push({
      ...data,
      id: docSnap.id,
      fecha: timestampToDate(data.fecha),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      syncedAt: timestampToDate(data.syncedAt),
    } as Expense);
    lastId = docSnap.id;
  });

  return {
    expenses,
    hasMore: snapshot.docs.length > pageLimit,
    lastId,
  };
}

/**
 * Obtener todos los gastos de una empresa (para resumen)
 */
export async function getAllExpenses(companyId: string): Promise<Expense[]> {
  const db = getFirestoreDb();
  if (!db) return [];

  const expensesRef = collection(db, 'companies', companyId, 'expenses');
  const snapshot = await getDocs(expensesRef);

  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      fecha: timestampToDate(data.fecha),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      syncedAt: timestampToDate(data.syncedAt),
    } as Expense;
  });
}

/**
 * Obtener resumen de gastos
 */
export async function getExpenseSummary(
  companyId: string,
  userId?: string
): Promise<ExpenseSummary> {
  const db = getFirestoreDb();
  if (!db) {
    return {
      total: 0,
      pendientes: 0,
      enProceso: 0,
      facturados: 0,
      rechazados: 0,
      montoTotal: 0,
      montoFacturado: 0,
      montoPendiente: 0,
      montoRechazado: 0,
    };
  }

  let expenses: Expense[];

  if (userId) {
    // Solo gastos de un usuario específico
    const result = await getExpenses(companyId, { userId }, undefined, 1000);
    expenses = result.expenses;
  } else {
    // Todos los gastos de la empresa
    expenses = await getAllExpenses(companyId);
  }

  // Importar la función de cálculo
  const { calculateExpenseSummary } = await import('@/types/expenses');
  return calculateExpenseSummary(expenses);
}

/**
 * Crear o actualizar gasto (upsert)
 */
export async function upsertExpense(companyId: string, expense: Expense): Promise<void> {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore no disponible');

  const docRef = doc(db, 'companies', companyId, 'expenses', expense.mondayItemId);

  await setDoc(docRef, {
    ...expense,
    fecha: dateToTimestamp(expense.fecha),
    createdAt: dateToTimestamp(expense.createdAt),
    updatedAt: serverTimestamp(),
    syncedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Upsert múltiples gastos (batch)
 */
export async function upsertExpenses(
  companyId: string,
  expenses: Expense[]
): Promise<{ created: number; updated: number }> {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore no disponible');

  let created = 0;
  let updated = 0;

  // Firestore batch tiene límite de 500 operaciones
  const BATCH_SIZE = 500;

  for (let i = 0; i < expenses.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = expenses.slice(i, i + BATCH_SIZE);

    for (const expense of chunk) {
      const docRef = doc(db, 'companies', companyId, 'expenses', expense.mondayItemId);
      const existing = await getDoc(docRef);

      const docData = {
        ...expense,
        fecha: dateToTimestamp(expense.fecha),
        createdAt: existing.exists()
          ? existing.data().createdAt
          : dateToTimestamp(expense.createdAt),
        updatedAt: serverTimestamp(),
        syncedAt: serverTimestamp(),
      };

      if (existing.exists()) {
        batch.update(docRef, docData);
        updated++;
      } else {
        batch.set(docRef, docData);
        created++;
      }
    }

    await batch.commit();
  }

  return { created, updated };
}

/**
 * Obtener gasto por ID
 */
export async function getExpenseById(
  companyId: string,
  expenseId: string
): Promise<Expense | null> {
  const db = getFirestoreDb();
  if (!db) return null;

  const docRef = doc(db, 'companies', companyId, 'expenses', expenseId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    fecha: timestampToDate(data.fecha),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    syncedAt: timestampToDate(data.syncedAt),
  } as Expense;
}

/**
 * Eliminar gasto
 */
export async function deleteExpense(companyId: string, expenseId: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore no disponible');

  const docRef = doc(db, 'companies', companyId, 'expenses', expenseId);
  await deleteDoc(docRef);
}

// ============================================================================
// SYNC METADATA
// ============================================================================

/**
 * Actualizar metadata de última sincronización de empresa
 */
export async function updateCompanySyncMetadata(
  companyId: string,
  syncResult: { itemsSynced: number; success: boolean }
): Promise<void> {
  await updateCompany(companyId, {
    // Campos adicionales que se pueden agregar al tipo Company si es necesario
  });

  // También actualizar en una subcolección de logs si se desea
  const db = getFirestoreDb();
  if (!db) return;

  const logRef = doc(collection(db, 'companies', companyId, 'sync_logs'));
  await setDoc(logRef, {
    timestamp: serverTimestamp(),
    itemsSynced: syncResult.itemsSynced,
    success: syncResult.success,
  });
}
