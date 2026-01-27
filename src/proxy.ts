import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Firebase Auth uses IndexedDB for persistence, not cookies
  // So we can't check auth state in proxy/middleware
  // Auth protection is handled client-side in the portal layout
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
