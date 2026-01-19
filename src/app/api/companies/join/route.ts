// API para unirse a una empresa existente
// POST /api/companies/join - Unirse a empresa por dominio de email

import { NextRequest, NextResponse } from 'next/server';
import {
  getCompanyByDomain,
  getCompanyById,
  getUserProfile,
  linkUserToCompany,
} from '@/lib/firebase/firestore';
import {
  createUserFolder,
  shareFolderWithUser,
  isDriveConfigured,
} from '@/lib/google-drive';
import { extractDomainFromEmail, isPublicEmailDomain } from '@/types/company';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { uid, email, displayName } = body;

    // Validaciones
    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: uid, email' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const userProfile = await getUserProfile(uid);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
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

    // Extraer dominio del email
    let domain: string;
    try {
      domain = extractDomainFromEmail(email);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Para emails públicos, no hay empresa a la cual unirse
    if (isPublicEmailDomain(domain)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Los emails públicos no pueden unirse a empresas existentes. Registra tu propia empresa.',
          isPublicEmail: true,
          suggestion: 'register_company',
        },
        { status: 400 }
      );
    }

    // Buscar empresa por dominio
    const company = await getCompanyByDomain(domain);

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: `No hay ninguna empresa registrada con el dominio ${domain}. Tu empresa debe registrarse primero.`,
          companyNotFound: true,
          domain,
        },
        { status: 404 }
      );
    }

    // Crear carpeta del usuario en Drive (si está configurado)
    let userDriveFolderId: string | undefined;
    if (isDriveConfigured() && company.driveFolderId) {
      try {
        const userName = displayName || userProfile.displayName || email.split('@')[0];
        const userFolder = await createUserFolder(company.driveFolderId, userName);
        userDriveFolderId = userFolder.folderId;

        // Compartir carpeta principal de empresa con el nuevo usuario (solo lectura)
        await shareFolderWithUser(company.driveFolderId, email, 'reader');

        // Compartir su carpeta personal con permisos de escritura
        await shareFolderWithUser(userFolder.folderId, email, 'writer');
      } catch (driveError) {
        console.error('Error creando carpeta de usuario en Drive:', driveError);
        // Continuamos sin carpeta, el usuario igual se puede unir
      }
    }

    // Vincular usuario a empresa
    await linkUserToCompany(
      uid,
      company.id,
      company.name,
      'user',
      userDriveFolderId
    );

    return NextResponse.json({
      success: true,
      message: `Te has unido a ${company.name}`,
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
      },
      userDriveFolderId,
    });
  } catch (error) {
    console.error('Error uniéndose a empresa:', error);
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

// GET /api/companies/join?email=xxx - Verificar si existe empresa para un email
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requerido' },
        { status: 400 }
      );
    }

    // Extraer dominio
    let domain: string;
    try {
      domain = extractDomainFromEmail(email);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Si es dominio público, informar que no hay empresa que unirse
    // (pero no bloquear - pueden registrarse como empresa)
    if (isPublicEmailDomain(domain)) {
      return NextResponse.json({
        success: true,
        isPublicEmail: true,
        companyFound: false,
        domain,
        message: 'No hay empresa asociada a este dominio. Puedes registrar tu propia empresa.',
      });
    }

    // Buscar empresa
    const company = await getCompanyByDomain(domain);

    if (!company) {
      return NextResponse.json({
        success: true,
        companyFound: false,
        domain,
        message: `No hay empresa registrada con el dominio ${domain}`,
      });
    }

    return NextResponse.json({
      success: true,
      companyFound: true,
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
      },
    });
  } catch (error) {
    console.error('Error verificando empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
