import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/portal'];

// Routes that should redirect to portal if authenticated
const authRoutes = ['/auth/login', '/auth/registro'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth session cookie (set by Firebase client SDK)
  // Note: This is a simple check. For production, you might want to
  // verify the token server-side using Firebase Admin SDK
  const hasAuthSession = request.cookies.has('__session') ||
                         request.cookies.has('firebase-auth-token');

  // Check if trying to access protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if trying to access auth route
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // For protected routes without auth, redirect to login
  // Note: Full auth verification happens client-side with Firebase
  // This middleware provides a quick redirect for better UX
  if (isProtectedRoute && !hasAuthSession) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For auth routes with existing session, redirect to portal
  if (isAuthRoute && hasAuthSession) {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
