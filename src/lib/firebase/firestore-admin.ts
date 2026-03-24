// Firestore operations using Admin SDK (for server-side use only)
import { getAdminFirestore } from './admin';
import { FieldValue } from 'firebase-admin/firestore';
import type {
  UserProfile,
  CreateUserProfileData,
  Company,
  CreateCompanyData,
  UserRole,
} from '@/types/company';
import type {
  Expense,
  ExpenseFilters,
  ExpenseSummary,
  ExpenseSortOptions,
} from '@/types/expenses';

// ============================================================================
// USER PROFILE OPERATIONS (Admin)
// ============================================================================

/**
 * Get user profile by UID (Admin)
 */
export async function getUserProfileAdmin(uid: string): Promise<UserProfile | null> {
  const db = getAdminFirestore();
  if (!db) {
    console.error('Firestore Admin no disponible');
    return null;
  }

  try {
    const docRef = db.collection('users').doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return null;

    const data = docSnap.data();
    if (!data) return null;

    return {
      ...data,
      uid: docSnap.id,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
      lastLoginAt: data.lastLoginAt?.toDate() ?? new Date(),
      csfUploadedAt: data.csfUploadedAt?.toDate(),
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile (Admin):', error);
    return null;
  }
}

/**
 * Create user profile (Admin)
 */
export async function createUserProfileAdmin(data: CreateUserProfileData): Promise<UserProfile> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

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

  const docRef = db.collection('users').doc(data.uid);
  await docRef.set({
    ...profile,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastLoginAt: FieldValue.serverTimestamp(),
  });

  return profile;
}

/**
 * Update user profile (Admin)
 */
