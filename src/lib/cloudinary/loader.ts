"use client";

import type { ImageLoaderProps } from "next/image";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Custom next/image loader: rewrites a Cloudinary public_id to a
 * device-aware, format-aware derivative. `f_auto,q_auto,dpr_auto` lets
 * Cloudinary pick AVIF/WebP and the right pixel density per client.
 *
 * `src` carries its crop intent as a prefix so next/image's own
 * width/quality selection still drives the URL:
 *   "limit:<public_id>" — never crops (product detail/gallery).
 *   "fill:<public_id>"  — fixed-ratio content-aware crop (cards).
 * No prefix defaults to "limit" (the safer, non-destructive behavior).
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  const [mode, publicId] = src.includes(":")
    ? (src.split(/:(.+)/) as [string, string])
    : ["limit", src];

  const q = quality ? `q_${quality}` : "q_auto";
  const crop = mode === "fill" ? "c_fill,g_auto" : "c_limit";
  const transforms = ["f_auto", q, "dpr_auto", `w_${width}`, crop].join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

// next/image's `images.loaderFile` requires a default export.
export default cloudinaryLoader;
