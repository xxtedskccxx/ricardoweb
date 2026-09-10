import "server-only";
import { getServerEnv } from "@/lib/env";
import { buildProductFolder } from "./folder";
import { signParams } from "./core";

export interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Signs a scoped, short-lived direct-upload request. The API secret never
 * leaves this server module — the browser receives only the signature,
 * timestamp and public identifiers needed to call the Cloudinary upload
 * API directly. Requires an already-verified admin session at the caller.
 */
export function createUploadSignature(productId: string): UploadSignature {
  const env = getServerEnv();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = buildProductFolder(productId);

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = signParams(paramsToSign, env.CLOUDINARY_API_SECRET);

  return {
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    folder,
  };
}
