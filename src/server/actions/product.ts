"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/server/auth";
import { slugify } from "@/lib/slug";
import { canTransition, type ProductStatus } from "@/lib/status-transitions";
import { destroyCloudinaryResource } from "@/lib/cloudinary/verify";
import { cleanDisplayValue } from "@/lib/normalize";
import { productDraftSchema, publicationContractSchema, type ProductDraftInput } from "@/schemas/product";

export interface ActionResult<T = undefined> { success: boolean; error?: string; fieldErrors?: Record<string, string>; data?: T }
const idSchema = z.string().uuid();

function zodFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) { const key = issue.path.join("."); if (key && !out[key]) out[key] = issue.message; }
  return out;
}
function revalidatePublicCatalog() { revalidateTag("products", "max"); revalidatePath("/"); revalidatePath("/en-venta"); }

async function generateUniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "producto";
  for (let suffix = 0; suffix < 50; suffix += 1) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const rows = excludeId
      ? await dbQuery<{ id: string }>("SELECT id FROM products WHERE slug = $1 AND id <> $2 LIMIT 1", [candidate, excludeId])
      : await dbQuery<{ id: string }>("SELECT id FROM products WHERE slug = $1 LIMIT 1", [candidate]);
    if (!rows[0]) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function createDraftProduct(input: ProductDraftInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = productDraftSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Revisa los campos marcados.", fieldErrors: zodFieldErrors(parsed.error) };
  await requireAdmin();
  const slug = await generateUniqueSlug(parsed.data.title);
  try {
    const rows = await dbQuery<{ id: string; slug: string }>(
      `INSERT INTO products (slug, title, short_description, description, type, price, currency, price_mode, location, show_location, location_latitude, location_longitude, featured, attributes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,'DRAFT') RETURNING id, slug`,
      [slug, parsed.data.title, parsed.data.shortDescription ?? null, parsed.data.description ?? null, cleanDisplayValue(parsed.data.type), parsed.data.price, parsed.data.currency, parsed.data.priceMode, parsed.data.location ? cleanDisplayValue(parsed.data.location) : null, parsed.data.showLocation, parsed.data.locationLatitude ?? null, parsed.data.locationLongitude ?? null, parsed.data.featured, JSON.stringify(parsed.data.attributes)],
    );
    const data = rows[0];
    if (!data) return { success: false, error: "No se pudo crear el borrador." };
    revalidatePath("/admin/productos");
    return { success: true, data };
  } catch { return { success: false, error: "No se pudo crear el borrador." }; }
}

export async function updateProduct(productId: string, input: ProductDraftInput): Promise<ActionResult> {
  const parsed = productDraftSchema.safeParse(input); const id = idSchema.safeParse(productId);
  if (!id.success) return { success: false, error: "Producto no encontrado." };
  if (!parsed.success) return { success: false, error: "Revisa los campos marcados.", fieldErrors: zodFieldErrors(parsed.error) };
  await requireAdmin();
  const existingRows = await dbQuery<{ title: string; slug: string }>("SELECT title, slug FROM products WHERE id = $1 LIMIT 1", [productId]);
  const existing = existingRows[0];
  if (!existing) return { success: false, error: "Producto no encontrado." };
  const slug = existing.title === parsed.data.title ? existing.slug : await generateUniqueSlug(parsed.data.title, productId);
  try {
    await dbQuery(`UPDATE products SET slug=$1,title=$2,short_description=$3,description=$4,type=$5,price=$6,currency=$7,price_mode=$8,location=$9,show_location=$10,location_latitude=$11,location_longitude=$12,featured=$13,attributes=$14::jsonb WHERE id=$15`, [slug, parsed.data.title, parsed.data.shortDescription ?? null, parsed.data.description ?? null, cleanDisplayValue(parsed.data.type), parsed.data.price, parsed.data.currency, parsed.data.priceMode, parsed.data.location ? cleanDisplayValue(parsed.data.location) : null, parsed.data.showLocation, parsed.data.locationLatitude ?? null, parsed.data.locationLongitude ?? null, parsed.data.featured, JSON.stringify(parsed.data.attributes), productId]);
  } catch { return { success: false, error: "No se pudo guardar el producto." }; }
  revalidatePath("/admin/productos"); revalidatePath(`/admin/productos/${productId}`); revalidatePublicCatalog();
  if (slug !== existing.slug) revalidatePath(`/producto/${slug}`);
  return { success: true };
}

