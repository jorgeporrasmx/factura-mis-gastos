// API para unirse a una empresa por código de invitación
// GET /api/companies/join-by-invite?code=acme-corp - Verificar empresa
// POST /api/companies/join-by-invite - Unirse a empresa

import { NextRequest, NextResponse } from 'next/server';
import {
  getCompanyByInviteCodeAdmin,
  getUserProfileAdmin,
  linkUserToCompanyAdmin,
  updateUserProfileAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  createUserFolder,
  shareFolderWithUser,
  isDriveConfigured,
} from '@/lib/google-drive';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Código de invitación requerido' },
        { status: 400 }
      );
    }

    const company = await getCompanyByInviteCodeAdmin(code.toLowerCase());

    if (!company) {
      return NextResponse.json({
        success: true,
        companyFound: false,
        message: 'No se encontró una empresa con este código de invitación',
      });
    }

    return NextResponse.json({
      success: true,
      companyFound: true,
      company: {
        id: company.id,
        name: company.name,
      },
    });
  } catch (error) {
    console.error('Error verificando código de invitación:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, displayName, whatsappPhone, inviteCode } = body;

    if (!uid || !email || !inviteCode) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: uid, email, inviteCode' },
        { status: 400 }
      );
    }

    if (!whatsappPhone) {
      return NextResponse.json(
        { success: false, error: 'El número de WhatsApp es requerido' },
        { status: 400 }
      );
    }

    // Buscar empresa por código de invitación
    const company = await getCompanyByInviteCodeAdmin(inviteCode.toLowerCase());

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Código de invitación inválido o empresa no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el usuario existe
    const userProfile = await getUserProfileAdmin(uid);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado. Regístrate primero.' },
        { status: 404 }
      );
    }

    // Verificar que el usuario no ya pertenezca a una empresa
    if (userProfile.companyId) {
      return NextResponse.json(
        { success: false, error: 'Ya perteneces a una empresa' },
        { status: 400 }
      );
    }

    // Crear carpeta del usuario en Drive (si está configurado)
    let userDriveFolderId: string | undefined;
    if (isDriveConfigured() && company.driveFolderId) {
      try {
        const userName = displayName || userProfile.displayName || email.split('@')[0];
        const userFolder = await createUserFolder(company.driveFolderId, userName);
        userDriveFolderId = userFolder.folderId;

        await shareFolderWithUser(company.driveFolderId, email, 'reader');
        await shareFolderWithUser(userFolder.folderId, email, 'writer');
      } catch (driveError) {
        console.error('Error creando carpeta de usuario en Drive:', driveError);
      }
    }

    // Vincular usuario a empresa
    await linkUserToCompanyAdmin(
      uid,
      company.id,
      company.name,
      'user',
      userDriveFolderId
    );

    // Guardar número de WhatsApp
    await updateUserProfileAdmin(uid, { whatsappPhone });

    return NextResponse.json({
      success: true,
      message: `Te has unido a ${company.name}`,
      company: {
        id: company.id,
        name: company.name,
      },
      userDriveFolderId,
    });
  } catch (error) {
    console.error('Error uniéndose a empresa por invitación:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
