// API para obtener resumen de gastos
// GET /api/expenses/summary - Obtiene estadísticas de gastos

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfile,
  getExpenseSummary,
  getCompanyById,
} from '@/lib/firebase/firestore';

export async function GET(request: NextRequest) {
  try {
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

    // Obtener empresa para info adicional
    const company = await getCompanyById(userProfile.companyId);

    // Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const userIdFilter = searchParams.get('userId');

    // Determinar qué gastos incluir
    let targetUserId: string | undefined;

    if (userProfile.role !== 'admin') {
      // Usuarios normales solo ven su resumen
      targetUserId = uid;
    } else if (userIdFilter) {
      // Admin filtra por usuario específico
      targetUserId = userIdFilter;
    }
    // Si admin sin filtro, ve resumen de toda la empresa (targetUserId = undefined)

    // Obtener resumen
    const summary = await getExpenseSummary(userProfile.companyId, targetUserId);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        company: company ? {
          id: company.id,
          name: company.name,
          mondayBoardConfigured: Boolean(company.mondayBoardId),
        } : null,
        user: {
          role: userProfile.role,
          viewingAll: userProfile.role === 'admin' && !targetUserId,
          filteredByUser: targetUserId || null,
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener resumen',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
