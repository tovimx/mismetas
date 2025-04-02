import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

// Get the secret from environment variables
const secret = process.env.AUTH_SECRET;

if (!secret) {
  console.error("AUTH_SECRET environment variable is not set!");
}

const authConfig: NextAuthConfig = {
  providers: [Google],
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/login' },
  debug: true,
  trustHost: true,
  secret: secret, // Explicitly set the secret
  callbacks: {
    authorized: async ({ auth }) => !!auth,
    async signIn({ account, profile }) {
      console.log('Sign in attempt:', { accountType: account?.provider, email: profile?.email });
      return true;
    },
  },
};

export default authConfig;
