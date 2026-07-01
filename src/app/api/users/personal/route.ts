// API para crear cuenta personal sin empresa
// POST /api/users/personal - Completar onboarding como usuario personal

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  createUserProfileAdmin,
  updateUserProfileAdmin,
  completeOnboardingAdmin,
} from '@/lib/firebase/firestore-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { uid, displayName, photoURL } = body;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    // Validaciones
    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos: uid, email' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Obtener o crear perfil del usuario (fix race condition)
    let userProfile = await getUserProfileAdmin(uid);
    if (!userProfile) {
      // Crear perfil si no existe (puede pasar por timing en onboarding)
      userProfile = await createUserProfileAdmin({
        uid,
        email,
        displayName: displayName || null,
        photoURL: photoURL || null,
      });
    } else if (!userProfile.email) {
      await updateUserProfileAdmin(uid, { email });
      userProfile = { ...userProfile, email };
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
