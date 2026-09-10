import { getServerEnv } from "@/lib/env";
import { buildProductFolderPath } from "./core";

/**
 * Single source of truth for the Cloudinary folder a product's images live
 * in — used by both the signed-upload path (sign.ts) and the dev
 * reference-image seed script, so the two never drift apart. The actual
 * path math lives in ./core (no server-only guard) so the script can
 * reuse it too; this wrapper only supplies the real env value.
 */
export function buildProductFolder(productId: string): string {
  const env = getServerEnv();
  return buildProductFolderPath(env.CLOUDINARY_UPLOAD_FOLDER, productId);
}
