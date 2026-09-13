import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { verifySessionToken } from "@/lib/auth/session";
import { ADMIN_SESSION_COOKIE } from "@/server/auth";

/** Fast UX guard; pages and actions still call requireAdmin() authoritatively. */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  let authenticated = false;
  if (token) {
    try { authenticated = Boolean(await verifySessionToken(token, getServerEnv().AUTH_SECRET)); } catch { authenticated = false; }
  }

  if (pathname === "/admin/login") {
    return authenticated
      ? NextResponse.redirect(new URL("/admin", request.url))
      : NextResponse.next();
  }
  if (!authenticated) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
