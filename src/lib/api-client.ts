// Helper del lado cliente para llamar a las APIs internas con el
// ID token de Firebase verificable en el servidor.

import { getFirebaseAuth } from '@/lib/firebase/config';

/**
 * Construye los headers de autenticación para las APIs internas.
 * Incluye `Authorization: Bearer <idToken>` (verificado en servidor) y
 * `x-user-uid` como referencia legacy durante la transición.
 */
export async function getAuthHeaders(
  extra?: Record<string, string>
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...extra };

  const auth = getFirebaseAuth();
  const user = auth?.currentUser;

  if (user) {
    headers['x-user-uid'] = user.uid;
    try {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.warn('[api-client] No se pudo obtener el ID token:', error);
    }
  }

  return headers;
}
