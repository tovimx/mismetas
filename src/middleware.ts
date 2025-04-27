import NextAuth from 'next-auth';
import { authConfig } from '../auth.config'; // Import the edge-compatible config

// Initialize NextAuth with ONLY the edge-compatible config
const { auth } = NextAuth(authConfig);

// Use the edge-compatible 'auth' helper for middleware logic
export default auth(req => {
  // Your middleware logic here.
  // The 'req.auth' object will contain the session info if authenticated.
  // The 'authorized' callback in auth.config.ts handles redirection logic.
  console.log('Middleware running for:', req.nextUrl.pathname);
  // You can add more logic here if needed, beyond the authorized callback
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
