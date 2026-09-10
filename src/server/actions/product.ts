"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { slugify } from "@/lib/slug";
import { cleanDisplayValue } from "@/lib/normalize";
import {
  productDraftSchema,
  publicationContractSchema,
  type ProductDraftInput,
} from "@/schemas/product";
import type { PostgrestError } from "@supabase/supabase-js";

export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

function zodFieldErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

function revalidatePublicCatalog() {
  revalidateTag("products", "max");
  revalidatePath("/");
  revalidatePath("/en-venta");
}

async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title) || "producto";
  let candidate = base;
  let suffix = 2;

  for (let attempt = 0; attempt < 50; attempt++) {
    let query = supabase.from("products").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();

    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return `${base}-${Date.now()}`;
}

/** Creates a new DRAFT and returns its id — image upload requires a product id to exist first. */
export async function createDraftProduct(
  input: ProductDraftInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = productDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Revisa los campos marcados.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { supabase } = await requireAdmin();
  const slug = await generateUniqueSlug(supabase, parsed.data.title);

  const { data, error } = await supabase
    .from("products")
    .insert({
      slug,
      title: parsed.data.title,
      short_description: parsed.data.shortDescription,
      description: parsed.data.description,
      type: cleanDisplayValue(parsed.data.type),
      price: parsed.data.price,
      currency: parsed.data.currency,
      price_mode: parsed.data.priceMode,
      location: parsed.data.location
        ? cleanDisplayValue(parsed.data.location)
        : null,
      featured: parsed.data.featured,
      attributes: parsed.data.attributes,
      status: "DRAFT",
    })
    .select("id, slug")
    .single();

  if (error) {
    return { success: false, error: "No se pudo crear el borrador." };
  }

  revalidatePath("/admin/productos");
  return { success: true, data };
}

/** Updates an existing product's editable fields. Does not change status. */
export async function updateProduct(
  productId: string,
  input: ProductDraftInput,
): Promise<ActionResult> {
  const parsed = productDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Revisa los campos marcados.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { supabase } = await requireAdmin();

  const { data: existing } = await supabase
    .from("products")
    .select("title, slug")
    .eq("id", productId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Producto no encontrado." };
  }

  // Regenerating the slug only when the title actually changed keeps
  // published URLs stable across unrelated edits.
  const slug =
    existing.title === parsed.data.title
      ? existing.slug
      : await generateUniqueSlug(supabase, parsed.data.title, productId);

  const { error } = await supabase
    .from("products")
    .update({
      slug,
      title: parsed.data.title,
      short_description: parsed.data.shortDescription,
      description: parsed.data.description,
      type: cleanDisplayValue(parsed.data.type),
      price: parsed.data.price,
      currency: parsed.data.currency,
      price_mode: parsed.data.priceMode,
      location: parsed.data.location
        ? cleanDisplayValue(parsed.data.location)
        : null,
      featured: parsed.data.featured,
      attributes: parsed.data.attributes,
    })
    .eq("id", productId);

  if (error) {
    return { success: false, error: "No se pudo guardar el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePublicCatalog();
  if (slug !== existing.slug) revalidatePath(`/producto/${slug}`);
  return { success: true };
}

/**
 * Publishing is a server-enforced contract (spec §19) — it is authoritative
 * regardless of what the frontend button's disabled state suggested.
 */
export async function publishProduct(productId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select(
      "title, slug, type, description, price, price_mode, product_images(id, position)",
    )
    .eq("id", productId)
    .maybeSingle();

  if (fetchError || !product) {
    return { success: false, error: "Producto no encontrado." };
  }

  const images = product.product_images ?? [];
  const parsed = publicationContractSchema.safeParse({
    title: product.title,
    slug: product.slug,
    type: product.type,
    description: product.description ?? "",
    priceMode: product.price_mode,
    price: product.price,
    imageCount: images.length,
    hasCoverImage: images.some((img) => img.position === 0),
  });

  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message);
    return {
      success: false,
      error: `No se puede publicar: ${messages.join(" · ")}`,
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const { error } = await supabase
    .from("products")
    .update({ status: "AVAILABLE", published_at: new Date().toISOString() })
    .eq("id", productId);

  if (error) {
    return { success: false, error: "No se pudo publicar el producto." };
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath(`/producto/${product.slug}`);
  revalidatePublicCatalog();
  return { success: true };
}

const STATUS_TRANSITIONS = {
  unpublish: "DRAFT",
  available: "AVAILABLE",
  reserved: "RESERVED",
  sold: "SOLD",
} as const;

export async function setProductStatus(
  productId: string,
  action: keyof typeof STATUS_TRANSITIONS,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const nextStatus = STATUS_TRANSITIONS[action];

  const { data: product } = await supabase
    .from("products")
    .select("slug, published_at")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    return { success: false, error: "Producto no encontrado." };
  }

  const patch: {
    status: "DRAFT" | "AVAILABLE" | "RESERVED" | "SOLD";
    published_at?: string | null;
  } = {
    status: nextStatus,
  };
  if (nextStatus !== "DRAFT" && !product.published_at) {
    patch.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", productId);

  if (error) {
    return {
      success: false,
      error: "No se pudo cambiar el estado del producto.",
    };
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath(`/producto/${product.slug}`);
  revalidatePublicCatalog();
  return { success: true };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: product } = await supabase
    .from("products")
    .select("slug, product_images(public_id)")
    .eq("id", productId)
    .maybeSingle();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    return { success: false, error: "No se pudo eliminar el producto." };
  }

  // Cloudinary originals for a deleted product are queued for cleanup
  // rather than deleted inline — keeps deletion fast and never blocks the
  // admin on a third-party API call.
  if (product?.product_images?.length) {
    await supabase.from("media_cleanup_queue").upsert(
      product.product_images.map((img: { public_id: string }) => ({
        public_id: img.public_id,
      })),
      { onConflict: "public_id", ignoreDuplicates: true },
    );
  }

  revalidatePath("/admin/productos");
  revalidatePublicCatalog();
  if (product?.slug) revalidatePath(`/producto/${product.slug}`);
  return { success: true };
}

export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error
  );
}
