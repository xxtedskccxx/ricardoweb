import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class UnauthorizedError extends Error {
  constructor() {
    super("No autorizado.");
    this.name = "UnauthorizedError";
  }
}

/**
 * The real security boundary for every admin query and Server Action.
 * Calls `auth.getUser()` — which validates the JWT against the auth
 * server — rather than trusting the locally-cached session, then checks
 * membership in the `admins` allow-list. Throws before any input is read
 * if either check fails. Middleware redirects are UX only; this (plus RLS)
 * is what actually protects the data.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new UnauthorizedError();
  }

  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    throw new UnauthorizedError();
  }

  return { supabase, user };
}
