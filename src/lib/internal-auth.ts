import { NextRequest } from 'next/server';

function cleanSecret(value: string | undefined): string | undefined {
  return value?.trim().replace(/^["']|["']$/g, '');
}

export function getInternalSecret(): string | undefined {
  return (
    cleanSecret(process.env.FMG_INTERNAL_SECRET) ||
    cleanSecret(process.env.FMG_AUTOMATION_SECRET) ||
    cleanSecret(process.env.INTERNAL_AUTOMATION_TOKEN)
  );
}

export function isInternalRequestAuthorized(request: NextRequest): boolean {
  const expected = getInternalSecret();
  if (!expected) return false;

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  const internalSecret = request.headers.get('x-internal-secret')?.trim();
  const automationSecret = request.headers.get('x-fmg-automation-secret')?.trim();

  return bearer === expected || internalSecret === expected || automationSecret === expected;
}

