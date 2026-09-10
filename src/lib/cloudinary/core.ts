/**
 * Pure Cloudinary signing/verification logic — deliberately has NO
 * `server-only` guard and NO dependency on `@/lib/env`, so it can be
 * called both from the app's server-only wrappers (sign.ts, verify.ts,
 * which fetch real credentials via getServerEnv()) and from standalone
 * Node scripts (scripts/seed-media.ts, which read credentials from
 * process.env directly). The `server-only` package throws unconditionally
 * under plain Node execution — not just inside Next's bundler — so any
 * script that needs this logic cannot import a `server-only`-guarded
 * module even transitively. Keeping the math here once avoids either
 * duplicating it by hand in the script or weakening the guard on the app
 * side.
 */
import { createHash } from "node:crypto";
import { ACCEPTED_IMAGE_FORMATS, MAX_IMAGE_BYTES } from "@/schemas/image";

export function signParams(paramsToSign: string, apiSecret: string): string {
  return createHash("sha1").update(paramsToSign + apiSecret).digest("hex");
}

/** `baseFolder` already carries the environment segment (e.g. "altamar/dev"). */
export function buildProductFolderPath(
  baseFolder: string,
  productId: string,
): string {
  return `${baseFolder}/products/${productId}`;
}

export interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface VerifiedCloudinaryResource {
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class InvalidImageError extends Error {}

async function readCloudinaryErrorMessage(
  response: Response,
): Promise<string | null> {
  try {
    const body = (await response.clone().json()) as {
      error?: { message?: string };
    };
    return body?.error?.message ?? null;
  } catch {
    return null;
  }
}

/**
 * Re-fetches the resource from the Cloudinary Admin API and validates the
 * REAL format/size/dimensions Cloudinary measured — never trusts the
 * uploader's own report. The Admin API's resource-details endpoint
 * authenticates with plain HTTP Basic Auth (api_key:api_secret) — it is
 * NOT part of the Upload API's timestamp+signature family.
 */
export async function verifyCloudinaryResource(
  creds: CloudinaryCredentials,
  publicId: string,
  log?: (event: Record<string, unknown>) => void,
): Promise<VerifiedCloudinaryResource> {
  const url = `https://api.cloudinary.com/v1_1/${creds.cloudName}/resources/image/upload/${encodeURIComponent(publicId)}`;
  const auth = Buffer.from(`${creds.apiKey}:${creds.apiSecret}`).toString(
    "base64",
  );

  const response = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    const providerMessage = await readCloudinaryErrorMessage(response);
    log?.({ stage: "verify", status: response.status, providerMessage });
    throw new InvalidImageError(
      providerMessage
        ? `Cloudinary rechazó la verificación: ${providerMessage}`
        : "No se pudo verificar la imagen subida. Intenta de nuevo.",
    );
  }

  const resource = (await response.json()) as {
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };

  const format = resource.format.toLowerCase();
  const isValidFormat = (ACCEPTED_IMAGE_FORMATS as readonly string[]).includes(
    format,
  );
  const isValidSize = resource.bytes > 0 && resource.bytes <= MAX_IMAGE_BYTES;
  const hasDimensions = resource.width > 0 && resource.height > 0;

  if (!isValidFormat || !isValidSize || !hasDimensions) {
    await destroyCloudinaryResource(creds, publicId, log);
    throw new InvalidImageError(
      !isValidFormat
        ? "Formato de imagen no permitido."
        : !isValidSize
          ? "La imagen supera el tamaño máximo permitido (15 MB)."
          : "La imagen no tiene dimensiones válidas.",
    );
  }

  return {
    publicId: resource.public_id,
    width: resource.width,
    height: resource.height,
    format,
    bytes: resource.bytes,
  };
}

export async function destroyCloudinaryResource(
  creds: CloudinaryCredentials,
  publicId: string,
  log?: (event: Record<string, unknown>) => void,
): Promise<boolean> {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = signParams(paramsToSign, creds.apiSecret);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        public_id: publicId,
        timestamp: String(timestamp),
        api_key: creds.apiKey,
        signature,
      }),
    },
  );

  if (!response.ok) {
    log?.({
      stage: "destroy",
      status: response.status,
      providerMessage: await readCloudinaryErrorMessage(response),
    });
  }

  return response.ok;
}
