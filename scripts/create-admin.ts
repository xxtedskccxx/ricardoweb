/**
 * One-off admin bootstrap for LOCAL development only. There is no public
 * registration route anywhere in this app by design — the only way to
 * create an authorized owner account is a script like this one, run
 * directly against Supabase with the service-role key.
 *
 * Usage: pnpm tsx scripts/create-admin.ts <email> <password>
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../.env.local") });

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: pnpm tsx scripts/create-admin.ts <email> <password>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    console.error("Failed to create user:", error?.message);
    process.exit(1);
  }

  const { error: adminError } = await supabase
    .from("admins")
    .insert({ user_id: data.user.id });

  if (adminError) {
    console.error("User created but failed to grant admin:", adminError.message);
    process.exit(1);
  }

  console.log(`Admin account ready: ${email}`);
}

main();
