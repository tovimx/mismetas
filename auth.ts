import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import authConfig from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' as const },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});
