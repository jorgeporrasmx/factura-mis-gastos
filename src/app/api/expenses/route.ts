// API para listar gastos
// GET /api/expenses - Lista gastos con filtros y paginación

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfile,
  getExpenses,
  getExpenseSummary,
} from '@/lib/firebase/firestore';
import type { ExpenseFilters, ExpenseSortOptions, ExpenseStatus, ExpenseCategory } from '@/types/expenses';

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

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;

    // Construir filtros
    const filters: ExpenseFilters = {};

    // Si es usuario normal, solo puede ver sus propios gastos
    if (userProfile.role !== 'admin') {
      filters.userId = uid;
    } else {
      // Admin puede filtrar por usuario específico
      const userIdFilter = searchParams.get('userId');
      if (userIdFilter) {
        filters.userId = userIdFilter;
      }
    }

    // Otros filtros
    const estado = searchParams.get('estado') as ExpenseStatus | null;
    if (estado) filters.estado = estado;

    const categoria = searchParams.get('categoria') as ExpenseCategory | null;
    if (categoria) filters.categoria = categoria;

    const fechaDesde = searchParams.get('fechaDesde');
    if (fechaDesde) filters.fechaDesde = new Date(fechaDesde);

    const fechaHasta = searchParams.get('fechaHasta');
    if (fechaHasta) filters.fechaHasta = new Date(fechaHasta);

    const search = searchParams.get('search');
    if (search) filters.search = search;

    // Ordenamiento
    const sortField = searchParams.get('sortField') as ExpenseSortOptions['field'] | null;
    const sortDirection = searchParams.get('sortDirection') as ExpenseSortOptions['direction'] | null;

    const sort: ExpenseSortOptions | undefined = sortField
      ? { field: sortField, direction: sortDirection || 'desc' }
      : undefined;

    // Paginación
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 20;
    const cursor = searchParams.get('cursor') || undefined;

    // Obtener gastos
    const { expenses, hasMore, lastId } = await getExpenses(
      userProfile.companyId,
      filters,
      sort,
      limit,
      cursor
    );

    // Obtener resumen (solo si es la primera página)
    let summary = null;
    if (!cursor) {
      summary = await getExpenseSummary(
        userProfile.companyId,
        userProfile.role !== 'admin' ? uid : filters.userId
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        expenses: expenses.map(exp => ({
          ...exp,
          fecha: exp.fecha.toISOString(),
          createdAt: exp.createdAt.toISOString(),
          updatedAt: exp.updatedAt.toISOString(),
          syncedAt: exp.syncedAt.toISOString(),
        })),
        summary,
        pagination: {
          hasMore,
          nextCursor: lastId,
          limit,
        },
        filters: {
          applied: filters,
          userRole: userProfile.role,
        },
      },
    });
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener gastos',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
