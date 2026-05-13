// API para verificar el estado de la conexión con Google Drive
// GET /api/drive/status - Verificar configuración y conexión

import { NextResponse } from 'next/server';
import { isDriveConfigured } from '@/lib/google-drive';

interface DriveStatusResponse {
  configured: boolean;
  connected: boolean;
  serviceAccountEmail?: string;
  rootFolderId?: string;
  error?: string;
  rootFolderName?: string;
  rootFolderLink?: string;
  message?: string;
  diagnosis?: string;
  operationalBypass?: {
    available: boolean;
    summary: string;
    steps: string[];
  };
}

export async function GET() {
  const status: DriveStatusResponse = {
    configured: false,
    connected: false,
  };

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  status.configured = isDriveConfigured();
  status.serviceAccountEmail = serviceAccountEmail
    ? `${serviceAccountEmail.substring(0, 10)}...`
    : undefined;
  status.rootFolderId = rootFolderId
    ? `${rootFolderId.substring(0, 6)}...${rootFolderId.substring(rootFolderId.length - 4)}`
    : undefined;

  const operationalBypass = {
    available: true,
    summary:
      'Si Drive no valida hoy, el servicio puede operar con una carpeta manual compartida con la service account y validación manual antes de invitar usuarios.',
    steps: [
      'Crear o elegir una carpeta de Google Drive para el cliente inicial.',
      'Compartirla con el correo de la service account como Editor.',
      'Confirmar acceso desde este endpoint antes del onboarding.',
      'Registrar el folder ID correcto en GOOGLE_DRIVE_ROOT_FOLDER_ID o en la empresa correspondiente.',
    ],
  };

  if (!status.configured) {
    return NextResponse.json({
      ...status,
      error: 'Google Drive no está configurado. Faltan variables de entorno.',
      diagnosis: 'Faltan credenciales base del service account o la llave privada.',
      operationalBypass,
      missingVars: {
        GOOGLE_SERVICE_ACCOUNT_EMAIL: !serviceAccountEmail,
        GOOGLE_PRIVATE_KEY: !privateKey,
        GOOGLE_DRIVE_ROOT_FOLDER_ID: !rootFolderId ? '(requerido para cuentas personales y bypass operativo)' : false,
      },
    });
  }

  try {
    const { google } = await import('googleapis');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    if (rootFolderId) {
      const folderInfo = await drive.files.get({
        fileId: rootFolderId,
        fields: 'id, name, mimeType, webViewLink, driveId',
        supportsAllDrives: true,
      });

      status.connected = true;
      return NextResponse.json({
        ...status,
        rootFolderName: folderInfo.data.name || undefined,
        rootFolderLink: folderInfo.data.webViewLink || undefined,
        message: 'Google Drive conectado correctamente',
        diagnosis: folderInfo.data.driveId
          ? 'La carpeta raíz responde como parte de un Shared Drive o unidad compartida.'
          : 'La carpeta raíz responde correctamente con la service account actual.',
        operationalBypass,
      });
    }

    await drive.files.list({
      pageSize: 1,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    status.connected = true;
    return NextResponse.json({
      ...status,
      message: 'Google Drive conectado correctamente (sin carpeta raíz configurada)',
      diagnosis: 'La autenticación funciona, pero falta definir carpeta raíz para operación del servicio.',
      operationalBypass,
    });
  } catch (error) {
    const err = error as Error & { code?: number };
    console.error('[API/drive/status] Error conectando con Drive:', err);

    const isRootFolderIssue =
      err.code === 404 ||
      err.message?.includes('File not found') ||
      err.message?.includes('notFound');

    return NextResponse.json(
      {
        ...status,
        connected: false,
        error: err.message || 'Error desconocido al conectar con Google Drive',
        diagnosis: isRootFolderIssue
          ? 'El root folder configurado no existe para esta service account o no está compartido con ella.'
          : 'La autenticación respondió con error. Revisar credenciales, permisos de Drive API o acceso a la carpeta raíz.',
        operationalBypass,
      },
      { status: 500 }
    );
  }
}