export async function publishProduct(productId: string): Promise<ActionResult> {
  const id = idSchema.safeParse(productId); if (!id.success) return { success: false, error: "Producto no encontrado." };
  await requireAdmin();
  const rows = await dbQuery<{ title: string; slug: string; type: string; description: string | null; price: string | number | null; price_mode: "FIXED" | "NEGOTIABLE" | "CONTACT"; image_count: number; has_cover: boolean }>(
    `SELECT p.title,p.slug,p.type,p.description,p.price,p.price_mode,count(pi.id)::int AS image_count,coalesce(bool_or(pi.position=0),false) AS has_cover FROM products p LEFT JOIN product_images pi ON pi.product_id=p.id WHERE p.id=$1 GROUP BY p.id`, [productId]);
  const product = rows[0]; if (!product) return { success: false, error: "Producto no encontrado." };
  const parsed = publicationContractSchema.safeParse({ title: product.title, slug: product.slug, type: product.type, description: product.description ?? "", priceMode: product.price_mode, price: product.price === null ? null : Number(product.price), imageCount: product.image_count, hasCoverImage: product.has_cover });
  if (!parsed.success) return { success: false, error: `No se puede publicar: ${parsed.error.issues.map((issue) => issue.message).join(" · ")}`, fieldErrors: zodFieldErrors(parsed.error) };
  try { await dbQuery("UPDATE products SET status='AVAILABLE', published_at=now() WHERE id=$1", [productId]); } catch { return { success: false, error: "No se pudo publicar el producto." }; }
  revalidatePath("/admin/productos"); revalidatePath(`/admin/productos/${productId}`); revalidatePath(`/producto/${product.slug}`); revalidatePublicCatalog();
  return { success: true };
}

const STATUS_TRANSITIONS = { unpublish: "DRAFT", available: "AVAILABLE", reserved: "RESERVED", sold: "SOLD" } as const;
export async function setProductStatus(productId: string, action: keyof typeof STATUS_TRANSITIONS): Promise<ActionResult> {
  const id = idSchema.safeParse(productId); if (!id.success) return { success: false, error: "Producto no encontrado." };
  await requireAdmin(); const nextStatus = STATUS_TRANSITIONS[action];
  const rows = await dbQuery<{ slug: string; status: ProductStatus; published_at: string | Date | null }>("SELECT slug,status,published_at FROM products WHERE id=$1 LIMIT 1", [productId]);
  const product = rows[0]; if (!product) return { success: false, error: "Producto no encontrado." };
  if (!canTransition(product.status, nextStatus)) {
    return { success: false, error: product.status === "DRAFT" ? "Usa «Publicar» para hacer público un borrador." : "Ese cambio de estado no está permitido." };
  }
  // Keep the status value and the publication check on separate parameters.
  // Reusing the same PostgreSQL placeholder in an enum assignment and a text
  // comparison makes Neon/Postgres infer conflicting types (42P08).
  try {
    await dbQuery(
      `UPDATE products
       SET status=$1::product_status,
           published_at=CASE WHEN $2='DRAFT' THEN published_at WHEN published_at IS NULL THEN now() ELSE published_at END
       WHERE id=$3`,
      [nextStatus, nextStatus, productId],
    );
  } catch { return { success: false, error: "No se pudo cambiar el estado del producto." }; }
  revalidatePath("/admin/productos"); revalidatePath(`/admin/productos/${productId}`); revalidatePath(`/producto/${product.slug}`); revalidatePublicCatalog();
  return { success: true };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const id = idSchema.safeParse(productId); if (!id.success) return { success: false, error: "Producto no encontrado." };
  await requireAdmin();
  const rows = await dbQuery<{ slug: string; public_id: string }>("SELECT p.slug, pi.public_id FROM products p LEFT JOIN product_images pi ON pi.product_id=p.id WHERE p.id=$1", [productId]);
  if (!rows[0]) return { success: false, error: "Producto no encontrado." };
  try { await dbQuery("DELETE FROM products WHERE id=$1", [productId]); } catch { return { success: false, error: "No se pudo eliminar el producto." }; }
  for (const row of rows) {
    if (!row.public_id) continue;
    let destroyed = false;
    try { destroyed = await destroyCloudinaryResource(row.public_id); } catch { destroyed = false; }
    // Anything Cloudinary didn't confirm is retried by `pnpm media:cleanup`.
    if (!destroyed) { try { await dbQuery("INSERT INTO media_cleanup_queue (public_id) VALUES ($1) ON CONFLICT (public_id) DO NOTHING", [row.public_id]); } catch { /* cleanup can be retried separately */ } }
  }
  revalidatePath("/admin/productos"); revalidatePublicCatalog(); revalidatePath(`/producto/${rows[0].slug}`);
  return { success: true };
}
