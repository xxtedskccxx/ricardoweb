import "server-only";
import { createHash } from "node:crypto";
import { getServerEnv } from "@/lib/env";
import { ACCEPTED_IMAGE_FORMATS, MAX_IMAGE_BYTES } from "@/schemas/image";

export interface VerifiedCloudinaryResource {
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class InvalidImageError extends Error {}

/**
 * Re-fetches the resource from the Cloudinary Admin API and validates the
 * REAL format/size/dimensions Cloudinary measured — the client-reported
 * MIME type and file extension are never trusted. Destroys the resource
 * and throws if it fails validation.
 */
export async function verifyAndPersistImageMetadata(
  publicId: string,
): Promise<VerifiedCloudinaryResource> {
  const env = getServerEnv();
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(paramsToSign + env.CLOUDINARY_API_SECRET)
    .digest("hex");

  const url = `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/resources/image/upload/${encodeURIComponent(publicId)}`;
  const auth = Buffer.from(`${env.CLOUDINARY_API_KEY}:${signature}`).toString(
    "base64",
  );

  const response = await fetch(
    `${url}?timestamp=${timestamp}&api_key=${env.CLOUDINARY_API_KEY}&signature=${signature}`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  if (!response.ok) {
    throw new InvalidImageError(
      "No se pudo verificar la imagen subida. Intenta de nuevo.",
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
    await destroyCloudinaryResource(publicId);
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
  publicId: string,
): Promise<boolean> {
  const env = getServerEnv();
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(paramsToSign + env.CLOUDINARY_API_SECRET)
    .digest("hex");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        public_id: publicId,
        timestamp: String(timestamp),
        api_key: env.CLOUDINARY_API_KEY,
        signature,
      }),
    },
  );

  return response.ok;
}
