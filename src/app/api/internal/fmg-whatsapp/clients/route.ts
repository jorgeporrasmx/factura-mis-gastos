import { timingSafeEqual } from 'node:crypto';
import { provisionInvoiceRequestClient } from '@/lib/integrations/fmg-whatsapp-provisioning';
import { cleanEnv } from '@/lib/integrations/fmg-whatsapp-core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(request: Request): boolean {
  const configured = cleanEnv(process.env.FMG_AUTOMATION_SECRET);
  const header = request.headers.get('authorization') || '';
  const received = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!configured || !received) return false;
  const left = Buffer.from(configured);
  const right = Buffer.from(received);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: {
    companyId?: string;
    fiscalProfile?: {
      legalName?: string;
      rfc?: string;
      taxRegime?: string;
      postalCode?: string;
      cfdiUse?: string;
      invoiceEmail?: string;
      csfUrl?: string;
      verifiedAt?: string;
      verifiedBy?: string;
    };
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const profile = body.fiscalProfile;
  if (
    !body.companyId ||
    !profile?.legalName ||
    !profile.rfc ||
    !profile.taxRegime ||
    !profile.postalCode ||
    !profile.cfdiUse ||
    !profile.invoiceEmail ||
    !profile.csfUrl ||
    !profile.verifiedAt ||
    !profile.verifiedBy
  ) {
    return Response.json(
      { error: 'Faltan la empresa o datos fiscales verificados' },
      { status: 400 }
    );
  }

  try {
    const result = await provisionInvoiceRequestClient({
      companyId: body.companyId,
      fiscalProfile: {
        legalName: profile.legalName,
        rfc: profile.rfc,
        taxRegime: profile.taxRegime,
        postalCode: profile.postalCode,
        cfdiUse: profile.cfdiUse,
        invoiceEmail: profile.invoiceEmail,
        csfUrl: profile.csfUrl,
        verifiedAt: profile.verifiedAt,
        verifiedBy: profile.verifiedBy,
      },
    });
    return Response.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return Response.json({ success: false, error: message }, { status: 422 });
  }
}
