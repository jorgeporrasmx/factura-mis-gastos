// API para crear cuenta personal sin empresa
// POST /api/users/personal - Completar onboarding como usuario personal

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  completeOnboardingAdmin,
} from '@/lib/firebase/firestore-admin';

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
    const userProfile = await getUserProfileAdmin(uid);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario no ya pertenezca a una empresa
    if (userProfile.companyId) {
      return NextResponse.json(
        { success: false, error: 'Ya perteneces a una empresa. Usa la opción de empleado.' },
        { status: 400 }
      );
    }

    // Completar onboarding como usuario personal
    await completeOnboardingAdmin(uid, 'personal');

    return NextResponse.json({
      success: true,
      message: 'Cuenta personal creada exitosamente',
      user: {
        uid,
        email,
        displayName,
        accountType: 'personal',
      },
    });
  } catch (error) {
    console.error('Error creando cuenta personal:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
