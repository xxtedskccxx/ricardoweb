"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { dbQuery } from "@/lib/db";
import { getServerEnv } from "@/lib/env";
import { createSessionToken, SESSION_AGE_SECONDS } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { ADMIN_SESSION_COOKIE } from "@/server/auth";
import type { ActionResult } from "./product";

const GENERIC_LOGIN_ERROR = "Correo o contraseña incorrectos.";

export async function loginAdmin(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  if (!email || !password) return { success: false, error: GENERIC_LOGIN_ERROR };

  let rows: { id: string; email: string; password_hash: string }[];
  try {
    rows = await dbQuery<{ id: string; email: string; password_hash: string }>(
      "SELECT id, email, password_hash FROM admins WHERE lower(email) = lower($1) LIMIT 1",
      [email],
    );
  } catch {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }
  const admin = rows[0];
  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

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
