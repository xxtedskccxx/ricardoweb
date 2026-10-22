"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getDb, dbQuery } from "@/lib/db";
import { requireAdmin } from "@/server/auth";
import { createUploadSignature } from "@/lib/cloudinary/sign";
import { buildProductFolder } from "@/lib/cloudinary/folder";
import { verifyAndPersistImageMetadata, destroyCloudinaryResource, InvalidImageError } from "@/lib/cloudinary/verify";
import { persistImageSchema, reorderImagesSchema, updateImageAltSchema } from "@/schemas/image";
import type { ActionResult } from "./product";

export async function requestUploadSignature(productId: string) { await requireAdmin(); return createUploadSignature(productId); }

export interface PersistedImage { id: string; publicId: string; width: number; height: number; position: number; alt: string | null }

export async function persistUploadedImage(input: unknown): Promise<ActionResult<PersistedImage>> {
  const parsed = persistImageSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Solicitud de imagen inválida." };
  await requireAdmin();
  // Only accept resources uploaded with this product's signed folder.
  if (!parsed.data.publicId.startsWith(`${buildProductFolder(parsed.data.productId)}/`)) return { success: false, error: "Solicitud de imagen inválida." };
  let verified;
  try { verified = await verifyAndPersistImageMetadata(parsed.data.publicId); }
  catch (error) { return { success: false, error: error instanceof InvalidImageError ? error.message : "No se pudo verificar la imagen." }; }
  let nextPosition = 0;
  try {
    const countRows = await dbQuery<{ count: number | string }>("SELECT count(*)::int AS count FROM product_images WHERE product_id=$1", [parsed.data.productId]);
    nextPosition = Number(countRows[0]?.count ?? 0);
  } catch {
    await destroyCloudinaryResource(verified.publicId);
    return { success: false, error: "No se pudo guardar la imagen." };
  }
  try {
    const rows = await dbQuery<{ id: string; public_id: string; width: number; height: number; position: number; alt: string | null }>(
      "INSERT INTO product_images (product_id,public_id,width,height,format,bytes,position) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,public_id,width,height,position,alt",
      [parsed.data.productId, verified.publicId, verified.width, verified.height, verified.format, verified.bytes, nextPosition],
    );
    const data = rows[0];
    if (!data) throw new Error("insert failed");
    revalidatePath(`/admin/productos/${parsed.data.productId}`);
    return { success: true, data: { id: data.id, publicId: data.public_id, width: data.width, height: data.height, position: data.position, alt: data.alt } };
  } catch {
    await destroyCloudinaryResource(verified.publicId);
    return { success: false, error: "No se pudo guardar la imagen." };
  }
}

export async function reorderProductImages(input: unknown): Promise<ActionResult> {
  const parsed = reorderImagesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Solicitud de reordenamiento inválida." };
  await requireAdmin();
  const current = await dbQuery<{ id: string }>("SELECT id FROM product_images WHERE product_id=$1", [parsed.data.productId]);
  const requested = new Set(parsed.data.orderedImageIds);
  if (requested.size !== parsed.data.orderedImageIds.length || requested.size !== current.length || current.some((row) => !requested.has(row.id))) {
    return { success: false, error: "Las imágenes cambiaron. Recarga la página e inténtalo de nuevo." };
  }
  try {
    const sql = getDb();
    await sql.transaction((tx) => [
      tx.query("UPDATE product_images SET position = position - 100000 WHERE product_id=$1", [parsed.data.productId]),
      tx.query("UPDATE product_images AS pi SET position = ordered.position - 1 FROM unnest($2::uuid[]) WITH ORDINALITY AS ordered(id, position) WHERE pi.product_id=$1 AND pi.id=ordered.id", [parsed.data.productId, parsed.data.orderedImageIds]),
    ]);
  } catch { return { success: false, error: "No se pudo reordenar las imágenes." }; }
  revalidatePath(`/admin/productos/${parsed.data.productId}`); revalidateTag("products", "max");
  return { success: true };
}

export async function updateImageAlt(input: unknown): Promise<ActionResult> {
  const parsed = updateImageAltSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Texto alternativo inválido." };
  await requireAdmin();
  try { await dbQuery("UPDATE product_images SET alt=$1 WHERE id=$2", [parsed.data.alt || null, parsed.data.imageId]); }
  catch { return { success: false, error: "No se pudo actualizar el texto alternativo." }; }
  revalidateTag("products", "max");
  return { success: true };
}

export async function removeProductImage(imageId: string, productId: string): Promise<ActionResult> {
  const parsed = persistImageSchema.shape.productId.safeParse(productId); const imageParsed = z.string().uuid().safeParse(imageId);
  if (!parsed.success || !imageParsed.success) return { success: false, error: "Solicitud de imagen inválida." };
  await requireAdmin();
  const rows = await dbQuery<{ public_id: string; status: string; image_count: number }>(
    "SELECT pi.public_id, p.status, (SELECT count(*)::int FROM product_images WHERE product_id=$2) AS image_count FROM product_images pi JOIN products p ON p.id=pi.product_id WHERE pi.id=$1 AND pi.product_id=$2 LIMIT 1",
    [imageId, productId],
  );
  if (!rows[0]) return { success: false, error: "Imagen no encontrada." };
  if (rows[0].status !== "DRAFT" && rows[0].image_count <= 1) {
    return { success: false, error: "Un producto publicado necesita al menos una imagen. Sube otra antes de eliminar esta, o despublícalo." };
  }
  try {
    // Delete and close the gap in one transaction so position 0 (the cover) always exists.
    await getDb().transaction((tx) => [
      tx.query("DELETE FROM product_images WHERE id=$1 AND product_id=$2", [imageId, productId]),
      tx.query("UPDATE product_images SET position = position - 100000 WHERE product_id=$1", [productId]),
      tx.query("UPDATE product_images AS pi SET position = ordered.rn - 1 FROM (SELECT id, row_number() OVER (ORDER BY position) AS rn FROM product_images WHERE product_id=$1) AS ordered WHERE pi.id = ordered.id", [productId]),
    ]);
  }
  catch { return { success: false, error: "No se pudo eliminar la imagen." }; }
  let destroyed = false;
  try { destroyed = await destroyCloudinaryResource(rows[0].public_id); } catch { destroyed = false; }
  if (!destroyed) { try { await dbQuery("INSERT INTO media_cleanup_queue (public_id) VALUES ($1) ON CONFLICT (public_id) DO NOTHING", [rows[0].public_id]); } catch { /* queue retry is best effort */ } }
  revalidatePath(`/admin/productos/${productId}`); revalidateTag("products", "max");
  return { success: true };
}
