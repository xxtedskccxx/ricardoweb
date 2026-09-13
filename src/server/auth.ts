import "server-only";
import { cookies } from "next/headers";
import { dbQuery } from "@/lib/db";
import { getServerEnv } from "@/lib/env";
import { verifySessionToken, type AdminSession } from "@/lib/auth/session";

export const ADMIN_SESSION_COOKIE = "altamar_admin_session";

export class UnauthorizedError extends Error {
  constructor() { super("No autorizado."); this.name = "UnauthorizedError"; }
}

export async function readAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token, getServerEnv().AUTH_SECRET);
  if (!session) return null;
  const admin = await dbQuery<{ id: string; email: string }>(
    "SELECT id, email FROM admins WHERE id = $1 LIMIT 1",
    [session.sub],
  );
  const row = admin[0];
  return row ? { sub: row.id, email: row.email, role: "admin" } : null;
}

/** Server-side authorization boundary for every admin page and mutation. */
export async function requireAdmin() {
  const admin = await readAdminSession();
  if (!admin) throw new UnauthorizedError();
  return { admin };
}
