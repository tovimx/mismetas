import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

export default {
  providers: [Google],
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/login' },
  callbacks: {
    authorized: async ({ auth }) => !!auth,
  },
} satisfies NextAuthConfig;
