"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { createUploadSignature } from "@/lib/cloudinary/sign";
import {
  verifyAndPersistImageMetadata,
  destroyCloudinaryResource,
  InvalidImageError,
} from "@/lib/cloudinary/verify";
import {
  persistImageSchema,
  reorderImagesSchema,
  updateImageAltSchema,
} from "@/schemas/image";
import type { ActionResult } from "./product";

/** Step 1 of upload: an admin-only, folder-scoped, short-lived signature. The API secret never reaches the browser. */
export async function requestUploadSignature(productId: string) {
  await requireAdmin();
  return createUploadSignature(productId);
}

/**
 * Step 2 of upload: after the browser uploads directly to Cloudinary, the
 * server re-fetches the resource and validates the REAL format/size/
 * dimensions before writing a row — the client's report is never trusted.
 */
export async function persistUploadedImage(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = persistImageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Solicitud de imagen inválida." };
  }

  const { supabase } = await requireAdmin();

  let verified;
  try {
    verified = await verifyAndPersistImageMetadata(parsed.data.publicId);
  } catch (error) {
    const message =
      error instanceof InvalidImageError
        ? error.message
        : "No se pudo verificar la imagen.";
    return { success: false, error: message };
  }

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", parsed.data.productId);

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: parsed.data.productId,
      public_id: verified.publicId,
      width: verified.width,
      height: verified.height,
      format: verified.format,
      bytes: verified.bytes,
      position: count ?? 0,
    })
    .select("id")
    .single();

  if (error) {
    await destroyCloudinaryResource(verified.publicId);
    return { success: false, error: "No se pudo guardar la imagen." };
  }

  revalidatePath(`/admin/productos/${parsed.data.productId}`);
  return { success: true, data: { id: data.id } };
}

/** Atomic reorder (and, implicitly, cover selection — position 0 is the cover). */
export async function reorderProductImages(
  input: unknown,
): Promise<ActionResult> {
  const parsed = reorderImagesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Solicitud de reordenamiento inválida." };
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("reorder_product_images", {
    p_product_id: parsed.data.productId,
    p_ordered_image_ids: parsed.data.orderedImageIds,
  });

  if (error) {
    return { success: false, error: "No se pudo reordenar las imágenes." };
  }

  revalidatePath(`/admin/productos/${parsed.data.productId}`);
  revalidateTag("products", "max");
  return { success: true };
}

export async function updateImageAlt(input: unknown): Promise<ActionResult> {
  const parsed = updateImageAltSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Texto alternativo inválido." };
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("product_images")
    .update({ alt: parsed.data.alt || null })
    .eq("id", parsed.data.imageId);

  if (error) {
    return { success: false, error: "No se pudo actualizar el texto alternativo." };
  }

  return { success: true };
}

/**
 * DB row is deleted first (source of truth for the admin UI); if the
 * Cloudinary delete fails, the orphan is queued for retry rather than
 * blocking the admin operation.
 */
export async function removeProductImage(
  imageId: string,
  productId: string,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: image } = await supabase
    .from("product_images")
    .select("public_id")
    .eq("id", imageId)
    .maybeSingle();

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    return { success: false, error: "No se pudo eliminar la imagen." };
  }

  if (image?.public_id) {
    const destroyed = await destroyCloudinaryResource(image.public_id);
    if (!destroyed) {
      await supabase
        .from("media_cleanup_queue")
        .upsert(
          { public_id: image.public_id },
          { onConflict: "public_id", ignoreDuplicates: true },
        );
    }
  }

  revalidatePath(`/admin/productos/${productId}`);
  revalidateTag("products", "max");
  return { success: true };
}
