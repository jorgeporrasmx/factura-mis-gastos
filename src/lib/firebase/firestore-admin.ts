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

  await companyRef.set({
    ...company,
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
