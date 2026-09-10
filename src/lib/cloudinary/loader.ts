import type { ImageLoaderProps } from "next/image";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Custom next/image loader: rewrites any Cloudinary-hosted image to a
 * device-aware, format-aware derivative. `f_auto,q_auto,dpr_auto` lets
 * Cloudinary pick AVIF/WebP and the right pixel density per client;
 * `c_limit` never crops (used for detail/gallery views). Card crops apply
 * `c_fill,g_auto` explicitly at the call site via `transform`.
 */
export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  // Already a fully-qualified Cloudinary delivery URL (rare, but pass through).
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  const q = quality ? `q_${quality}` : "q_auto";
  const transforms = ["f_auto", q, "dpr_auto", `w_${width}`, "c_limit"].join(
    ",",
  );

  // `src` is expected to be a bare Cloudinary public_id (no extension).
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${src}`;
}

/** Builds a card-crop URL (fixed 4:3, content-aware gravity) for a given public_id. */
export function cloudinaryCardUrl(publicId: string, width: number): string {
  const height = Math.round((width * 3) / 4);
  const transforms = [
    "f_auto",
    "q_auto",
    "dpr_auto",
    `w_${width}`,
    `h_${height}`,
    "c_fill",
    "g_auto",
  ].join(",");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}
