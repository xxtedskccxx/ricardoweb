/**
 * Drains media_cleanup_queue: deletes from Cloudinary every image whose DB
 * row is already gone but whose remote resource couldn't be destroyed at the
 * time (network error, Cloudinary outage). Safe to rerun; rows are removed
 * only after Cloudinary confirms the destroy.
 *
 * Usage: pnpm media:cleanup
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve } from "node:path";
import { destroyCloudinaryResource, type CloudinaryCredentials } from "../src/lib/cloudinary/core";

config({ path: resolve(__dirname, "../.env.local") });

const databaseUrl = process.env.DATABASE_URL;
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const missing = [
  ["DATABASE_URL", databaseUrl],
  ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", cloudName],
  ["CLOUDINARY_API_KEY", apiKey],
  ["CLOUDINARY_API_SECRET", apiSecret],
].filter(([, v]) => !v);

if (missing.length > 0) {
  console.error(`Faltan variables en .env.local: ${missing.map(([k]) => k).join(", ")}`);
  process.exit(1);
}

const creds: CloudinaryCredentials = { cloudName: cloudName!, apiKey: apiKey!, apiSecret: apiSecret! };
const sql = neon(databaseUrl!);

async function main() {
  const rows = await sql`SELECT public_id FROM media_cleanup_queue ORDER BY created_at ASC LIMIT 500` as { public_id: string }[];
  let removed = 0;
  let failed = 0;

  for (const { public_id: publicId } of rows) {
    // Never destroy an image that is (again) referenced by a product.
    const inUse = await sql`SELECT 1 FROM product_images WHERE public_id = ${publicId} LIMIT 1` as unknown[];
    if (inUse.length > 0) {
      await sql`DELETE FROM media_cleanup_queue WHERE public_id = ${publicId}`;
      continue;
    }
    let ok = false;
    let error: string | null = null;
    try { ok = await destroyCloudinaryResource(creds, publicId); } catch (err) { error = err instanceof Error ? err.message : String(err); }
    if (ok) {
      await sql`DELETE FROM media_cleanup_queue WHERE public_id = ${publicId}`;
      removed++;
    } else {
      await sql`UPDATE media_cleanup_queue SET attempts = attempts + 1, last_error = ${error ?? "destroy failed"} WHERE public_id = ${publicId}`;
      failed++;
    }
  }

  console.log(`Listo. Pendientes revisadas: ${rows.length}, eliminadas: ${removed}, fallidas: ${failed}.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error("No se pudo procesar la cola de limpieza:", error);
  process.exit(1);
});
