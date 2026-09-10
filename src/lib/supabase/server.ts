import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Server-side Supabase client bound to the request's cookies. Used from
 * Server Components, Server Actions and Route Handlers. Reads/writes the
 * anon-scoped session cookie — RLS still applies, this does not bypass it.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component render — middleware refreshes
            // the session instead. Safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * Service-role client — bypasses RLS entirely. Used ONLY by the seed
 * script and, if ever needed, one-off admin-bootstrap scripts. Never
 * imported from request-path code (Server Actions, route handlers, pages).
 */
export function createSupabaseServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
