import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simplified middleware - just handle the root redirect for now
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect root to login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

// See https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. /favicon.ico, /sitemap.xml (inside /public)
     */
    '/((?!api|_next|fonts|favicon.ico|sitemap.xml).*)',
  ],
}; 