// API para subir recibos a Google Drive + Monday
// POST /api/upload/receipt - Subir recibo a carpeta del usuario y crear item en Monday

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  getCompanyByIdAdmin,
  updateUserProfileAdmin,
  updateCompanyAdmin,
} from '@/lib/firebase/firestore-admin';
import { getAdminFirestore } from '@/lib/firebase/admin';
import {
  uploadFile,
  createUserFolder,
  shareFolderWithUser,
  generateUniqueFileName,
  isDriveConfigured,
} from '@/lib/google-drive';
import {
  createExpenseItem,
  duplicateBoardForCompany,
  isMondayBoardsConfigured,
} from '@/lib/monday-boards';

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
    const userProfile = await getUserProfileAdmin(uid);

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const hasCsf = Boolean(userProfile.csfUploadedAt);
    const trialReceiptUsed = Boolean((userProfile as { trialReceiptUsedAt?: unknown }).trialReceiptUsedAt);

    // Determinar carpeta raíz según tipo de cuenta
    let parentFolderId: string | null = null;
    let company: Awaited<ReturnType<typeof getCompanyByIdAdmin>> | null = null;

    if (userProfile.companyId) {
      // Usuario con empresa: usar carpeta de la empresa
      company = await getCompanyByIdAdmin(userProfile.companyId);
      if (!company || !company.driveFolderId) {
        return NextResponse.json(
          { success: false, error: 'La empresa no tiene carpeta de Drive configurada' },
          { status: 400 }
        );
      }
      parentFolderId = company.driveFolderId;
    } else if ((userProfile as { accountType?: string }).accountType === 'personal') {
      // Usuario personal: usar carpeta raíz de Drive configurada en el servidor
      parentFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || null;
    } else {
      return NextResponse.json(
        { success: false, error: 'Debes pertenecer a una empresa o tener una cuenta personal para subir recibos' },
        { status: 400 }
      );
    }

    // Prueba gratis: permitir un recibo aunque todavía no exista CSF.
    // La CSF desbloquea el uso recurrente.
    if (!hasCsf) {
      if (trialReceiptUsed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Tu recibo de prueba ya fue enviado. Sube tu CSF para continuar con más recibos.',
          },
          { status: 403 }
        );
      }

      const db = getAdminFirestore();
      if (db) {
        const existingTrialReceipt = await db
          .collection('receipts')
          .where('userId', '==', uid)
          .limit(1)
          .get();

        if (!existingTrialReceipt.empty) {
          await updateUserProfileAdmin(uid, { trialReceiptUsedAt: new Date() });
          return NextResponse.json(
            {
              success: false,
              error: 'Tu recibo de prueba ya fue enviado. Sube tu CSF para continuar con más recibos.',
            },
            { status: 403 }
          );
        }
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
      const userFolder = await createUserFolder(parentFolderId!, userName);
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

    // Crear item en Monday. Si la cuenta fue creada antes de tener
    // tablero asociado, provisionarlo en el primer recibo.
    let mondayItemId: string | null = null;
    
    if (isMondayBoardsConfigured() && (company || (userProfile as { accountType?: string }).accountType === 'personal')) {
      try {
        const userName = userProfile.displayName || userProfile.email.split('@')[0];
        let mondayBoardId = company?.mondayBoardId || userProfile.mondayBoardId;
        const boardName = company?.name || userName;

        if (!mondayBoardId) {
          console.log(`[MONDAY] Cuenta sin tablero, creando tablero para ${boardName}`);
          const boardResult = await duplicateBoardForCompany(boardName);
          mondayBoardId = boardResult.boardId;
          if (company) {
            await updateCompanyAdmin(company.id, { mondayBoardId });
            company.mondayBoardId = mondayBoardId;
          } else {
            await updateUserProfileAdmin(uid, { mondayBoardId });
          }
          console.log(`[MONDAY] Tablero creado para cuenta ${boardName}: ${mondayBoardId}`);
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Columnas del tablero MACHOTE
        const columnValues: Record<string, unknown> = {
          // Estado: NUEVO (index 5 en el tablero)
          status: { index: 5 },
          // Fecha de compra (hoy por defecto)
          text_mkthrxct: today,
          // Método: Web (index 3) - se puede cambiar si viene de WhatsApp
          proyecto: { index: 3 },
          // Link al archivo en Drive
          text_mkqygzgk: uploadResult.webViewLink,
          // Empleado (tag) - usar nombre del usuario
          tag_mm063vts: { tag_ids: [] }, // Se puede mejorar para crear/buscar el tag
        };

        mondayItemId = await createExpenseItem(
          mondayBoardId,
          `Recibo - ${userName} - ${today}`, // Nombre del item
          columnValues
        );

        console.log(`[MONDAY] Item creado: ${mondayItemId} en tablero ${mondayBoardId}`);
      } catch (mondayError) {
        // No fallar si Monday falla, el archivo ya está en Drive
        console.error('[MONDAY] Error creando item:', mondayError);
      }
    } else {
      console.log('[MONDAY] Skipped: Monday no configurado o cuenta sin tablero aplicable');
    }

    if (!hasCsf) {
      await updateUserProfileAdmin(uid, { trialReceiptUsedAt: new Date() });
    }

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
