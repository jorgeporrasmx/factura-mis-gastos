// API para crear carpeta de Drive para una empresa
// POST /api/drive/create-folder - Crear carpeta de empresa en Drive

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  getCompanyByIdAdmin,
  updateCompanyDriveFoldersAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  isDriveConfigured,
  ensureCompanyDriveFolder,
  shareFolderWithUser,
} from '@/lib/google-drive';

export async function POST(request: NextRequest) {
  try {
    // Verificar que Drive está configurado
    if (!isDriveConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Google Drive no está configurado' },
        { status: 503 }
      );
    }

    // Obtener UID del header
    const uid = request.headers.get('x-user-uid');

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener perfil del usuario
    const userProfile = await getUserProfileAdmin(uid);

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que tiene empresa
    if (!userProfile.companyId) {
      return NextResponse.json(
        { success: false, error: 'Debes pertenecer a una empresa para crear una carpeta de Drive' },
        { status: 400 }
      );
    }

    // Verificar que es admin
    if (userProfile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Solo los administradores pueden crear la carpeta de Drive' },
        { status: 403 }
      );
    }

    // Obtener empresa
    const company = await getCompanyByIdAdmin(userProfile.companyId);

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si ya tiene carpeta de Drive
    if (company.driveFolderId) {
      return NextResponse.json(
        {
          success: true,
          message: 'La empresa ya tiene una carpeta de Drive',
          alreadyExists: true,
          driveFolderId: company.driveFolderId,
          driveLink: `https://drive.google.com/drive/folders/${company.driveFolderId}`,
        }
      );
    }

    // Crear estructura de carpetas
    console.log('[API/drive/create-folder] Creando carpeta de Drive para empresa:', {
      companyId: company.id,
      companyName: company.name,
    });

    const folderStructure = await ensureCompanyDriveFolder(company.name);

    // Actualizar la empresa con los IDs de las carpetas
    await updateCompanyDriveFoldersAdmin(
      company.id,
      folderStructure.rootFolderId,
      folderStructure.docsFolderId
    );

    // Compartir la carpeta con el admin que la creó
    await shareFolderWithUser(folderStructure.rootFolderId, userProfile.email, 'writer');

    console.log('[API/drive/create-folder] Carpeta creada exitosamente:', {
      companyId: company.id,
      driveFolderId: folderStructure.rootFolderId,
    });

    return NextResponse.json({
      success: true,
      message: 'Carpeta de Drive creada exitosamente',
      driveFolderId: folderStructure.rootFolderId,
      driveDocsFolderId: folderStructure.docsFolderId,
      driveLink: folderStructure.rootWebViewLink || `https://drive.google.com/drive/folders/${folderStructure.rootFolderId}`,
    });
  } catch (error) {
    console.error('[API/drive/create-folder] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear la carpeta de Drive',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
