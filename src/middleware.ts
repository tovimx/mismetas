import authConfig from '../auth.config';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth(async function middleware() {
  // For now, just let all requests through
  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
