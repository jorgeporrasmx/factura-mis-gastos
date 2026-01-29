// API para subir Constancia de Situación Fiscal (CSF) a Firebase Storage
// POST /api/upload/csf - Subir CSF a carpeta del usuario

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  updateUserProfileAdmin,
  createUserProfileAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  getAdminStorage,
  getStorageBucketName,
  isAdminConfigured,
} from '@/lib/firebase/admin';

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
    // Verificar que Firebase Admin está configurado
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin no está configurado' },
        { status: 503 }
      );
    }

    // Verificar que Storage está configurado
    const bucketName = getStorageBucketName();
    if (!bucketName) {
      return NextResponse.json(
        { success: false, error: 'Firebase Storage bucket no está configurado' },
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
    });

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

    // Convertir archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generar nombre con prefijo CSF y timestamp
    const extension = file.name.split('.').pop() || 'pdf';
    const timestamp = Date.now();
    const fileName = `CSF_${timestamp}.${extension}`;

    // Path en Firebase Storage: users/{uid}/csf/{fileName}
    const storagePath = `users/${uid}/csf/${fileName}`;

    // Obtener Storage Admin
    const storage = getAdminStorage();
    if (!storage) {
      return NextResponse.json(
        { success: false, error: 'No se pudo inicializar Firebase Storage' },
        { status: 500 }
      );
    }

    // Subir archivo a Firebase Storage (usar bucket por defecto configurado en Admin)
    const bucket = storage.bucket();
    const fileRef = bucket.file(storagePath);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy: uid,
          originalName: file.name,
        },
      },
    });

    // Hacer el archivo público para que sea accesible
    await fileRef.makePublic();

    // Obtener URL pública
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${storagePath}`;

    // Actualizar perfil del usuario con la información del CSF
    const now = new Date();
    await updateUserProfileAdmin(uid, {
      csfUrl: publicUrl,
      csfStoragePath: storagePath,
      csfFileName: fileName,
      csfUploadedAt: now,
    });

    console.log('[API/upload/csf] CSF subida exitosamente:', {
      uid,
      storagePath,
      url: publicUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Constancia de Situación Fiscal subida exitosamente',
      file: {
        id: storagePath,
        name: fileName,
        url: publicUrl,
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
