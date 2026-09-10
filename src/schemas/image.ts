import { z } from "zod";

export const ACCEPTED_IMAGE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "heic",
  "heif",
] as const;

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
export const LOW_RESOLUTION_WARNING_WIDTH = 1600;

/** Validated after re-fetching the resource from the Cloudinary Admin API — never trusts the client. */
export const persistImageSchema = z.object({
  productId: z.string().uuid(),
  publicId: z.string().min(1),
});

export const reorderImagesSchema = z.object({
  productId: z.string().uuid(),
  orderedImageIds: z.array(z.string().uuid()).min(1),
});

export const updateImageAltSchema = z.object({
  imageId: z.string().uuid(),
  alt: z.string().trim().max(160),
});
