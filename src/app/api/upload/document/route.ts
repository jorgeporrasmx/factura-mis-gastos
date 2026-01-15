// API para subir documentos de empresa (CSF, Cédula) a Google Drive
// POST /api/upload/document - Solo admin puede subir documentos de empresa

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfile,
  getCompanyById,
  updateCompany,
} from '@/lib/firebase/firestore';
import {
  uploadFile,
  generateUniqueFileName,
  isDriveConfigured,
} from '@/lib/google-drive';

// Tipos de documento permitidos
type DocumentType = 'csf' | 'cedula';

// Tipos MIME permitidos para documentos
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
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

    // Obtener perfil del usuario
    const userProfile = await getUserProfile(uid);

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que tiene empresa
    if (!userProfile.companyId) {
      return NextResponse.json(
        { success: false, error: 'Debes pertenecer a una empresa' },
        { status: 400 }
      );
    }

    // Verificar que es admin
    if (userProfile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Solo los administradores pueden subir documentos de empresa' },
        { status: 403 }
      );
    }

    // Obtener empresa
    const company = await getCompanyById(userProfile.companyId);

    if (!company || !company.driveDocsFolderId) {
      return NextResponse.json(
        { success: false, error: 'La empresa no tiene carpeta de documentos configurada' },
        { status: 400 }
      );
    }

    // Obtener el archivo y tipo del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as DocumentType | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    if (!documentType || !['csf', 'cedula'].includes(documentType)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de documento inválido. Debe ser "csf" o "cedula"' },
        { status: 400 }
      );
    }

    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: PDF, JPG, PNG`,
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

    // Convertir archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generar nombre con prefijo según tipo
    const prefix = documentType === 'csf' ? 'CSF' : 'Cedula';
    const extension = file.name.split('.').pop() || 'pdf';
    const fileName = `${prefix}_${company.name.replace(/\s+/g, '_')}_${Date.now()}.${extension}`;

    // Subir archivo a carpeta de documentos de empresa
    const uploadResult = await uploadFile(
      company.driveDocsFolderId,
      buffer,
      fileName,
      file.type
    );

    // Actualizar empresa con URL del documento
    const updateData: Record<string, string> = {};
    if (documentType === 'csf') {
      updateData.csfUrl = uploadResult.webViewLink;
      updateData.csfDriveId = uploadResult.fileId;
    } else {
      updateData.cedulaUrl = uploadResult.webViewLink;
      updateData.cedulaDriveId = uploadResult.fileId;
    }

    await updateCompany(company.id, updateData);

    return NextResponse.json({
      success: true,
      message: `${documentType === 'csf' ? 'Constancia Fiscal' : 'Cédula'} subida exitosamente`,
      file: {
        id: uploadResult.fileId,
        name: fileName,
        url: uploadResult.webViewLink,
        type: documentType,
        mimeType: file.type,
        size: file.size,
      },
    });
  } catch (error) {
    console.error('Error subiendo documento:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al subir el documento',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// GET /api/upload/document - Obtener documentos de la empresa
export async function GET(request: NextRequest) {
  try {
    const uid = request.headers.get('x-user-uid');

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userProfile = await getUserProfile(uid);

    if (!userProfile || !userProfile.companyId) {
      return NextResponse.json(
        { success: false, error: 'Usuario o empresa no encontrada' },
        { status: 404 }
      );
    }

    const company = await getCompanyById(userProfile.companyId);

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: {
        csf: company.csfUrl
          ? { url: company.csfUrl, driveId: company.csfDriveId }
          : null,
        cedula: company.cedulaUrl
          ? { url: company.cedulaUrl, driveId: company.cedulaDriveId }
          : null,
      },
    });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
