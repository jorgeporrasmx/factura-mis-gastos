// API para probar la creación de carpetas en Google Drive
// POST /api/drive/test - Crear carpeta de prueba
// DELETE /api/drive/test - Eliminar carpeta de prueba

import { NextRequest, NextResponse } from 'next/server';
import {
  createFolder,
  deleteFile,
  isDriveConfigured,
  getFileInfo,
} from '@/lib/google-drive';

export async function POST(request: NextRequest) {
  if (!isDriveConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Google Drive no está configurado',
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const folderName = body.folderName || `_test_${Date.now()}`;

    console.log('[API/drive/test] Creando carpeta de prueba:', folderName);

    const folder = await createFolder(folderName);

    console.log('[API/drive/test] Carpeta de prueba creada:', folder);

    return NextResponse.json({
      success: true,
      message: 'Carpeta de prueba creada exitosamente',
      folder: {
        id: folder.folderId,
        name: folderName,
        webViewLink: folder.webViewLink,
      },
      note: 'Puedes eliminar esta carpeta con DELETE /api/drive/test?folderId=' + folder.folderId,
    });
  } catch (error) {
    const err = error as Error;
    console.error('[API/drive/test] Error creando carpeta de prueba:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Error al crear carpeta de prueba',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isDriveConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Google Drive no está configurado',
      },
      { status: 400 }
    );
  }

  const folderId = request.nextUrl.searchParams.get('folderId');

  if (!folderId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Falta parámetro folderId',
      },
      { status: 400 }
    );
  }

  try {
    // Verificar que la carpeta existe
    const fileInfo = await getFileInfo(folderId);

    if (!fileInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Carpeta no encontrada',
        },
        { status: 404 }
      );
    }

    console.log('[API/drive/test] Eliminando carpeta:', folderId, fileInfo.name);

    await deleteFile(folderId);

    return NextResponse.json({
      success: true,
      message: `Carpeta "${fileInfo.name}" eliminada exitosamente`,
    });
  } catch (error) {
    const err = error as Error;
    console.error('[API/drive/test] Error eliminando carpeta:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Error al eliminar carpeta',
      },
      { status: 500 }
    );
  }
}

// GET para verificar una carpeta específica
export async function GET(request: NextRequest) {
  if (!isDriveConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Google Drive no está configurado',
      },
      { status: 400 }
    );
  }

  const folderId = request.nextUrl.searchParams.get('folderId');

  if (!folderId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Falta parámetro folderId',
      },
      { status: 400 }
    );
  }

  try {
    const fileInfo = await getFileInfo(folderId);

    if (!fileInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Carpeta no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      folder: fileInfo,
    });
  } catch (error) {
    const err = error as Error;
    console.error('[API/drive/test] Error obteniendo info de carpeta:', err);

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Error al obtener información de carpeta',
      },
      { status: 500 }
    );
  }
}
