import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

// This is the base config - ONLY edge-compatible options
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    // Add other providers here if needed
  ],
  pages: {
    signIn: '/login', // Your custom login page
  },
  // Add callbacks necessary for middleware or basic auth flow, but NOT database interactions
  callbacks: {
    // authorized callback is often used in middleware
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      console.log(
        '[AUTHZ] Path:',
        nextUrl.pathname,
        '| Logged In:',
        isLoggedIn,
        '| OnDashboard:',
        isOnDashboard
      );

      if (isOnDashboard) {
        if (isLoggedIn) {
          console.log('[AUTHZ] Access GRANTED to dashboard');
          return true; // Allow access if logged in
        }
        console.log('[AUTHZ] Access DENIED to dashboard, redirecting to /login');
        // Redirect unauthenticated users to login page using string concatenation
        const loginUrl = `${nextUrl.origin}/login`;
        return Response.redirect(loginUrl);
      } else if (isLoggedIn) {
        // Optionally redirect logged-in users from login page to dashboard
        if (nextUrl.pathname === '/login') {
          console.log('[AUTHZ] Already logged in, redirecting from /login to /dashboard');
          const dashboardUrl = `${nextUrl.origin}/dashboard`;
          return Response.redirect(dashboardUrl);
        }
      }
      console.log('[AUTHZ] Access allowed to non-dashboard page');
      return true; // Allow access to other pages by default
    },
  },
  // trustHost is generally recommended for Vercel deployments
  trustHost: true,
} satisfies NextAuthConfig;
