// API para crear cuenta personal sin empresa
// POST /api/users/personal - Completar onboarding como usuario personal

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfile,
  createUserProfile,
  completeOnboarding,
} from '@/lib/firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { uid, email, displayName, photoURL } = body;

    // Validaciones
    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: uid, email' },
        { status: 400 }
      );
    }

    // Obtener o crear perfil del usuario (fix race condition)
    let userProfile = await getUserProfile(uid);
    if (!userProfile) {
      // Crear perfil si no existe (puede pasar por timing en onboarding)
      userProfile = await createUserProfile({
        uid,
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
      });
    }

    // Verificar que el usuario no ya pertenezca a una empresa
    if (userProfile.companyId) {
      return NextResponse.json(
        { success: false, error: 'Ya perteneces a una empresa. Usa la opción de empleado.' },
        { status: 400 }
      );
    }

    // Completar onboarding como usuario personal
    await completeOnboarding(uid, 'personal');

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
