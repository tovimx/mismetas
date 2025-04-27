import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!, // The exclamation mark here tells TypeScript you know it won't be undefined at runtime
      clientSecret: process.env.AUTH_GOOGLE_SECRET!, // Same for the client secret
    }),
  ],
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/login' },
  debug: true,
  trustHost: true,
  secret: process.env.AUTH_SECRET!, // And for the secret too
  callbacks: {
    authorized: async ({ auth }) => !!auth,
    async signIn({ account, profile }) {
      console.log('Sign in attempt:', { accountType: account?.provider, email: profile?.email });
      return true;
    },
  },
};

// Check if environment variables are set at runtime, throw an error if not
if (typeof window === 'undefined') {
    if (!process.env.AUTH_SECRET) {
        throw new Error('AUTH_SECRET environment variable is not set!');
    }
    if (!process.env.AUTH_GOOGLE_ID) {
        throw new Error('AUTH_GOOGLE_ID environment variable is not set!');
    }
    if (!process.env.AUTH_GOOGLE_SECRET) {
        throw new Error('AUTH_GOOGLE_SECRET environment variable is not set!');
    }
}

export default authConfig;
