// API para subir Constancia de Situación Fiscal (CSF) a Google Drive
// POST /api/upload/csf - Subir CSF a carpeta del usuario

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfile,
  getCompanyById,
  updateUserProfile,
  createUserProfile,
} from '@/lib/firebase/firestore';
import {
  uploadFile,
  createUserFolder,
  shareFolderWithUser,
  generateUniqueFileName,
  isDriveConfigured,
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

    console.log('[API/upload/csf] Buscando perfil para UID:', uid);

    // Obtener perfil del usuario
    let userProfile = await getUserProfile(uid);

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
        userProfile = await createUserProfile({
          uid,
          email: emailToUse,
          displayName: null,
          photoURL: null,
        });
        console.log('[API/upload/csf] Perfil de usuario creado automáticamente:', uid);
      } catch (createError) {
        console.error('[API/upload/csf] Error creando perfil de usuario:', createError);
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
          error: 'Debes pertenecer a una empresa para subir tu CSF. Ve a Configuración para crear o unirte a una empresa.',
          needsCompany: true
        },
        { status: 400 }
      );
    }

    // Obtener empresa
    const company = await getCompanyById(userProfile.companyId);

    if (!company || !company.driveFolderId) {
      return NextResponse.json(
        { success: false, error: 'La empresa no tiene carpeta de Drive configurada' },
        { status: 400 }
      );
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
      const userFolder = await createUserFolder(company.driveFolderId, userName);
      userFolderId = userFolder.folderId;

      // Compartir carpeta con el usuario
      await shareFolderWithUser(userFolderId, userProfile.email, 'writer');

      // Actualizar perfil con el folder ID
      await updateUserProfile(uid, { driveFolderId: userFolderId });
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

    // Actualizar perfil del usuario con la información del CSF
    const now = new Date();
    await updateUserProfile(uid, {
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
