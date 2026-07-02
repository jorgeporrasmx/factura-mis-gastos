// API para subir recibos a Google Drive + Monday
// POST /api/upload/receipt - Subir recibo a carpeta del usuario y crear item en Monday

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  getCompanyByIdAdmin,
  updateUserProfileAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  uploadFile,
  createUserFolder,
  shareFolderWithUser,
  generateUniqueFileName,
  isDriveConfigured,
} from '@/lib/google-drive';
import { createExpenseItem, isMondayBoardsConfigured } from '@/lib/monday-boards';
import { createPersonalOperationForUser } from '@/lib/personal-operation';

// Tipos MIME permitidos para recibos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'application/pdf',
];

// Tamaño máximo: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function triggerReceiptOcr(payload: {
  driveFileId: string;
  fileUrl?: string;
  fileName: string;
  mimeType: string;
  userId: string;
  companyId: string;
  mondayBoardId?: string;
  mondayItemId?: string | null;
}) {
  const webhookUrl = process.env.FMG_RECEIPT_OCR_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driveFileId: payload.driveFileId,
        fileUrl: payload.fileUrl,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        userId: payload.userId,
        companyId: payload.companyId,
        mondayBoardId: payload.mondayBoardId,
        mondayItemId: payload.mondayItemId || undefined,
        source: 'fmg-upload',
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[OCR] n8n webhook error:', response.status, text.slice(0, 500));
    }
  } catch (error) {
    console.error('[OCR] Error triggering n8n webhook:', error);
  }
}

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

    // Obtener perfil del usuario (usando Admin SDK)
    let userProfile = await getUserProfileAdmin(uid);

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Las cuentas personales usan una operación individual detrás de escena.
    // Si el perfil viene de una versión anterior sin companyId, provisionarla aquí.
    if (!userProfile.companyId) {
      if (userProfile.accountType && userProfile.accountType !== 'personal') {
        return NextResponse.json(
          { success: false, error: 'Necesitas completar tu configuración para subir recibos' },
          { status: 400 }
        );
      }

      try {
        const provisioned = await createPersonalOperationForUser(userProfile);
        userProfile = provisioned.userProfile;
      } catch (provisionError) {
        console.error('[API/upload/receipt] Error provisionando operación personal:', provisionError);
        return NextResponse.json(
          {
            success: false,
            error: 'No pudimos preparar tu cuenta personal para subir recibos',
            details: provisionError instanceof Error ? provisionError.message : 'Error desconocido',
          },
          { status: 500 }
        );
      }
    }

    const companyId = userProfile.companyId;
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Necesitas completar tu configuración para subir recibos' },
        { status: 400 }
      );
    }

    // Obtener empresa (usando Admin SDK)
    const company = await getCompanyByIdAdmin(companyId);

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
          error: `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: JPG, PNG, GIF, WebP, HEIC, PDF`,
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

      // Actualizar perfil con el folder ID (usando Admin SDK)
      await updateUserProfileAdmin(uid, { driveFolderId: userFolderId });
    }

    // Convertir archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generar nombre único
    const fileName = generateUniqueFileName(file.name);

    // Subir archivo a Drive
    const uploadResult = await uploadFile(
      userFolderId,
      buffer,
      fileName,
      file.type
    );

    // Crear item en Monday si está configurado y la empresa tiene tablero
    let mondayItemId: string | null = null;
    
    if (isMondayBoardsConfigured() && company.mondayBoardId) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const userName = userProfile.displayName || userProfile.email.split('@')[0];
        
        // Columnas del tablero MACHOTE
        const columnValues: Record<string, unknown> = {
          // Estado: NUEVO (index 5 en el tablero)
          status: { index: 5 },
          // Fecha de compra (hoy por defecto)
          text_mkthrxct: today,
          // Método: Web - se puede cambiar si viene de WhatsApp
          proyecto: { label: 'Sitio Web' },
          // Link al archivo en Drive
          text_mkqygzgk: uploadResult.webViewLink,
          // Llave idempotente para automatizaciones Drive -> OCR/IA -> Monday
          enlace4: uploadResult.fileId,
          // Empleado (tag) - usar nombre del usuario
          tag_mm063vts: { tag_ids: [] }, // Se puede mejorar para crear/buscar el tag
        };

        mondayItemId = await createExpenseItem(
          company.mondayBoardId,
          `Recibo - ${userName} - ${today}`, // Nombre del item
          columnValues
        );

        console.log(`[MONDAY] Item creado: ${mondayItemId} en tablero ${company.mondayBoardId}`);
      } catch (mondayError) {
        // No fallar si Monday falla, el archivo ya está en Drive
        console.error('[MONDAY] Error creando item:', mondayError);
      }
    } else {
      console.log('[MONDAY] Skipped: No configurado o empresa sin tablero');
    }

    await triggerReceiptOcr({
      driveFileId: uploadResult.fileId,
      fileUrl: uploadResult.webViewLink,
      fileName,
      mimeType: file.type,
      userId: uid,
      companyId: company.id,
      mondayBoardId: company.mondayBoardId,
      mondayItemId,
    });

    return NextResponse.json({
      success: true,
      message: 'Recibo subido exitosamente',
      file: {
        id: uploadResult.fileId,
        name: fileName,
        url: uploadResult.webViewLink,
        downloadUrl: uploadResult.webContentLink,
        mimeType: file.type,
        size: file.size,
      },
      monday: mondayItemId ? { itemId: mondayItemId } : null,
    });
  } catch (error) {
    console.error('Error subiendo recibo:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al subir el archivo',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
