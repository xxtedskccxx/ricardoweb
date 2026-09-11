/**
 * Pure src-string builders shared by Server and Client Components. Kept out
 * of loader.ts because that file needs "use client" (Next.js requirement
 * for a custom `images.loaderFile`), which would otherwise block Server
 * Components from calling these.
 */

/** Wraps a bare public_id for the fixed-ratio, content-aware card crop. */
export function cardImageSrc(publicId: string): string {
  return `fill:${publicId}`;
}

/** Wraps a bare public_id for the non-destructive detail/gallery crop. */
export function detailImageSrc(publicId: string): string {
  return `limit:${publicId}`;
}
