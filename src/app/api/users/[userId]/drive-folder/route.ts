// API para crear carpeta personal de Drive para un usuario
// POST /api/users/[userId]/drive-folder - Crear carpeta personal en Drive

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  getCompanyByIdAdmin,
  updateUserProfileAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  isDriveConfigured,
  createUserFolder,
  shareFolderWithUser,
} from '@/lib/google-drive';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Verificar que Drive está configurado
    if (!isDriveConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Google Drive no está configurado' },
        { status: 503 }
      );
    }

    // Verificar autorización - el header debe coincidir con el userId
    const requestingUid = request.headers.get('x-user-uid');

    if (!requestingUid || requestingUid !== userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener perfil del usuario
    const userProfile = await getUserProfileAdmin(userId);

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya tiene carpeta de Drive
    if (userProfile.driveFolderId) {
      return NextResponse.json({
        success: true,
        message: 'Ya tienes una carpeta personal de Drive',
        alreadyExists: true,
        driveFolderId: userProfile.driveFolderId,
        driveLink: `https://drive.google.com/drive/folders/${userProfile.driveFolderId}`,
      });
    }

    // Verificar que tiene empresa
    if (!userProfile.companyId) {
      return NextResponse.json(
        { success: false, error: 'Debes pertenecer a una empresa para crear una carpeta de Drive' },
        { status: 400 }
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

    // Verificar que la empresa tiene carpeta de Drive
    if (!company.driveFolderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'La empresa aún no tiene carpeta de Drive. Contacta a tu administrador para que la cree.',
        },
        { status: 400 }
      );
    }

    // Crear carpeta personal del usuario dentro de la carpeta de empresa
    console.log('[API/users/drive-folder] Creando carpeta personal:', {
      userId,
      userName: userProfile.displayName,
      companyId: company.id,
      companyFolderId: company.driveFolderId,
    });

    const folderName = userProfile.displayName || userProfile.email.split('@')[0];
    const userFolder = await createUserFolder(company.driveFolderId, folderName);

    // Compartir la carpeta con el usuario
    await shareFolderWithUser(userFolder.folderId, userProfile.email, 'writer');

    // Actualizar el perfil del usuario con el ID de la carpeta
    await updateUserProfileAdmin(userId, {
      driveFolderId: userFolder.folderId,
    });

    console.log('[API/users/drive-folder] Carpeta personal creada:', {
      userId,
      driveFolderId: userFolder.folderId,
    });

    return NextResponse.json({
      success: true,
      message: 'Carpeta personal de Drive creada exitosamente',
      driveFolderId: userFolder.folderId,
      driveLink: userFolder.webViewLink || `https://drive.google.com/drive/folders/${userFolder.folderId}`,
    });
  } catch (error) {
    console.error('[API/users/drive-folder] Error:', error);
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
