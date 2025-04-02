import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

// Get all required environment variables
const secret = process.env.AUTH_SECRET;
const googleId = process.env.AUTH_GOOGLE_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET;

// Log which variables are missing
if (!secret) console.error("AUTH_SECRET environment variable is not set!");
if (!googleId) console.error("AUTH_GOOGLE_ID environment variable is not set!");
if (!googleSecret) console.error("AUTH_GOOGLE_SECRET environment variable is not set!");

const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: googleId || "missing-google-client-id",
      clientSecret: googleSecret || "missing-google-client-secret",
    }),
  ],
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/login' },
  debug: true,
  trustHost: true,
  secret: secret,
  callbacks: {
    authorized: async ({ auth }) => !!auth,
    async signIn({ account, profile }) {
      console.log('Sign in attempt:', { accountType: account?.provider, email: profile?.email });
      return true;
    },
  },
};

export default authConfig;
