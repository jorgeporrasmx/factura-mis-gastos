// API para crear cuenta personal sin empresa
// POST /api/users/personal - Completar onboarding como usuario personal

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  createUserProfileAdmin,
  updateUserProfileAdmin,
  createCompanyAdmin,
  updateCompanyDriveFoldersAdmin,
  updateCompanyAdmin,
  isInviteCodeAvailableAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  createCompanyFolderStructure,
  createUserFolder,
  shareFolderWithUser,
  isDriveConfigured,
} from '@/lib/google-drive';
import {
  duplicateBoardForCompany,
  isMondayBoardsConfigured,
} from '@/lib/monday-boards';
import { generateInviteCode, generateUniqueCompanyDomain } from '@/types/company';

function displayNameFromEmail(email: string): string {
  return email.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || email;
}

async function generateAvailableInviteCode(baseName: string): Promise<string> {
  const base = generateInviteCode(baseName) || 'personal';
  let inviteCode = base;
  let codeIsAvailable = await isInviteCodeAvailableAdmin(inviteCode);
  let suffix = 2;

  while (!codeIsAvailable) {
    inviteCode = `${base}-${suffix}`;
    codeIsAvailable = await isInviteCodeAvailableAdmin(inviteCode);
    suffix++;
  }

  return inviteCode;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { uid, displayName, photoURL } = body;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    // Validaciones
    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: uid, email' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Obtener o crear perfil del usuario (fix race condition)
    let userProfile = await getUserProfileAdmin(uid);
    if (!userProfile) {
      // Crear perfil si no existe (puede pasar por timing en onboarding)
      userProfile = await createUserProfileAdmin({
        uid,
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
      });
    } else if (!userProfile.email) {
      await updateUserProfileAdmin(uid, { email });
      userProfile = { ...userProfile, email };
    }

    // Verificar que el usuario no ya pertenezca a una empresa
    if (userProfile.companyId) {
      return NextResponse.json(
        { success: false, error: 'Ya perteneces a una empresa. Usa la opción de empleado.' },
        { status: 400 }
      );
    }

    if (!isDriveConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Google Drive no está configurado para crear tu cuenta personal.' },
        { status: 503 }
      );
    }

    const personalName = (displayName || userProfile.displayName || displayNameFromEmail(email)).trim();
    const operationName = `${personalName} - Personal`;
    const domain = generateUniqueCompanyDomain(operationName, uid);
    const inviteCode = await generateAvailableInviteCode(operationName);

    const company = await createCompanyAdmin({
      name: operationName,
      domain,
      adminEmail: email,
      adminUid: uid,
      adminName: personalName,
      inviteCode,
    });

    const folderStructure = await createCompanyFolderStructure(operationName);
    await shareFolderWithUser(folderStructure.rootFolderId, email, 'writer');

    const userFolder = await createUserFolder(folderStructure.rootFolderId, personalName);
    await shareFolderWithUser(userFolder.folderId, email, 'writer');

    await updateCompanyDriveFoldersAdmin(
      company.id,
      folderStructure.rootFolderId,
      folderStructure.docsFolderId
    );

    let mondayBoardId: string | undefined;
    if (isMondayBoardsConfigured()) {
      try {
        const boardResult = await duplicateBoardForCompany(operationName);
        mondayBoardId = boardResult.boardId;
        await updateCompanyAdmin(company.id, { mondayBoardId: boardResult.boardId });
      } catch (mondayError) {
        console.error('[API/users/personal] Error creando tablero Monday:', mondayError);
      }
    }

    await updateUserProfileAdmin(uid, {
      email,
      displayName: personalName,
      companyId: company.id,
      companyName: operationName,
      role: 'admin',
      driveFolderId: userFolder.folderId,
      status: 'active',
      onboardingCompleted: true,
      accountType: 'personal',
      plan: 'personal',
      subscriptionStatus: 'none',
    });

    return NextResponse.json({
      success: true,
      message: 'Cuenta personal creada exitosamente',
      user: {
        uid,
        email,
        displayName: personalName,
        accountType: 'personal',
        companyId: company.id,
        companyName: operationName,
        driveFolderId: userFolder.folderId,
      },
      company: {
        id: company.id,
        name: operationName,
        driveFolderId: folderStructure.rootFolderId,
        mondayBoardId,
      },
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
