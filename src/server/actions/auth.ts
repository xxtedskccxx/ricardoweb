"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "./product";

/**
 * Generic error message regardless of whether the email exists, the
 * password is wrong, or the account isn't an authorized admin — avoids
 * user enumeration.
 */
const GENERIC_LOGIN_ERROR = "Correo o contraseña incorrectos.";

export async function loginAdmin(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    return { success: false, error: GENERIC_LOGIN_ERROR };
  }

  redirect((next.startsWith("/admin") ? next : "/admin") as Route);
}

export async function logoutAdmin(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
