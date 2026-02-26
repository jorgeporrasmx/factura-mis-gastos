import { getFirebaseAuth } from './config';

/**
 * Obtiene el Firebase ID Token del usuario actual.
 * El SDK refresca automáticamente tokens por expirar.
 * Retorna null si no hay usuario autenticado.
 */
export async function getAuthToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return null;

  try {
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error obteniendo auth token:', error);
    return null;
  }
}

/**
 * Genera headers de autenticación con Bearer token.
 * Retorna objeto vacío si no hay token disponible.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
