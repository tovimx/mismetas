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
      console.log('[AUTHZ] Path:', nextUrl.pathname, '| Logged In:', isLoggedIn);
      // TEMPORARILY REMOVE REDIRECT LOGIC TO DEBUG "Invalid URL" error
      // Always return true for now to see if the URL error stops
      return true;

      // Original Logic (commented out):
      // const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      //
      // if (isOnDashboard) {
      //   if (isLoggedIn) return true;
      //   return false;
      // } else if (isLoggedIn) {
      //   // if (nextUrl.pathname === '/login') {
      //   //   return Response.redirect(new URL('/dashboard', nextUrl));
      //   // }
      // }
      // return true;
    },
  },
  // trustHost is generally recommended for Vercel deployments
  trustHost: true,
} satisfies NextAuthConfig;
