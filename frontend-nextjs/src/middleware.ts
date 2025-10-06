import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/auth/login",
  "/api/auth/google",
  "/api/auth/google/callback",
  "/auth/logout",
];

export function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path || // Exact match
      request.nextUrl.pathname.startsWith("/api/") || // All API routes
      request.nextUrl.pathname.startsWith(path + "/"), // Subpaths
  );

  // Allow public paths without session
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get session token from cookies
  const session = request.cookies.get("benkyfy_session");

  // Redirect to login if no session
  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
