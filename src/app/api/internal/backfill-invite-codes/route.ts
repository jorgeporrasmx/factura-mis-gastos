// Endpoint interno de migración: genera inviteCode para empresas existentes
// que no tienen uno. Sin él, el panel de perfil oculta el enlace de invitación
// y esas empresas no pueden invitar empleados.
//
// POST /api/internal/backfill-invite-codes
//   Headers: Authorization: Bearer <FMG_AUTOMATION_SECRET>  (o x-fmg-automation-secret)
//   Body opcional: { "dryRun": true } para ver qué cambiaría sin escribir.

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { isInviteCodeAvailableAdmin } from '@/lib/firebase/firestore-admin';
import { generateInviteCode } from '@/types/company';

function getAutomationSecret(): string | undefined {
  const value = process.env.FMG_AUTOMATION_SECRET || process.env.INTERNAL_AUTOMATION_TOKEN;
  return value?.trim().replace(/^["']|["']$/g, '');
}

function isAuthorized(request: NextRequest): boolean {
  const expected = getAutomationSecret();
  if (!expected) return false;

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const headerSecret = request.headers.get('x-fmg-automation-secret');

  return bearer === expected || headerSecret === expected;
}

async function generateAvailableInviteCode(
  baseName: string,
  reserved: Set<string>
): Promise<string> {
  const base = generateInviteCode(baseName) || 'empresa';
  let candidate = base;
  let suffix = 2;

  while (reserved.has(candidate) || !(await isInviteCodeAvailableAdmin(candidate))) {
    candidate = `${base}-${suffix}`;
    suffix++;
  }

  reserved.add(candidate);
  return candidate;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json(
      { success: false, error: 'Firebase Admin no configurado' },
      { status: 503 }
    );
  }

  let dryRun = false;
  try {
    const body = await request.json();
    dryRun = Boolean(body?.dryRun);
  } catch {
    // body vacío = ejecución real
  }

  try {
    const snapshot = await db.collection('companies').get();
    const reserved = new Set<string>();
    const updated: Array<{ companyId: string; name: string; inviteCode: string }> = [];
    const skipped: Array<{ companyId: string; name: string; inviteCode: string }> = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const existingCode = (data.inviteCode as string | undefined)?.trim();

      if (existingCode) {
        reserved.add(existingCode);
        skipped.push({ companyId: doc.id, name: data.name || '', inviteCode: existingCode });
        continue;
      }

      const inviteCode = await generateAvailableInviteCode(data.name || doc.id, reserved);

      if (!dryRun) {
        await doc.ref.update({ inviteCode, updatedAt: new Date() });
      }

      updated.push({ companyId: doc.id, name: data.name || '', inviteCode });
    }

    return NextResponse.json({
      success: true,
      dryRun,
      total: snapshot.size,
      updatedCount: updated.length,
      updated,
      skippedCount: skipped.length,
    });
  } catch (error) {
    console.error('[backfill-invite-codes] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error ejecutando el backfill',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
