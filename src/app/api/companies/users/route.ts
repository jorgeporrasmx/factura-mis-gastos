// API para obtener usuarios de una empresa (solo admin)
// GET /api/companies/users - Lista usuarios de la empresa del admin

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfile,
  getCompanyUsers,
  getCompanyById,
} from '@/lib/firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Obtener UID del header (en producción, verificar con Firebase Admin SDK)
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
        { success: false, error: 'No perteneces a ninguna empresa' },
        { status: 400 }
      );
    }

    // Verificar que es admin
    if (userProfile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Solo los administradores pueden ver la lista de usuarios' },
        { status: 403 }
      );
    }

    // Obtener información de la empresa
    const company = await getCompanyById(userProfile.companyId);

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Obtener usuarios de la empresa
    const users = await getCompanyUsers(userProfile.companyId);

    // Separar admins y usuarios
    const admins = users.filter(u => u.role === 'admin');
    const regularUsers = users.filter(u => u.role === 'user');

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
      },
      users: {
        total: users.length,
        admins: admins.length,
        users: regularUsers.length,
        list: users.map(user => ({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: user.role,
          status: user.status,
          hasDriveFolder: Boolean(user.driveFolderId),
          lastLoginAt: user.lastLoginAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
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
