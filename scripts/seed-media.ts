/**
 * DEV-ONLY. Uploads local synthetic reference images
 * (dev-assets/reference-products/) to the Cloudinary DEV folder and
 * attaches them to seeded [DEV] products, so admin/public visual QA never
 * runs against empty image containers.
 *
 * Reuses the exact same pure signing/folder/verification math the real
 * admin upload flow uses (src/lib/cloudinary/core.ts) — this is not a
 * parallel, hand-rolled upload path. It cannot import sign.ts/verify.ts
 * directly because those carry the `server-only` guard, which throws
 * unconditionally under plain Node (not just inside Next's bundler); core.ts
 * exists precisely so this script and the app share one implementation.
 *
 * Safe to rerun: a product's expected reference images are skipped once
 * already attached, rather than re-uploaded or duplicated.
 *
 * Usage: pnpm seed:media
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import {
  signParams,
  buildProductFolderPath,
  verifyCloudinaryResource,
  type CloudinaryCredentials,
} from "../src/lib/cloudinary/core";

config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER;

const missing = [
  ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
  ["SUPABASE_SERVICE_ROLE_KEY", serviceKey],
  ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", cloudName],
  ["CLOUDINARY_API_KEY", apiKey],
  ["CLOUDINARY_API_SECRET", apiSecret],
  ["CLOUDINARY_UPLOAD_FOLDER", uploadFolder],
].filter(([, v]) => !v);

if (missing.length > 0) {
  console.error(
    `Missing required .env.local variables: ${missing.map(([k]) => k).join(", ")}`,
  );
  process.exit(1);
}

const creds: CloudinaryCredentials = { cloudName: cloudName!, apiKey: apiKey!, apiSecret: apiSecret! };

const supabase = createClient(supabaseUrl!, serviceKey!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ASSETS_DIR = resolve(__dirname, "../dev-assets/reference-products");

/** slug -> local reference image filenames, in the order they should appear (first = cover). */
const PRODUCT_MEDIA_MAP: Record<string, string[]> = {
  "villa-frente-al-mar-punta-cana": ["property-1.jpg", "property-2.jpg"],
  "toyota-land-cruiser-300-santo-domingo": ["vehicle-1.jpg"],
  "rolex-submariner-santo-domingo": ["watch-1.jpg"],
};

function signUpload(productId: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = buildProductFolderPath(uploadFolder!, productId);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = signParams(paramsToSign, creds.apiSecret);
  return { timestamp, folder, signature };
}

async function uploadFileToCloudinary(
  filePath: string,
  fileName: string,
  productId: string,
): Promise<{ public_id: string }> {
  const { timestamp, folder, signature } = signUpload(productId);
  const buffer = await readFile(filePath);
  const form = new FormData();
  form.append("file", new Blob([buffer]), fileName);
  form.append("api_key", creds.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  const body = await response.json();
  if (!response.ok) {
    const message = body?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Cloudinary upload failed for ${fileName}: ${message}`);
  }
  return body;
}

async function main() {
  console.log("Seeding DEV reference images (dev-assets/reference-products/)...");
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const [slug, fileNames] of Object.entries(PRODUCT_MEDIA_MAP)) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, title")
      .eq("slug", slug)
      .maybeSingle();

    if (productError || !product) {
      console.warn(`  ⚠ Product not found for slug "${slug}" — run \`pnpm seed\` first. Skipping.`);
      continue;
    }

    const { data: existingImages } = await supabase
      .from("product_images")
      .select("id, position")
      .eq("product_id", product.id)
      .order("position", { ascending: true });

    let nextPosition = existingImages?.length ?? 0;

    for (let i = 0; i < fileNames.length; i++) {
      const fileName = fileNames[i]!;

      // Idempotent by convention: if this product already has at least as
      // many images as this file's index+1, assume it's already attached.
      if (existingImages && i < existingImages.length) {
        console.log(`  · ${product.title}: ${fileName} already attached, skipping`);
        skipped++;
        continue;
      }

      const filePath = resolve(ASSETS_DIR, fileName);
      try {
        const uploadResult = await uploadFileToCloudinary(
          filePath,
          fileName,
          product.id,
        );
        const verified = await verifyCloudinaryResource(
          creds,
          uploadResult.public_id,
        );

        const { error: insertError } = await supabase
          .from("product_images")
          .insert({
            product_id: product.id,
            public_id: verified.publicId,
            width: verified.width,
            height: verified.height,
            format: verified.format,
            bytes: verified.bytes,
            position: nextPosition,
            alt: `${product.title} — imagen de referencia (desarrollo)`,
          });

        if (insertError) {
          throw new Error(`DB insert failed: ${insertError.message}`);
        }

        console.log(`  ✓ ${product.title}: ${fileName} -> position ${nextPosition}`);
        nextPosition++;
        uploaded++;
      } catch (err) {
        failed++;
        console.error(
          `  ✗ ${product.title}: ${fileName} failed — ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, skipped (already present): ${skipped}, failed: ${failed}.`);
  if (failed > 0) {
    console.log("Failures are almost always a Cloudinary credentials/config issue — see docs/CLOUDINARY_SETUP.md.");
    process.exitCode = 1;
  }
}

main();
