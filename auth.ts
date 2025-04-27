import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import { authConfig } from './auth.config';

console.log('ENV CHECK:', {
  AUTH_SECRET: process.env.AUTH_SECRET,
});
// Log env variables for debugging (values will be undefined in logs for security)
console.log('Auth configuration environment check:', {
  authUrlConfigured: !!process.env.AUTH_URL,
  googleIdConfigured: !!process.env.AUTH_GOOGLE_ID,
  googleSecretConfigured: !!process.env.AUTH_GOOGLE_SECRET,
  authSecretConfigured: !!process.env.AUTH_SECRET,
  databaseUrlConfigured: !!process.env.DATABASE_URL,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' as const },
  secret: process.env.AUTH_SECRET,
  debug: true,
  logger: {
    error: (error: Error) => {
      console.error('AUTH.JS SERVER ERROR:', error);
    },
    warn: (code: string) => {
      console.warn('AUTH.JS SERVER WARNING:', code);
    },
    debug: (code: string, metadata: unknown) => {
      console.log('AUTH.JS SERVER DEBUG:', code, metadata);
    },
  },
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
      console.log(`SIGN IN EVENT: User ${user?.id} signed in.`);
    },
  },
});
