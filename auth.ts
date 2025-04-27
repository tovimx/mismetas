import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import authConfig from './auth.config';

console.log('ENV CHECK:', {
  AUTH_SECRET: process.env.AUTH_SECRET,
});
// Log env variables for debugging (values will be undefined in logs for security)
console.log('Auth configuration environment check:', {
  authUrlConfigured: !!process.env.AUTH_URL,
  googleIdConfigured: !!process.env.AUTH_GOOGLE_ID,
  googleSecretConfigured: !!process.env.AUTH_GOOGLE_SECRET,
  authSecretConfigured: !!process.env.AUTH_SECRET,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' as const },
  debug: true,
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      try {
        if (session.user && token.sub) {
          session.user.id = token.sub;
          if (token.name) session.user.name = token.name;
          if (token.email) session.user.email = token.email;
          if (token.picture) session.user.image = token.picture;
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        throw error;
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (user) {
          token.id = user.id;
        }
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        throw error;
      }
    },
  },
  events: {
    signIn({ user, account }) {
      console.log('Sign in event:', {
        userId: user?.id,
        provider: account?.provider,
        email: user?.email,
      });
    },
  },
});
