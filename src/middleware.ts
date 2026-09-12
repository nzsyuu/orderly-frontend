import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "token";

const publicPaths = ["/login", "/cadastro", "/verificar"];

const protectedPaths = ["/estoque", "/produtos"];

function isPublicPath(pathname: string) {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isProtectedPath(pathname: string) {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const hasToken = request.cookies.has(AUTH_COOKIE);

  if (isPublicPath(pathname)) {
    if (hasToken && (pathname === "/login" || pathname === "/cadastro")) {
      return NextResponse.redirect(new URL("/estoque", request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
