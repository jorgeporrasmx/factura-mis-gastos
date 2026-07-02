// API admin (protegida) para generar inviteCode en empresas activas que no lo
// tengan. Es idempotente: correrla varias veces no duplica ni sobrescribe
// códigos válidos. No toca cuentas personales de usuario (esas no viven en la
// colección `companies`).
//
// Protección: requiere el header `x-user-uid` de un usuario con role: 'admin'.
// No introduce nuevos secretos/env vars: reusa el patrón de auth por header
// que ya usan el resto de endpoints internos.
//
// Uso:
//   GET  /api/admin/backfill-invite-codes    -> dry-run (lista lo que haría)
//   POST /api/admin/backfill-invite-codes    -> aplica los cambios

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserProfileAdmin,
  getActiveCompaniesMissingInviteCodeAdmin,
  isInviteCodeAvailableAdmin,
  updateCompanyAdmin,
} from '@/lib/firebase/firestore-admin';
import { generateInviteCode } from '@/types/company';

async function requireAdmin(request: NextRequest) {
  const uid = request.headers.get('x-user-uid');
  if (!uid) {
    return { error: NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 }) };
  }
  const profile = await getUserProfileAdmin(uid);
  if (!profile) {
    return { error: NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 }) };
  }
  if (profile.role !== 'admin') {
    return { error: NextResponse.json({ success: false, error: 'Solo administradores' }, { status: 403 }) };
  }
  return { uid };
}

// Genera un código único evitando colisiones (misma lógica que al crear empresa).
async function generateUniqueInviteCode(name: string): Promise<string> {
  const base = generateInviteCode(name) || 'empresa';
  let candidate = base;
  let suffix = 2;
  // Límite de seguridad para no hacer un bucle infinito.
  while (suffix < 1000 && !(await isInviteCodeAvailableAdmin(candidate))) {
    candidate = `${base}-${suffix}`;
    suffix++;
  }
  return candidate;
}

// GET = dry-run: sólo reporta qué empresas recibirían código.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  const companies = await getActiveCompaniesMissingInviteCodeAdmin();
  return NextResponse.json({
    success: true,
    dryRun: true,
    count: companies.length,
    companies: companies.map((c) => ({ id: c.id, name: c.name, domain: c.domain })),
  });
}

// POST = aplica: genera y guarda inviteCode donde falte.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const companies = await getActiveCompaniesMissingInviteCodeAdmin();
    const results: Array<{ id: string; name: string; inviteCode: string }> = [];
    const errors: Array<{ id: string; error: string }> = [];

    // Códigos ya asignados en esta misma corrida (para evitar colisiones entre
    // empresas con el mismo nombre dentro del mismo batch).
    const assignedThisRun = new Set<string>();

    for (const company of companies) {
      try {
        let inviteCode = await generateUniqueInviteCode(company.name);
        // Evitar colisión con otro código recién asignado en este batch.
        let suffix = 2;
        const base = inviteCode;
        while (assignedThisRun.has(inviteCode)) {
          inviteCode = `${base}-${suffix}`;
          suffix++;
        }
        assignedThisRun.add(inviteCode);

        await updateCompanyAdmin(company.id, { inviteCode });
        results.push({ id: company.id, name: company.name, inviteCode });
      } catch (err) {
        errors.push({
          id: company.id,
          error: err instanceof Error ? err.message : 'Error desconocido',
        });
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error en backfill de inviteCode:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar códigos de invitación',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
