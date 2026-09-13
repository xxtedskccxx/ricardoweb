/** Create or replace an admin account in a Neon database.
 * Usage: pnpm admin:create <email> <password>
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve } from "node:path";
import { hashPassword } from "../src/lib/auth/password";

config({ path: resolve(process.cwd(), ".env.local") });
const [, , rawEmail, password] = process.argv;
const email = rawEmail?.trim().toLowerCase();
if (!email || !password) {
  console.error("Uso: pnpm admin:create <correo> <contraseña>");
  process.exit(1);
}
if (password.length < 12) {
  console.error("La contraseña debe tener al menos 12 caracteres.");
  process.exit(1);
}
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Falta DATABASE_URL en .env.local");
  process.exit(1);
}

async function main() {
  const sql = neon(connectionString as string);
  const passwordHash = await hashPassword(password as string);
  await sql`INSERT INTO admins (email, password_hash) VALUES (${email}, ${passwordHash})
    ON CONFLICT (email) DO UPDATE SET password_hash = excluded.password_hash`;
  console.log(`Administrador listo: ${email}`);
}

main().catch((error: unknown) => {
  console.error("No se pudo crear el administrador:", error);
  process.exit(1);
});
