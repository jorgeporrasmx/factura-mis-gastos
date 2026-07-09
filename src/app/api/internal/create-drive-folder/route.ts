import { NextRequest, NextResponse } from 'next/server';
import { isInternalRequestAuthorized } from '@/lib/internal-auth';
import { createDriveFolderForOnboarding } from '@/lib/fmg-onboarding';

export async function POST(request: NextRequest) {
  if (!isInternalRequestAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await createDriveFolderForOnboarding(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[internal/create-drive-folder] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno',
      },
      { status: 500 }
    );
  }
}

