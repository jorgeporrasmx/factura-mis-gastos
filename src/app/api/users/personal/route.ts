// API para crear cuenta personal sin empresa
// POST /api/users/personal - Completar onboarding como usuario personal

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  createUserProfileAdmin,
  updateUserProfileAdmin,
  completeOnboardingAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  isDriveConfigured,
  createUserFolder,
  shareFolderWithUser,
} from '@/lib/google-drive';
import {
  isMondayBoardsConfigured,
  duplicateBoardForCompany,
} from '@/lib/monday-boards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { uid, email, displayName, photoURL } = body;

    // Validaciones
    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: uid, email' },
        { status: 400 }
      );
    }

    // Obtener o crear perfil del usuario (fix race condition)
    let userProfile = await getUserProfileAdmin(uid);
    if (!userProfile) {
      userProfile = await createUserProfileAdmin({
        uid,
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
      });
    }

    // Verificar que el usuario no ya pertenezca a una empresa
    if (userProfile.companyId) {
      return NextResponse.json(
        { success: false, error: 'Ya perteneces a una empresa. Usa la opción de empleado.' },
        { status: 400 }
      );
    }

    // Completar onboarding como usuario personal
    await completeOnboardingAdmin(uid, 'personal');

    const userName = displayName || email.split('@')[0];

    // ── Drive: crear carpeta personal ────────────────────────────────────────
    let driveFolderInfo = null;

    if (isDriveConfigured()) {
      try {
        const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
        if (rootFolderId) {
          const userFolder = await createUserFolder(rootFolderId, userName);
          await shareFolderWithUser(userFolder.folderId, email, 'writer');
          await updateUserProfileAdmin(uid, { driveFolderId: userFolder.folderId });

          driveFolderInfo = {
            folderId: userFolder.folderId,
            webViewLink: userFolder.webViewLink,
          };

          console.log('[API/users/personal] Carpeta Drive creada:', driveFolderInfo);
        } else {
          console.log('[API/users/personal] GOOGLE_DRIVE_ROOT_FOLDER_ID no configurado, omitiendo Drive');
        }
      } catch (driveError) {
        console.error('[API/users/personal] Error creando carpeta en Drive:', driveError);
        // No bloquear el onboarding si Drive falla
      }
    }

    // ── Monday: duplicar tablero MACHOTE ─────────────────────────────────────
    let mondayBoardInfo = null;

    if (isMondayBoardsConfigured()) {
      try {
        const boardResult = await duplicateBoardForCompany(userName);
        await updateUserProfileAdmin(uid, { mondayBoardId: boardResult.boardId });

        mondayBoardInfo = {
          boardId: boardResult.boardId,
          boardUrl: boardResult.boardUrl,
        };

        console.log('[API/users/personal] Tablero Monday creado:', mondayBoardInfo);
      } catch (mondayError) {
        console.error('[API/users/personal] Error creando tablero de Monday:', mondayError);
        // No bloquear el onboarding si Monday falla
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cuenta personal creada exitosamente',
      user: {
        uid,
        email,
        displayName: userName,
        accountType: 'personal',
      },
      driveFolder: driveFolderInfo,
      mondayBoard: mondayBoardInfo,
    });
  } catch (error) {
    console.error('Error creando cuenta personal:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
