// API para crear empresas
// POST /api/companies - Crear una nueva empresa

import { NextRequest, NextResponse } from 'next/server';
import {
  createCompanyAdmin,
  getCompanyByDomainAdmin,
  updateCompanyDriveFoldersAdmin,
  getUserProfileAdmin,
  linkUserToCompanyAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  createCompanyFolderStructure,
  createUserFolder,
  shareFolderWithUser,
  isDriveConfigured,
} from '@/lib/google-drive';
import { extractDomainFromEmail, isPublicEmailDomain, generateUniqueCompanyDomain } from '@/types/company';

export async function POST(request: NextRequest) {
  console.log('[API/companies] POST iniciado');
  try {
    const body = await request.json();
    console.log('[API/companies] Body recibido:', { name: body.name, adminUid: body.adminUid, adminEmail: body.adminEmail });

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
    console.log('[API/companies] Buscando perfil de usuario:', adminUid);
    const userProfile = await getUserProfileAdmin(adminUid);
    console.log('[API/companies] Perfil encontrado:', userProfile ? 'Sí' : 'No');
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
      const existingCompany = await getCompanyByDomainAdmin(domain);
      if (existingCompany) {
        return NextResponse.json(
          { success: false, error: `Ya existe una empresa registrada con el dominio ${domain}` },
          { status: 409 }
        );
      }
    }

    // Crear la empresa en Firestore (usando Admin SDK para bypass reglas de seguridad)
    console.log('[API/companies] Creando empresa en Firestore...');
    let company;
    try {
      company = await createCompanyAdmin({
        name,
        domain,
        rfc,
        adminEmail,
        adminUid,
        adminName: adminName || userProfile.displayName || 'Admin',
      });
      console.log('[API/companies] Empresa creada:', company.id);
    } catch (firestoreError) {
      console.error('[API/companies] Error en Firestore al crear empresa:', firestoreError);
      throw new Error(`Error al crear empresa en base de datos: ${firestoreError instanceof Error ? firestoreError.message : 'Error desconocido'}`);
    }

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
        await updateCompanyDriveFoldersAdmin(
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
    console.log('[API/companies] Vinculando usuario a empresa...');
    try {
      await linkUserToCompanyAdmin(
        adminUid,
        company.id,
        company.name,
        'admin',
        adminDriveFolderId
      );
      console.log('[API/companies] Usuario vinculado exitosamente');
    } catch (linkError) {
      console.error('[API/companies] Error al vincular usuario:', linkError);
      throw new Error(`Error al vincular usuario con empresa: ${linkError instanceof Error ? linkError.message : 'Error desconocido'}`);
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    // Provide more specific error messages based on the error
    let userFriendlyError = 'Error interno del servidor';
    if (errorMessage.includes('Firestore no disponible')) {
      userFriendlyError = 'Error de conexión con la base de datos. Por favor intenta de nuevo.';
    } else if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
      userFriendlyError = 'Error de permisos. Contacta al administrador.';
    } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
      userFriendlyError = 'Error de red. Verifica tu conexión a internet.';
    }

    return NextResponse.json(
      {
        success: false,
        error: `${userFriendlyError} (${errorMessage})`,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
