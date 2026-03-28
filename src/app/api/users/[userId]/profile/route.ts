// API para actualizar perfil del usuario
// PATCH /api/users/[userId]/profile - Actualizar campos del perfil (WhatsApp, etc.)

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  updateUserProfileAdmin,
} from '@/lib/firebase/firestore-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Verificar que el UID del header coincide (el usuario solo puede editar su propio perfil)
    const requestUid = request.headers.get('x-user-uid');
    if (!requestUid || requestUid !== userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userProfile = await getUserProfileAdmin(userId);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Solo permitir actualizar campos seguros del perfil
    const allowedFields = ['whatsappPhone', 'displayName'] as const;
    type AllowedField = typeof allowedFields[number];

    const updates: Partial<Record<AllowedField, string>> = {};

    for (const field of allowedFields) {
      if (field in body && typeof body[field] === 'string') {
        updates[field] = body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      );
    }

    // Validar WhatsApp si viene en el update
    if (updates.whatsappPhone) {
      const cleaned = updates.whatsappPhone.replace(/\D/g, '');
      if (cleaned.length < 10 || cleaned.length > 15) {
        return NextResponse.json(
          { success: false, error: 'Número de WhatsApp inválido. Debe tener entre 10 y 15 dígitos.' },
          { status: 400 }
        );
      }
      // Guardar siempre con + y sin espacios
      updates.whatsappPhone = '+' + cleaned;
    }

    await updateUserProfileAdmin(userId, updates);

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      updates,
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
