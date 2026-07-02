// API para subir recibos a Google Drive + Monday
// POST /api/upload/receipt - Subir recibo a carpeta del usuario y crear item en Monday

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUid } from '@/lib/api-auth';
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
    const uid = await getAuthenticatedUid(request);

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

    // Prueba gratis: permitir un recibo aunque todavía no exista CSF.
    // La CSF desbloquea el uso recurrente.
    const hasCsf = Boolean(userProfile.csfUploadedAt);
    const trialReceiptUsed = Boolean((userProfile as { trialReceiptUsedAt?: unknown }).trialReceiptUsedAt);

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
      const userFolder = await createUserFolder(company.driveFolderId, userName);
      userFolderId = userFolder.folderId;

      // Compartir carpeta con el usuario y actualizar perfil en paralelo
      await Promise.all([
        shareFolderWithUser(userFolderId, userProfile.email, 'writer'),
        updateUserProfileAdmin(uid, { driveFolderId: userFolderId }),
      ]);
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
    let mondayBoardId: string | undefined = company.mondayBoardId || userProfile.mondayBoardId;

    if (isMondayBoardsConfigured()) {
      try {
        const userName = userProfile.displayName || userProfile.email.split('@')[0];
        const boardName = company.name || userName;

        if (!mondayBoardId) {
          console.log(`[MONDAY] Cuenta sin tablero, creando tablero para ${boardName}`);
          const boardResult = await duplicateBoardForCompany(boardName);
          mondayBoardId = boardResult.boardId;
          await updateCompanyAdmin(company.id, { mondayBoardId });
          company.mondayBoardId = mondayBoardId;
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
          // Llave idempotente para automatizaciones Drive -> OCR/IA -> Monday
          enlace4: uploadResult.fileId,
        };

        mondayItemId = await createExpenseItem(
          mondayBoardId,
          `Recibo - ${userName} - ${today}`, // Nombre del item
          columnValues,
          {
            name: userName,
            email: userProfile.email,
            whatsapp: (userProfile as { whatsappPhone?: string }).whatsappPhone,
          }
        );

        console.log(`[MONDAY] Item creado: ${mondayItemId} en tablero ${mondayBoardId}`);
      } catch (mondayError) {
        // No fallar si Monday falla, el archivo ya está en Drive
        console.error('[MONDAY] Error creando item:', mondayError);
      }
    } else {
      console.log('[MONDAY] Skipped: Monday no configurado');
    }

    // Registrar el gasto en Firestore con los datos reales del empleado,
    // para que reportes y filtros por empleado no dependan del sync de Monday.
    try {
      const db = getAdminFirestore();
      if (db) {
        const now = new Date();
        await db
          .collection('companies')
          .doc(company.id)
          .collection('expenses')
          .doc(uploadResult.fileId)
          .set(
            {
              driveFileId: uploadResult.fileId,
              fileName,
              fileUrl: uploadResult.webViewLink,
              mimeType: file.type,
              userId: uid,
              userName: userProfile.displayName || userProfile.email.split('@')[0],
              userEmail: userProfile.email,
              companyId: company.id,
              mondayBoardId: mondayBoardId || null,
              mondayItemId: mondayItemId || null,
              estado: 'nuevo',
              source: 'web-upload',
              createdAt: now,
              updatedAt: now,
            },
            { merge: true }
          );
      }
    } catch (expenseError) {
      // No fallar la subida si el registro del gasto falla
      console.error('[EXPENSES] Error registrando gasto en Firestore:', expenseError);
    }

    const postUploadTasks: Promise<unknown>[] = [
      triggerReceiptOcr({
        driveFileId: uploadResult.fileId,
        fileUrl: uploadResult.webViewLink,
        fileName,
        mimeType: file.type,
        userId: uid,
        companyId: company.id,
        mondayBoardId,
        mondayItemId,
      }),
    ];

    if (!hasCsf) {
      postUploadTasks.push(updateUserProfileAdmin(uid, { trialReceiptUsedAt: new Date() }));
    }

    await Promise.all(postUploadTasks);

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
