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
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard'); // Example protected route

      if (isOnDashboard) {
        if (isLoggedIn) return true; // Allow access if logged in
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Optionally redirect logged-in users from login page to dashboard
        // if (nextUrl.pathname === '/login') {
        //   return Response.redirect(new URL('/dashboard', nextUrl));
        // }
      }
      return true; // Allow access to other pages by default
    },
  },
  // trustHost is generally recommended for Vercel deployments
  trustHost: true,
} satisfies NextAuthConfig;