export async function updateUserProfileAdmin(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

  const docRef = db.collection('users').doc(uid);
  await docRef.update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// ============================================================================
// COMPANY OPERATIONS (Admin)
// ============================================================================

/**
 * Get company by ID (Admin)
 */
export async function getCompanyByIdAdmin(companyId: string): Promise<Company | null> {
  const db = getAdminFirestore();
  if (!db) {
    console.error('Firestore Admin no disponible');
    return null;
  }

  try {
    const docRef = db.collection('companies').doc(companyId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return null;

    const data = docSnap.data();
    if (!data) return null;

    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    } as Company;
  } catch (error) {
    console.error('Error getting company (Admin):', error);
    return null;
  }
}

/**
 * Update company (Admin) - General purpose update
 */
export async function updateCompanyAdmin(
  companyId: string,
  updates: Partial<Omit<Company, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

  const docRef = db.collection('companies').doc(companyId);
  await docRef.update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Update company Drive folder IDs (Admin)
 */
export async function updateCompanyDriveFoldersAdmin(
  companyId: string,
  driveFolderId: string,
  driveDocsFolderId: string
): Promise<void> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

  const docRef = db.collection('companies').doc(companyId);
  await docRef.update({
    driveFolderId,
    driveDocsFolderId,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Create a new company (Admin)
 */
export async function createCompanyAdmin(data: CreateCompanyData): Promise<Company> {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firestore Admin no disponible');

  const companyRef = db.collection('companies').doc();
  const now = new Date();

  const company: Company = {
    id: companyRef.id,
    name: data.name,
    domain: data.domain.toLowerCase(),
    ...(data.rfc ? { rfc: data.rfc } : {}),
    driveFolderId: '', // Se actualiza después de crear la carpeta
    driveDocsFolderId: '',
    driveSharedWith: [data.adminEmail],
    subscriptionStatus: 'none', // Sin suscripción hasta que pague o active prueba
    createdAt: now,
    updatedAt: now,
    createdBy: data.adminUid,
    plan: 'personal',
    status: 'active',
  };

  // Filter out undefined values before writing to Firestore
  const firestoreData = Object.fromEntries(
    Object.entries(company).filter(([, v]) => v !== undefined)
  );

  await companyRef.set({
    ...firestoreData,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return company;
}

/**
 * Get company by domain (Admin)
 */
export async function getCompanyByDomainAdmin(domain: string): Promise<Company | null> {
  const db = getAdminFirestore();
  if (!db) {
    console.error('Firestore Admin no disponible');
    return null;
  }

  try {
    const snapshot = await db
      .collection('companies')
      .where('domain', '==', domain.toLowerCase())
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();

    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    } as Company;
  } catch (error) {
    console.error('Error getting company by domain (Admin):', error);
    return null;
  }
}

/**
 * Link user to company (Admin)
 */
export async function linkUserToCompanyAdmin(
  uid: string,
  companyId: string,
  companyName: string,
  role: UserRole = 'user',
  driveFolderId?: string
): Promise<void> {
  await updateUserProfileAdmin(uid, {
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
 * Complete onboarding for a user (Admin)
 */
export async function completeOnboardingAdmin(
  uid: string,
  accountType: 'empresa' | 'empleado' | 'personal'
): Promise<void> {
  await updateUserProfileAdmin(uid, {
    onboardingCompleted: true,
    accountType,
    status: 'active',
  });
}

// ============================================================================
// EXPENSE OPERATIONS (Admin)
// ============================================================================

/**
 * Helper para convertir Timestamp de Admin a Date
 */
function timestampToDate(timestamp: FirebaseFirestore.Timestamp | null | undefined): Date {
  return timestamp?.toDate() ?? new Date();
}

/**
 * Obtener gastos con filtros y paginación (Admin)
 */
export async function getExpensesAdmin(
  companyId: string,
  filters?: ExpenseFilters,
  sort?: ExpenseSortOptions,
  pageLimit: number = 20,
  lastDocId?: string
): Promise<{ expenses: Expense[]; hasMore: boolean; lastId: string | null }> {
  const db = getAdminFirestore();
  if (!db) return { expenses: [], hasMore: false, lastId: null };

  try {
    let query: FirebaseFirestore.Query = db
      .collection('companies')
      .doc(companyId)
      .collection('expenses');

    // Aplicar filtros
    if (filters?.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    if (filters?.estado) {
      query = query.where('estado', '==', filters.estado);
    }
    if (filters?.categoria) {
      query = query.where('categoria', '==', filters.categoria);
    }
    if (filters?.fechaDesde) {
      query = query.where('fecha', '>=', filters.fechaDesde);
    }
    if (filters?.fechaHasta) {
      query = query.where('fecha', '<=', filters.fechaHasta);
    }

    // Ordenamiento
    const sortField = sort?.field || 'fecha';
    const sortDirection = sort?.direction || 'desc';
    query = query.orderBy(sortField, sortDirection);

    // Paginación - obtener documento cursor
    if (lastDocId) {
      const lastDocRef = db
        .collection('companies')
        .doc(companyId)
        .collection('expenses')
        .doc(lastDocId);
      const lastDocSnap = await lastDocRef.get();
      if (lastDocSnap.exists) {
        query = query.startAfter(lastDocSnap);
      }
    }

    // Límite + 1 para saber si hay más
    query = query.limit(pageLimit + 1);

    const snapshot = await query.get();

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
  } catch (error) {
    console.error('Error getting expenses (Admin):', error);
    return { expenses: [], hasMore: false, lastId: null };
  }
}

/**
 * Obtener todos los gastos de una empresa (Admin)
 */
export async function getAllExpensesAdmin(companyId: string): Promise<Expense[]> {
  const db = getAdminFirestore();
  if (!db) return [];

  try {
    const snapshot = await db
      .collection('companies')
      .doc(companyId)
      .collection('expenses')
      .get();

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
  } catch (error) {
    console.error('Error getting all expenses (Admin):', error);
    return [];
  }
}

/**
 * Obtener resumen de gastos (Admin)
 */
export async function getExpenseSummaryAdmin(
  companyId: string,
  userId?: string
): Promise<ExpenseSummary> {
  const emptySummary: ExpenseSummary = {
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

  try {
    let expenses: Expense[];

    if (userId) {
      // Solo gastos de un usuario específico
      const result = await getExpensesAdmin(companyId, { userId }, undefined, 1000);
      expenses = result.expenses;
    } else {
      // Todos los gastos de la empresa
      expenses = await getAllExpensesAdmin(companyId);
    }

    // Importar la función de cálculo
    const { calculateExpenseSummary } = await import('@/types/expenses');
    return calculateExpenseSummary(expenses);
  } catch (error) {
    console.error('Error getting expense summary (Admin):', error);
    return emptySummary;
  }
}
