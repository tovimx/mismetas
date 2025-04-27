import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

// Utilidades para obtener secretos solo en runtime
function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET environment variable is not set!');
  return secret;
}
function getGoogleId() {
  const id = process.env.AUTH_GOOGLE_ID;
  if (!id) throw new Error('AUTH_GOOGLE_ID environment variable is not set!');
  return id;
}
function getGoogleSecret() {
  const secret = process.env.AUTH_GOOGLE_SECRET;
  if (!secret) throw new Error('AUTH_GOOGLE_SECRET environment variable is not set!');
  return secret;
}

const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: getGoogleId(),
      clientSecret: getGoogleSecret(),
    }),
  ],
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/login' },
  debug: true,
  trustHost: true,
  secret: getAuthSecret(),
  callbacks: {
    authorized: async ({ auth }) => !!auth,
    async signIn({ account, profile }) {
      console.log('Sign in attempt:', { accountType: account?.provider, email: profile?.email });
      return true;
    },
  },
};

export default authConfig;
