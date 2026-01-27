// API para subir Constancia de Situación Fiscal (CSF) a Google Drive
// POST /api/upload/csf - Subir CSF a carpeta del usuario

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  getCompanyByIdAdmin,
  updateUserProfileAdmin,
  createUserProfileAdmin,
  updateCompanyDriveFoldersAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  uploadFile,
  createUserFolder,
  shareFolderWithUser,
  isDriveConfigured,
  ensureCompanyDriveFolder,
} from '@/lib/google-drive';

// Tipos MIME permitidos para CSF
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

// Tamaño máximo: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Verificar que Drive está configurado
    if (!isDriveConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Google Drive no está configurado' },
        { status: 503 }
      );
    }

    // Obtener UID y email del header
    const uid = request.headers.get('x-user-uid');
    const userEmail = request.headers.get('x-user-email');

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener perfil del usuario usando Admin SDK, o crearlo si no existe
    let userProfile = await getUserProfileAdmin(uid);

    if (!userProfile) {
      console.log('[API/upload/csf] Perfil no encontrado para UID:', uid);

      // Si tenemos el email, intentar crear perfil automáticamente
      const emailToUse = userEmail && userEmail.trim() !== ''
        ? userEmail
        : null;

      if (!emailToUse) {
        return NextResponse.json(
          {
            success: false,
            error: 'Usuario no encontrado. Por favor, completa el registro primero.',
            details: 'No se encontró perfil y no hay email para crear uno nuevo.'
          },
          { status: 400 }
        );
      }

      try {
        userProfile = await createUserProfileAdmin({
          uid,
          email: emailToUse,
          displayName: null,
          photoURL: null,
        });
        console.log('Perfil de usuario creado automáticamente (Admin):', uid);
      } catch (createError) {
        console.error('Error creando perfil de usuario (Admin):', createError);
        return NextResponse.json(
          {
            success: false,
            error: 'Error al crear perfil de usuario',
            details: createError instanceof Error ? createError.message : 'Error desconocido'
          },
          { status: 500 }
        );
      }
    }

    console.log('[API/upload/csf] Perfil encontrado:', {
      uid: userProfile.uid,
      email: userProfile.email,
      companyId: userProfile.companyId,
      driveFolderId: userProfile.driveFolderId
    });

    // Verificar que tiene empresa
    if (!userProfile.companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Debes pertenecer a una empresa para subir tu CSF. Ve a Mi Perfil para crear una empresa.',
          needsCompany: true
        },
        { status: 400 }
      );
    }

    // Obtener empresa usando Admin SDK
    const company = await getCompanyByIdAdmin(userProfile.companyId);

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 400 }
      );
    }

    // Asegurar que la empresa tiene carpeta de Drive (crear si no existe)
    let companyDriveFolderId = company.driveFolderId;

    if (!companyDriveFolderId) {
      console.log('[API/upload/csf] Empresa sin carpeta de Drive, creando automáticamente:', {
        companyId: company.id,
        companyName: company.name,
      });

      try {
        const folderStructure = await ensureCompanyDriveFolder(company.name);
        companyDriveFolderId = folderStructure.rootFolderId;

        // Actualizar la empresa con los IDs de las carpetas
        await updateCompanyDriveFoldersAdmin(
          company.id,
          folderStructure.rootFolderId,
          folderStructure.docsFolderId
        );

        console.log('[API/upload/csf] Carpeta de empresa creada exitosamente:', {
          companyId: company.id,
          driveFolderId: companyDriveFolderId,
        });
      } catch (driveError) {
        console.error('[API/upload/csf] Error creando carpeta de empresa:', driveError);
        return NextResponse.json(
          {
            success: false,
            error: 'No se pudo crear la carpeta de Drive para la empresa',
            details: driveError instanceof Error ? driveError.message : 'Error desconocido',
          },
          { status: 500 }
        );
      }
    }

    // Obtener el archivo del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: PDF, JPG, PNG`,
        },
        { status: 400 }
      );
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `El archivo es demasiado grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Verificar/crear carpeta del usuario
    let userFolderId = userProfile.driveFolderId;

    if (!userFolderId) {
      // Crear carpeta del usuario si no existe
      const userName = userProfile.displayName || userProfile.email.split('@')[0];
      const userFolder = await createUserFolder(companyDriveFolderId, userName);
      userFolderId = userFolder.folderId;

      // Compartir carpeta con el usuario
      await shareFolderWithUser(userFolderId, userProfile.email, 'writer');

      // Actualizar perfil con el folder ID usando Admin SDK
      await updateUserProfileAdmin(uid, { driveFolderId: userFolderId });
    }

    // Convertir archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generar nombre con prefijo CSF y timestamp
    const extension = file.name.split('.').pop() || 'pdf';
    const timestamp = Date.now();
    const fileName = `CSF_${timestamp}.${extension}`;

    // Subir archivo a Drive
    const uploadResult = await uploadFile(
      userFolderId,
      buffer,
      fileName,
      file.type
    );

    // Actualizar perfil del usuario con la información del CSF usando Admin SDK
    const now = new Date();
    await updateUserProfileAdmin(uid, {
      csfUrl: uploadResult.webViewLink,
      csfDriveId: uploadResult.fileId,
      csfFileName: fileName,
      csfUploadedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: 'Constancia de Situación Fiscal subida exitosamente',
      file: {
        id: uploadResult.fileId,
        name: fileName,
        url: uploadResult.webViewLink,
        downloadUrl: uploadResult.webContentLink,
        mimeType: file.type,
        size: file.size,
        uploadedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error subiendo CSF:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al subir la constancia fiscal',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
