import type { NextConfig } from "next";

// Using the simplest form of next.config.js for Turbopack
// See: https://nextjs.org/docs/app/api-reference/next-config-js/turbo
const nextConfig: NextConfig = {
  // Create a separate .ts file for server-side code with bcrypt
  // Isolate bcrypt to server-only code
  // No Turbopack-specific configuration needed, just using server components
};

export default nextConfig;
