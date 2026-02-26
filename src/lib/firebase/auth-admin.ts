// Server-side auth verification using Firebase Admin SDK
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getAdminApp } from './admin';
import { NextRequest, NextResponse } from 'next/server';

let _adminAuth: Auth | null = null;

function getAdminAuth(): Auth | null {
  if (!_adminAuth) {
    const app = getAdminApp();
    if (app) {
      _adminAuth = getAuth(app);
    }
  }
  return _adminAuth;
}

export interface AuthSuccess {
  success: true;
  uid: string;
  email?: string;
}

interface AuthFailure {
  success: false;
  error: string;
  status: number;
}

export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Verifica el Firebase ID Token del header Authorization.
 * Retorna el UID y email decodificados en éxito, o un error en fallo.
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Token de autorización requerido', status: 401 };
  }

  const idToken = authHeader.split('Bearer ')[1];
  if (!idToken) {
    return { success: false, error: 'Token de autorización inválido', status: 401 };
  }

  const auth = getAdminAuth();
  if (!auth) {
    return { success: false, error: 'Error de configuración del servidor', status: 500 };
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return { success: true, uid: decodedToken.uid, email: decodedToken.email };
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === 'auth/id-token-expired') {
      return { success: false, error: 'Token expirado. Inicia sesión de nuevo.', status: 401 };
    }
    return { success: false, error: 'Token inválido', status: 401 };
  }
}

/**
 * Helper que retorna NextResponse de error para auth failures.
 */
export function authErrorResponse(result: AuthFailure): NextResponse {
  return NextResponse.json(
    { success: false, error: result.error },
    { status: result.status }
  );
}
