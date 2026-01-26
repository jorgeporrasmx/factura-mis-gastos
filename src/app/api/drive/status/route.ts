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
  testFolderCreated?: boolean;
  testFolderId?: string;
}

export async function GET() {
  const status: DriveStatusResponse = {
    configured: false,
    connected: false,
  };

  // Verificar si las variables de entorno están configuradas
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  status.configured = isDriveConfigured();
  status.serviceAccountEmail = serviceAccountEmail
    ? `${serviceAccountEmail.substring(0, 10)}...`
    : undefined;
  status.rootFolderId = rootFolderId || undefined;

  if (!status.configured) {
    return NextResponse.json({
      ...status,
      error: 'Google Drive no está configurado. Faltan variables de entorno.',
      missingVars: {
        GOOGLE_SERVICE_ACCOUNT_EMAIL: !serviceAccountEmail,
        GOOGLE_PRIVATE_KEY: !privateKey,
        GOOGLE_DRIVE_ROOT_FOLDER_ID: !rootFolderId ? '(opcional)' : false,
      },
    });
  }

  // Intentar conectarse y verificar permisos
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

    // Verificar que podemos acceder a la carpeta raíz (si está configurada)
    if (rootFolderId) {
      const folderInfo = await drive.files.get({
        fileId: rootFolderId,
        fields: 'id, name, mimeType, webViewLink',
      });

      status.connected = true;
      return NextResponse.json({
        ...status,
        rootFolderName: folderInfo.data.name,
        rootFolderLink: folderInfo.data.webViewLink,
        message: 'Google Drive conectado correctamente',
      });
    }

    // Si no hay carpeta raíz, intentar listar archivos para verificar conexión
    await drive.files.list({
      pageSize: 1,
      fields: 'files(id, name)',
    });

    status.connected = true;
    return NextResponse.json({
      ...status,
      message: 'Google Drive conectado correctamente (sin carpeta raíz configurada)',
    });
  } catch (error) {
    const err = error as Error;
    console.error('[API/drive/status] Error conectando con Drive:', err);

    return NextResponse.json(
      {
        ...status,
        connected: false,
        error: err.message || 'Error desconocido al conectar con Google Drive',
      },
      { status: 500 }
    );
  }
}
