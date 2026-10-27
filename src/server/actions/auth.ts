"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { dbQuery } from "@/lib/db";
import { getServerEnv } from "@/lib/env";
import { createSessionToken, SESSION_AGE_SECONDS } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ADMIN_SESSION_COOKIE, requireAdmin } from "@/server/auth";
import type { ActionResult } from "./product";

const GENERIC_LOGIN_ERROR = "Correo o contraseña incorrectos.";
const LOCKED_OUT_ERROR = "Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.";
const LOCKOUT_MINUTES = 15;
const MAX_FAILURES_PER_EMAIL = 5;
const MAX_FAILURES_PER_IP = 20;

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

async function recordFailedAttempt(email: string, ip: string) {
  try {
    await dbQuery("INSERT INTO login_attempts (email, ip) VALUES ($1, $2)", [email, ip]);
    await dbQuery("DELETE FROM login_attempts WHERE attempted_at < now() - interval '1 day'");
  } catch { /* throttling state is best effort */ }
}

export async function loginAdmin(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  if (!email || !password) return { success: false, error: GENERIC_LOGIN_ERROR };
  const ip = await clientIp();

  let rows: { id: string; email: string; password_hash: string }[];
  try {
    const recent = await dbQuery<{ by_email: number; by_ip: number }>(
      `SELECT count(*) FILTER (WHERE email = $1)::int AS by_email, count(*) FILTER (WHERE ip = $2)::int AS by_ip
       FROM login_attempts WHERE attempted_at > now() - make_interval(mins => $3) AND (email = $1 OR ip = $2)`,
      [email, ip, LOCKOUT_MINUTES],
    );
    const counts = recent[0];
    if (counts && (counts.by_email >= MAX_FAILURES_PER_EMAIL || counts.by_ip >= MAX_FAILURES_PER_IP)) {
      return { success: false, error: LOCKED_OUT_ERROR };
    }
    rows = await dbQuery<{ id: string; email: string; password_hash: string }>(
      "SELECT id, email, password_hash FROM admins WHERE lower(email) = lower($1) LIMIT 1",
      [email],
    );
  } catch {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }
  const admin = rows[0];
  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    await recordFailedAttempt(email, ip);
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }
  try { await dbQuery("DELETE FROM login_attempts WHERE email = $1", [email]); } catch { /* throttling state is best effort */ }

  const token = await createSessionToken(
    { sub: admin.id, email: admin.email },
    getServerEnv().AUTH_SECRET,
  );
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  });

  const safeNext = /^\/admin(?:\/|$)/.test(next) ? next : "/admin";
  redirect(safeNext as Route);
}

export async function logoutAdmin(): Promise<void> {
  (await cookies()).set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  redirect("/admin/login");
}

const MIN_PASSWORD_LENGTH = 12;

export async function changeAdminPassword(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { admin } = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < MIN_PASSWORD_LENGTH) {
    return { success: false, error: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  }
  if (next !== confirm) {
    return { success: false, error: "Las contraseñas nuevas no coinciden." };
  }

  const rows = await dbQuery<{ password_hash: string }>(
    "SELECT password_hash FROM admins WHERE id = $1 LIMIT 1",
    [admin.sub],
  );
  if (!rows[0] || !(await verifyPassword(current, rows[0].password_hash))) {
    return { success: false, error: "La contraseña actual no es correcta." };
  }

  await dbQuery("UPDATE admins SET password_hash = $1 WHERE id = $2", [
    await hashPassword(next),
    admin.sub,
  ]);
  return { success: true };
}
