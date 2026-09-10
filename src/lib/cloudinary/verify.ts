import "server-only";
import { getServerEnv } from "@/lib/env";
import {
  verifyCloudinaryResource,
  destroyCloudinaryResource as destroyCloudinaryResourceCore,
  InvalidImageError,
  type VerifiedCloudinaryResource,
} from "./core";

export { InvalidImageError };
export type { VerifiedCloudinaryResource };

function devLog(event: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[cloudinary]", event);
  }
}

function credsFromEnv() {
  const env = getServerEnv();
  return {
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  };
}

/**
 * Re-fetches the resource from the Cloudinary Admin API and validates the
 * REAL format/size/dimensions Cloudinary measured — the client-reported
 * MIME type and file extension are never trusted. Destroys the resource
 * and throws if it fails validation. (Core logic lives in ./core so it can
 * also be called from scripts/seed-media.ts, which cannot import anything
 * carrying the `server-only` guard.)
 */
export async function verifyAndPersistImageMetadata(
  publicId: string,
): Promise<VerifiedCloudinaryResource> {
  return verifyCloudinaryResource(credsFromEnv(), publicId, devLog);
}

export async function destroyCloudinaryResource(
  publicId: string,
): Promise<boolean> {
  return destroyCloudinaryResourceCore(credsFromEnv(), publicId, devLog);
}
