// Only include client-side exports
// The server-side authentication is handled in /api/auth/[...nextauth]/route.ts
export { signIn, signOut } from "next-auth/react"; 