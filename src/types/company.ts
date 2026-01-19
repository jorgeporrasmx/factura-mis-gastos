// Tipos para Empresas y Usuarios con Roles

// Plan de suscripción de la empresa
export type CompanyPlan = 'personal' | 'equipos' | 'empresa' | 'corporativo';

// Estado de la empresa
export type CompanyStatus = 'active' | 'suspended' | 'cancelled';

// Roles de usuario dentro de una empresa
export type UserRole = 'admin' | 'user';

// Estado del usuario
export type UserStatus = 'active' | 'pending' | 'suspended';

// Empresa/Organización
export interface Company {
  id: string;
  name: string;                    // "Acme Corp"
  domain: string;                  // "acme.com" (para vinculación automática)
  rfc?: string;                    // RFC de la empresa

  // Google Drive
  driveFolderId: string;           // ID carpeta raíz en Drive
  driveDocsFolderId: string;       // ID subcarpeta "Documentos Empresa"
  driveSharedWith: string[];       // Emails con acceso a la carpeta

  // Monday.com
  mondayBoardId?: string;          // Board de facturas de esta empresa

  // Documentos de la empresa
  csfUrl?: string;                 // URL de la Constancia Fiscal en Drive
  csfDriveId?: string;             // ID del archivo CSF en Drive
  cedulaUrl?: string;              // URL de la Cédula fiscal en Drive
  cedulaDriveId?: string;          // ID del archivo Cédula en Drive

  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;               // UID del admin que la creó
  plan: CompanyPlan;
  status: CompanyStatus;
}

// Datos para crear una empresa
export interface CreateCompanyData {
  name: string;
  domain: string;
  rfc?: string;
  adminEmail: string;
  adminUid: string;
  adminName: string;
}

// Usuario extendido con empresa y rol
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;

  // Vinculación a empresa
  companyId: string | null;        // null si es cuenta personal sin empresa
  companyName?: string;            // Nombre de la empresa (desnormalizado para UI)
  role: UserRole;

  // Google Drive
  driveFolderId?: string;          // Carpeta personal dentro de la empresa

  // Constancia de Situación Fiscal (CSF) - para freelancers/personales
  csfUrl?: string;                 // URL del archivo en Firebase Storage
  csfStoragePath?: string;         // Path en Firebase Storage
  csfFileName?: string;            // Nombre original del archivo
  csfUploadedAt?: Date;            // Fecha de subida

  // Estado de onboarding
  onboardingCompleted: boolean;
  accountType?: 'empresa' | 'empleado' | 'personal';

  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  status: UserStatus;
}

// Datos para crear/actualizar perfil de usuario
export interface CreateUserProfileData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

// Resultado de búsqueda de empresa por dominio
export interface CompanyLookupResult {
  found: boolean;
  company?: Company;
  message?: string;
}

// Usuario dentro de una empresa (para listados de admin)
export interface CompanyUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  driveFolderId?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// Helpers para extraer dominio del email
export function extractDomainFromEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) {
    throw new Error('Email inválido');
  }
  return parts[1].toLowerCase();
}

// Verificar si es un dominio de email público (no empresarial)
const PUBLIC_EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'live.com',
  'icloud.com',
  'me.com',
  'protonmail.com',
  'proton.me',
  'aol.com',
  'mail.com',
  'zoho.com',
];

export function isPublicEmailDomain(domain: string): boolean {
  return PUBLIC_EMAIL_DOMAINS.includes(domain.toLowerCase());
}

// Verificar si el email puede vincularse automáticamente a una empresa
export function canAutoJoinCompany(email: string): boolean {
  const domain = extractDomainFromEmail(email);
  return !isPublicEmailDomain(domain);
}

// Generar un dominio único para empresas con emails públicos
export function generateUniqueCompanyDomain(companyName: string, adminUid: string): string {
  // Normalizar nombre de empresa: quitar espacios, acentos, caracteres especiales
  const normalized = companyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]/g, '-') // Reemplazar caracteres especiales con guión
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .replace(/^-|-$/g, ''); // Quitar guiones al inicio/final

  // Usar primeros 6 caracteres del UID para hacerlo único
  const uniqueSuffix = adminUid.slice(0, 6);

  return `${normalized}-${uniqueSuffix}.personal`;
}
