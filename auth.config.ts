import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/login' },
  debug: true,
  trustHost: true,
  secret: process.env.AUTH_SECRET!,
  callbacks: {
    authorized: async ({ auth }) => !!auth,
    async signIn({ account, profile }) {
      console.log('Sign in attempt:', { accountType: account?.provider, email: profile?.email });
      return true;
    },
  },
};

export default authConfig;
