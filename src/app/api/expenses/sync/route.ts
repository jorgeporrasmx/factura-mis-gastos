// API para sincronizar gastos desde Monday.com
// POST /api/expenses/sync - Sincroniza items del tablero de Monday a Firestore

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfile,
  getCompanyById,
  upsertExpenses,
  updateCompanySyncMetadata,
} from '@/lib/firebase/firestore';
import {
  verifyBoardAccess,
  syncBoardToExpenses,
  isMondayConfigured,
} from '@/lib/monday-expenses';
import type { MondayExpenseColumns } from '@/types/monday-expenses';

export async function POST(request: NextRequest) {
  try {
    // Verificar que Monday está configurado
    if (!isMondayConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Monday.com no está configurado' },
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

    // Solo admins pueden sincronizar
    if (userProfile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Solo los administradores pueden sincronizar' },
        { status: 403 }
      );
    }

    // Obtener empresa
    const company = await getCompanyById(userProfile.companyId);

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que tiene Board ID configurado
    if (!company.mondayBoardId) {
      return NextResponse.json(
        {
          success: false,
          error: 'La empresa no tiene un tablero de Monday configurado',
          needsConfiguration: true,
        },
        { status: 400 }
      );
    }

    // Obtener mapeo de columnas del body (opcional)
    let columnMapping: MondayExpenseColumns;

    try {
      const body = await request.json();
      columnMapping = body.columnMapping;
    } catch {
      // Si no hay body, intentar detectar automáticamente
      const verification = await verifyBoardAccess(company.mondayBoardId);

      if (!verification.valid) {
        return NextResponse.json(
          {
            success: false,
            error: verification.error || 'No se pudo acceder al tablero de Monday',
          },
          { status: 400 }
        );
      }

      if (!verification.suggestedMapping) {
        return NextResponse.json(
          {
            success: false,
            error: 'No se pudieron detectar las columnas del tablero',
            columns: verification.columns,
          },
          { status: 400 }
        );
      }

      columnMapping = verification.suggestedMapping as MondayExpenseColumns;
    }

    // Validar que tenemos columnas requeridas
    if (!columnMapping.monto || !columnMapping.fecha || !columnMapping.estado) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan columnas requeridas en el mapeo (monto, fecha, estado)',
        },
        { status: 400 }
      );
    }

    // Sincronizar items desde Monday
    const syncResult = await syncBoardToExpenses(
      company.mondayBoardId,
      columnMapping,
      company.id,
      userProfile.uid,
      userProfile.displayName || 'Admin',
      userProfile.email
    );

    // Guardar en Firestore
    const { created, updated } = await upsertExpenses(company.id, syncResult.expenses);

    // Actualizar metadata de sincronización
    await updateCompanySyncMetadata(company.id, {
      itemsSynced: syncResult.itemsProcessed,
      success: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Sincronización completada',
      data: {
        itemsProcessed: syncResult.itemsProcessed,
        itemsCreated: created,
        itemsUpdated: updated,
        errors: syncResult.errors.length > 0 ? syncResult.errors : undefined,
        lastSyncAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sincronizando:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al sincronizar',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
