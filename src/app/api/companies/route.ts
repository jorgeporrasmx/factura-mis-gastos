// API para crear empresas
// POST /api/companies - Crear una nueva empresa

import { NextRequest, NextResponse } from 'next/server';
import {
  createCompany,
  getCompanyByDomain,
  updateCompanyDriveFolders,
  getUserProfile,
  linkUserToCompany,
} from '@/lib/firebase/firestore';
import {
  createCompanyFolderStructure,
  createUserFolder,
  shareFolderWithUser,
  isDriveConfigured,
} from '@/lib/google-drive';
import { extractDomainFromEmail, isPublicEmailDomain, generateUniqueCompanyDomain } from '@/types/company';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, rfc, adminUid, adminEmail, adminName } = body;

    // Validaciones
    if (!name || !adminUid || !adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: name, adminUid, adminEmail' },
        { status: 400 }
      );
    }

    // Extraer dominio del email
    let domain: string;
    let isPublicEmail = false;
    try {
      const emailDomain = extractDomainFromEmail(adminEmail);
      // Si es email público, generar dominio único
      if (isPublicEmailDomain(emailDomain)) {
        domain = generateUniqueCompanyDomain(name, adminUid);
        isPublicEmail = true;
      } else {
        domain = emailDomain;
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const userProfile = await getUserProfile(adminUid);
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

    // Verificar que no exista otra empresa con el mismo dominio (solo para emails corporativos)
    if (!isPublicEmail) {
      const existingCompany = await getCompanyByDomain(domain);
      if (existingCompany) {
        return NextResponse.json(
          { success: false, error: `Ya existe una empresa registrada con el dominio ${domain}` },
          { status: 409 }
        );
      }
    }

    // Crear la empresa en Firestore
    const company = await createCompany({
      name,
      domain,
      rfc,
      adminEmail,
      adminUid,
      adminName: adminName || userProfile.displayName || 'Admin',
    });

    // Crear estructura de carpetas en Google Drive (si está configurado)
    let driveFolderInfo = null;
    let adminDriveFolderId: string | undefined;

    if (isDriveConfigured()) {
      try {
        console.log('[API/companies] Iniciando creación de carpetas en Drive para empresa:', name);

        const folderStructure = await createCompanyFolderStructure(name);

        // Compartir carpeta raíz con el admin
        await shareFolderWithUser(folderStructure.rootFolderId, adminEmail, 'writer');

        // Crear carpeta personal del admin dentro de la carpeta de empresa
        const adminFolderName = adminName || userProfile.displayName || adminEmail.split('@')[0];
        const adminFolder = await createUserFolder(folderStructure.rootFolderId, adminFolderName);
        adminDriveFolderId = adminFolder.folderId;

        // Compartir carpeta personal del admin con permisos de escritura
        await shareFolderWithUser(adminFolder.folderId, adminEmail, 'writer');

        console.log('[API/companies] Carpeta personal del admin creada:', {
          adminFolderId: adminDriveFolderId,
          adminFolderLink: adminFolder.webViewLink,
        });

        // Actualizar empresa con IDs de carpetas
        await updateCompanyDriveFolders(
          company.id,
          folderStructure.rootFolderId,
          folderStructure.docsFolderId
        );

        driveFolderInfo = {
          rootFolderId: folderStructure.rootFolderId,
          docsFolderId: folderStructure.docsFolderId,
          rootWebViewLink: folderStructure.rootWebViewLink,
          adminFolderId: adminDriveFolderId,
          adminFolderLink: adminFolder.webViewLink,
        };

        // Actualizar objeto company local
        company.driveFolderId = folderStructure.rootFolderId;
        company.driveDocsFolderId = folderStructure.docsFolderId;

        console.log('[API/companies] Estructura de Drive creada exitosamente:', driveFolderInfo);
      } catch (driveError) {
        console.error('[API/companies] Error creando carpetas en Drive:', driveError);
        // Continuamos sin Drive, la empresa ya está creada
      }
    } else {
      console.log('[API/companies] Google Drive no configurado, omitiendo creación de carpetas');
    }

    // Vincular usuario a empresa como admin (con su carpeta personal si se creó)
    await linkUserToCompany(
      adminUid,
      company.id,
      company.name,
      'admin',
      adminDriveFolderId
    );

    return NextResponse.json({
      success: true,
      message: 'Empresa creada exitosamente',
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
        driveFolderId: company.driveFolderId,
        isPersonalAccount: isPublicEmail,
      },
      driveFolder: driveFolderInfo,
    });
  } catch (error) {
    console.error('Error creando empresa:', error);
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
