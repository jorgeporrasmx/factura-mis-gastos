// Autenticación de rutas API con Firebase ID tokens verificados.
// El cliente envía `Authorization: Bearer <idToken>`; aquí se verifica con el
// Admin SDK y se deriva el uid. El header `x-user-uid` solo se acepta como
// fallback si ALLOW_LEGACY_UID_HEADER=true (transición controlada).

import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/firebase/admin';

export async function getAuthenticatedUid(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const idToken = authHeader.slice('Bearer '.length).trim();
    if (idToken) {
      const app = getAdminApp();
      if (!app) {
        console.error('[api-auth] Firebase Admin no configurado; no se puede verificar el token');
        return null;
      }
      try {
        const decoded = await getAuth(app).verifyIdToken(idToken);
        return decoded.uid;
      } catch (error) {
        console.warn('[api-auth] Token inválido o expirado:', error instanceof Error ? error.message : error);
        return null;
      }
    }
  }

  if (process.env.ALLOW_LEGACY_UID_HEADER === 'true') {
    return request.headers.get('x-user-uid');
  }

  return null;
}
