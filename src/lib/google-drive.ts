// Google Drive API Client
// Utiliza Service Account para crear y gestionar carpetas compartidas

import { google, type drive_v3 } from 'googleapis';

// Logger con prefijo para identificar operaciones de Drive
const logDrive = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  console.log(`[DRIVE ${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logDriveError = (message: string, error: unknown) => {
  const timestamp = new Date().toISOString();
  console.error(`[DRIVE ERROR ${timestamp}] ${message}`, error);
};

// Tipos
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

export interface CreateFolderResult {
  folderId: string;
  webViewLink: string;
}

export interface UploadFileResult {
  fileId: string;
  webViewLink: string;
  webContentLink?: string;
}

export interface CompanyFolderStructure {
  rootFolderId: string;
  docsFolderId: string;
  rootWebViewLink: string;
  docsWebViewLink: string;
}

// Configuración
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Obtener cliente de Drive autenticado
function getDriveClient(): drive_v3.Drive {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!serviceAccountEmail || !privateKey) {
    throw new Error(
      'Google Drive no configurado. Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_PRIVATE_KEY'
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: serviceAccountEmail,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  return google.drive({ version: 'v3', auth });
}

// ============================================================================
// CARPETAS
// ============================================================================

/**
 * Crear una carpeta en Drive
 */
export async function createFolder(
  name: string,
  parentFolderId?: string
): Promise<CreateFolderResult> {
  logDrive(`Creando carpeta: "${name}"`, { parentFolderId });

  const drive = getDriveClient();

  const fileMetadata: drive_v3.Schema$File = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    fileMetadata.parents = [parentFolderId];
  } else {
    // Usar carpeta raíz configurada
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (rootFolderId) {
      fileMetadata.parents = [rootFolderId];
      logDrive(`Usando carpeta raíz configurada: ${rootFolderId}`);
    }
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, webViewLink',
  });

  if (!response.data.id) {
    logDriveError(`No se pudo crear la carpeta "${name}"`, { response: response.data });
    throw new Error('No se pudo crear la carpeta');
  }

  const result = {
    folderId: response.data.id,
    webViewLink: response.data.webViewLink || '',
  };

  logDrive(`Carpeta creada exitosamente: "${name}"`, result);
  return result;
}

/**
 * Crear estructura completa de carpetas para una empresa
 */
export async function createCompanyFolderStructure(
  companyName: string
): Promise<CompanyFolderStructure> {
  logDrive(`Iniciando creación de estructura de carpetas para empresa: "${companyName}"`);

  // 1. Crear carpeta raíz de la empresa
  const rootFolder = await createFolder(companyName);

  // 2. Crear subcarpeta "Documentos Empresa"
  const docsFolder = await createFolder('Documentos Empresa', rootFolder.folderId);

  const result = {
    rootFolderId: rootFolder.folderId,
    docsFolderId: docsFolder.folderId,
    rootWebViewLink: rootFolder.webViewLink,
    docsWebViewLink: docsFolder.webViewLink,
  };

  logDrive(`Estructura de carpetas creada para empresa: "${companyName}"`, result);
  return result;
}

/**
 * Crear subcarpeta para un usuario dentro de la carpeta de empresa
 */
export async function createUserFolder(
  parentFolderId: string,
  userName: string
): Promise<CreateFolderResult> {
  logDrive(`Creando carpeta de usuario: "${userName}"`, { parentFolderId });
  const result = await createFolder(userName, parentFolderId);
  logDrive(`Carpeta de usuario creada: "${userName}"`, result);
  return result;
}

/**
 * Asegurar que existe la carpeta de Drive para una empresa
 * Si no existe, crea la estructura completa de carpetas
 * Retorna los IDs de las carpetas (existentes o nuevas)
 */
export async function ensureCompanyDriveFolder(
  companyName: string,
  existingFolderId?: string | null
): Promise<CompanyFolderStructure> {
  // Si ya existe la carpeta, verificar que es accesible
  if (existingFolderId) {
    logDrive(`Verificando carpeta existente de empresa: "${companyName}"`, { existingFolderId });
    try {
      const drive = getDriveClient();
      const response = await drive.files.get({
        fileId: existingFolderId,
        fields: 'id, name, webViewLink',
      });

      if (response.data.id) {
        logDrive(`Carpeta de empresa existe y es accesible`, { folderId: existingFolderId });
        // Retornamos la estructura existente (asumimos que docsFolderId también existe)
        return {
          rootFolderId: existingFolderId,
          docsFolderId: existingFolderId, // Usamos la misma carpeta si no tenemos el docs
          rootWebViewLink: response.data.webViewLink || '',
          docsWebViewLink: response.data.webViewLink || '',
        };
      }
    } catch (error) {
      logDriveError(`Carpeta existente no accesible, creando nueva`, error);
    }
  }

  // Crear nueva estructura de carpetas
  logDrive(`Creando estructura de carpetas para empresa: "${companyName}"`);
  return createCompanyFolderStructure(companyName);
}

// ============================================================================
// PERMISOS
// ============================================================================

/**
 * Compartir carpeta con un email
 */
export async function shareFolderWithUser(
  folderId: string,
  email: string,
  role: 'reader' | 'writer' | 'commenter' = 'writer'
): Promise<void> {
  logDrive(`Compartiendo carpeta con usuario`, { folderId, email, role });

  const drive = getDriveClient();

  try {
    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        type: 'user',
        role,
        emailAddress: email,
      },
      sendNotificationEmail: false, // Evitar spam de notificaciones
    });
    logDrive(`Carpeta compartida exitosamente`, { folderId, email, role });
  } catch (error: unknown) {
    // Si el usuario ya tiene acceso, ignorar el error
    const err = error as { code?: number; message?: string };
    if (err.code === 400 && err.message?.includes('already has access')) {
      logDrive(`Usuario ya tiene acceso a la carpeta`, { folderId, email });
      return;
    }
    logDriveError(`Error compartiendo carpeta`, { folderId, email, error: err });
    throw error;
  }
}

/**
 * Compartir carpeta con múltiples emails
 */
export async function shareFolderWithUsers(
  folderId: string,
  emails: string[],
  role: 'reader' | 'writer' | 'commenter' = 'writer'
): Promise<void> {
  for (const email of emails) {
    await shareFolderWithUser(folderId, email, role);
  }
}

/**
 * Remover acceso de un usuario a una carpeta
 */
export async function removeUserAccess(folderId: string, email: string): Promise<void> {
  const drive = getDriveClient();

  // Obtener permisos actuales
  const permissions = await drive.permissions.list({
    fileId: folderId,
    fields: 'permissions(id, emailAddress)',
  });

  const permission = permissions.data.permissions?.find(
    p => p.emailAddress?.toLowerCase() === email.toLowerCase()
  );

  if (permission?.id) {
    await drive.permissions.delete({
      fileId: folderId,
      permissionId: permission.id,
    });
  }
}

// ============================================================================
// ARCHIVOS
// ============================================================================

/**
 * Subir un archivo a una carpeta
 */
export async function uploadFile(
  folderId: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadFileResult> {
  const drive = getDriveClient();

  // Crear stream desde buffer
  const { Readable } = await import('stream');
  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink, webContentLink',
  });

  if (!response.data.id) {
    throw new Error('No se pudo subir el archivo');
  }

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink || '',
    webContentLink: response.data.webContentLink || undefined,
  };
}

/**
 * Subir un archivo y hacerlo público (solo lectura)
 */
export async function uploadFilePublic(
  folderId: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadFileResult> {
  const result = await uploadFile(folderId, fileBuffer, fileName, mimeType);

  // Hacer el archivo accesible para cualquiera con el link
  const drive = getDriveClient();
  await drive.permissions.create({
    fileId: result.fileId,
    requestBody: {
      type: 'anyone',
      role: 'reader',
    },
  });

  return result;
}

/**
 * Obtener información de un archivo
 */
export async function getFileInfo(fileId: string): Promise<DriveFile | null> {
  const drive = getDriveClient();

  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime, size',
    });

    return {
      id: response.data.id || '',
      name: response.data.name || '',
      mimeType: response.data.mimeType || '',
      webViewLink: response.data.webViewLink || undefined,
      webContentLink: response.data.webContentLink || undefined,
      createdTime: response.data.createdTime || undefined,
      modifiedTime: response.data.modifiedTime || undefined,
      size: response.data.size || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Listar archivos de una carpeta
 */
export async function listFolderFiles(folderId: string): Promise<DriveFile[]> {
  const drive = getDriveClient();

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime, size)',
    orderBy: 'createdTime desc',
  });

  return (response.data.files || []).map(file => ({
    id: file.id || '',
    name: file.name || '',
    mimeType: file.mimeType || '',
    webViewLink: file.webViewLink || undefined,
    webContentLink: file.webContentLink || undefined,
    createdTime: file.createdTime || undefined,
    modifiedTime: file.modifiedTime || undefined,
    size: file.size || undefined,
  }));
}

/**
 * Eliminar un archivo
 */
export async function deleteFile(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}

/**
 * Mover archivo a otra carpeta
 */
export async function moveFile(
  fileId: string,
  newParentFolderId: string
): Promise<void> {
  const drive = getDriveClient();

  // Obtener carpeta actual
  const file = await drive.files.get({
    fileId,
    fields: 'parents',
  });

  const previousParents = file.data.parents?.join(',') || '';

  // Mover archivo
  await drive.files.update({
    fileId,
    addParents: newParentFolderId,
    removeParents: previousParents,
    fields: 'id, parents',
  });
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generar nombre de archivo único con timestamp
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const ext = originalName.split('.').pop() || '';
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  return `${baseName}_${timestamp}.${ext}`;
}

/**
 * Obtener extensión MIME type
 */
export function getMimeTypeExtension(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'application/pdf': 'pdf',
  };
  return mimeMap[mimeType] || 'bin';
}

/**
 * Verificar si Drive está configurado
 */
export function isDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}
