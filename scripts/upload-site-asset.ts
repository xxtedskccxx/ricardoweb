/**
 * Uploads a single local image file to Cloudinary as a fixed, stable
 * site-wide asset (branding/hero — not tied to a product row), under
 * `${CLOUDINARY_UPLOAD_FOLDER}/site/<name>`, overwriting any previous
 * version at that same public_id so re-running is safe.
 *
 * Reuses the same signing/verification math the real admin upload flow
 * and seed-media.ts use (src/lib/cloudinary/core.ts) rather than
 * hand-rolling a parallel implementation.
 *
 * Usage: pnpm site:asset <local-file-path> <name>
 *   e.g. pnpm site:asset ../Downloads/imagenbg.png hero-background
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import {
  signParams,
  verifyCloudinaryResource,
  type CloudinaryCredentials,
} from "../src/lib/cloudinary/core";

config({ path: resolve(__dirname, "../.env.local") });

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER;

const missing = [
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

const [filePath, name] = process.argv.slice(2);

if (!filePath || !name) {
  console.error("Usage: pnpm site:asset <local-file-path> <name>");
  process.exit(1);
}

const creds: CloudinaryCredentials = {
  cloudName: cloudName!,
  apiKey: apiKey!,
  apiSecret: apiSecret!,
};

async function main() {
  const publicId = `${uploadFolder}/site/${name}`;
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `overwrite=true&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = signParams(paramsToSign, creds.apiSecret);

  const buffer = await readFile(resolve(process.cwd(), filePath!));
  const form = new FormData();
  form.append("file", new Blob([buffer]), name!);
  form.append("api_key", creds.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("public_id", publicId);
  form.append("overwrite", "true");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  const body = await response.json();
  if (!response.ok) {
    console.error(`Upload failed: ${body?.error?.message ?? response.status}`);
    process.exit(1);
  }

  const verified = await verifyCloudinaryResource(creds, body.public_id);
  console.log("Uploaded and verified:");
  console.log(`  public_id: ${verified.publicId}`);
  console.log(`  ${verified.width}x${verified.height} ${verified.format}, ${verified.bytes} bytes`);
}

main();
