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

    // Casos de error explícitos (no fallo silencioso):
    if (userProfile.companyId) {
      // Cuenta personal activa: tiene su propia operación personal (empresa
      // detrás de escena) y puede tener recibos/CSF. No se convierte
      // automáticamente para no mezclar datos personales con los de la empresa.
      if (userProfile.accountType === 'personal') {
        return NextResponse.json(
          {
            success: false,
            error:
              'Tu cuenta es personal y ya tiene su propia operación (recibos, carpetas o CSF). Para unirte a una empresa sin perder tu información, contacta a soporte.',
            code: 'PERSONAL_ACCOUNT_ACTIVE',
          },
          { status: 409 }
        );
      }

      const sameCompany = userProfile.companyId === company.id;
      return NextResponse.json(
        {
          success: false,
          error: sameCompany
            ? `Ya perteneces a ${company.name}.`
            : 'Tu cuenta ya pertenece a otra empresa. Para cambiar de empresa contacta a soporte.',
          code: sameCompany ? 'ALREADY_IN_THIS_COMPANY' : 'ALREADY_IN_ANOTHER_COMPANY',
        },
        { status: 409 }
      );
    }

    // Cuenta personal legada (sin operación provisionada) pero con datos:
    // también requiere soporte para no perder información.
    if (userProfile.accountType === 'personal' && userProfile.csfUploadedAt) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Tu cuenta es personal y ya tiene datos (CSF). Para unirte a una empresa sin perder tu información, contacta a soporte.',
          code: 'PERSONAL_ACCOUNT_HAS_DATA',
        },
        { status: 409 }
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

    // Vincular usuario a empresa. Esto deja el perfil con exactamente:
    // companyId, companyName, role: 'user', accountType: 'empleado',
    // status: 'active', onboardingCompleted: true y (si aplica) driveFolderId.
    await linkUserToCompanyAdmin(
      uid,
      company.id,
      company.name,
      'user',
      userDriveFolderId
    );

    // Guardar número de WhatsApp y nombre visible del empleado (trazabilidad).
    const employeeName = displayName || userProfile.displayName || undefined;
    await updateUserProfileAdmin(uid, {
      whatsappPhone,
      ...(employeeName ? { displayName: employeeName } : {}),
    });

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
