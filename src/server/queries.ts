import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeKey } from "@/lib/normalize";
import type { ProductFilterInput } from "@/schemas/product";

export interface ProductAttribute {
  label: string;
  value: string;
}

export interface ProductImageRow {
  id: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  alt: string | null;
  position: number;
}

export interface ProductRow {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  type: string;
  price: number | null;
  currency: "USD" | "DOP";
  priceMode: "FIXED" | "NEGOTIABLE" | "CONTACT";
  location: string | null;
  status: "DRAFT" | "AVAILABLE" | "RESERVED" | "SOLD";
  featured: boolean;
  attributes: ProductAttribute[];
  publishedAt: string | null;
  images: ProductImageRow[];
}

const PRODUCT_SELECT = `
  id, slug, title, short_description, description, type, price, currency,
  price_mode, location, status, featured, attributes, published_at,
  product_images ( id, public_id, width, height, format, alt, position )
`;

type RawImage = {
  id: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  alt: string | null;
  position: number;
};

type RawProduct = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  type: string;
  price: number | null;
  currency: "USD" | "DOP";
  price_mode: "FIXED" | "NEGOTIABLE" | "CONTACT";
  location: string | null;
  status: "DRAFT" | "AVAILABLE" | "RESERVED" | "SOLD";
  featured: boolean;
  attributes: unknown;
  published_at: string | null;
  product_images: RawImage[] | null;
};

function mapProduct(row: RawProduct): ProductRow {
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(
      (img): ProductImageRow => ({
        id: img.id,
        publicId: img.public_id,
        width: img.width,
        height: img.height,
        format: img.format,
        alt: img.alt,
        position: img.position,
      }),
    );

  const attributes = Array.isArray(row.attributes)
    ? (row.attributes as ProductAttribute[])
    : [];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    type: row.type,
    price: row.price,
    currency: row.currency,
    priceMode: row.price_mode,
    location: row.location,
    status: row.status,
    featured: row.featured,
    attributes,
    publishedAt: row.published_at,
    images,
  };
}

const PAGE_SIZE = 12;

/** Homepage: up to `limit` items, prioritized by homepage_position then recency. Never a hard inventory cap. */
export async function getHomepageProducts(
  limit = 6,
): Promise<ProductRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "AVAILABLE")
    .order("homepage_position", { ascending: true, nullsFirst: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => mapProduct(row as unknown as RawProduct));
}

export interface CatalogResult {
  products: ProductRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Full catalog query backing /en-venta — real DB filtering/sorting/pagination, never a client-side scan. */
export async function getCatalogProducts(
  filters: ProductFilterInput,
): Promise<CatalogResult> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" });

  query = filters.vendidos
    ? query.in("status", ["AVAILABLE", "RESERVED", "SOLD"])
    : query.in("status", ["AVAILABLE", "RESERVED"]);

  if (filters.q) {
    query = query.textSearch("title", filters.q, {
      type: "websearch",
      config: "spanish",
    });
  }
  if (filters.tipo) {
    query = query.eq("type_normalized", normalizeKey(filters.tipo));
  }
  if (filters.lugar) {
    query = query.eq("location_normalized", normalizeKey(filters.lugar));
  }
  if (filters.min !== undefined) {
    query = query.gte("price", filters.min);
  }
  if (filters.max !== undefined) {
    query = query.lte("price", filters.max);
  }

  if (filters.orden === "precio-asc") {
    query = query.order("price", { ascending: true, nullsFirst: false });
  } else if (filters.orden === "precio-desc") {
    query = query.order("price", { ascending: false, nullsFirst: true });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  const from = (filters.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    products: (data ?? []).map((row) => mapProduct(row as unknown as RawProduct)),
    totalCount: count ?? 0,
    page: filters.page,
    pageSize: PAGE_SIZE,
  };
}

export type ProductLookupResult =
  | { kind: "found"; product: ProductRow }
  | { kind: "redirect"; currentSlug: string }
  | { kind: "not-found" };

/** Detail-page lookup: resolves the current slug, or a historic one via 308 redirect data, or not-found. */
export async function getProductBySlug(
  slug: string,
): Promise<ProductLookupResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return { kind: "found", product: mapProduct(data as unknown as RawProduct) };
  }

  const { data: historyRow } = await supabase
    .from("product_slug_history")
    .select("product_id, products ( slug, status )")
    .eq("slug", slug)
    .maybeSingle();

  const historicProduct = historyRow?.products as
    | { slug: string; status: string }
    | null
    | undefined;

  if (historicProduct && historicProduct.status !== "DRAFT") {
    return { kind: "redirect", currentSlug: historicProduct.slug };
  }

  return { kind: "not-found" };
}

/** "Más productos" rail on the detail page: same type first, falls back to recent inventory. */
export async function getRelatedProducts(
  excludeId: string,
  type: string,
  limit = 3,
): Promise<ProductRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("status", ["AVAILABLE", "RESERVED"])
    .eq("type_normalized", normalizeKey(type))
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const results = (data ?? []).map((row) =>
    mapProduct(row as unknown as RawProduct),
  );

  if (results.length >= limit) return results;

  const { data: fallback, error: fallbackError } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("status", ["AVAILABLE", "RESERVED"])
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (fallbackError) throw fallbackError;

  const seen = new Set(results.map((p) => p.id));
  for (const row of fallback ?? []) {
    const mapped = mapProduct(row as unknown as RawProduct);
    if (!seen.has(mapped.id) && results.length < limit) {
      results.push(mapped);
      seen.add(mapped.id);
    }
  }

  return results;
}

/** Distinct location display values for the catalog filter dropdown. */
export async function getDistinctLocations(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("location")
    .in("status", ["AVAILABLE", "RESERVED"])
    .not("location", "is", null);

  if (error) throw error;

  const seen = new Map<string, string>();
  for (const row of data ?? []) {
    const value = row.location;
    if (!value) continue;
    const key = normalizeKey(value);
    if (!seen.has(key)) seen.set(key, value);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, "es"));
}

/** Distinct type display values for the catalog filter dropdown. */
export async function getDistinctTypes(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("type")
    .in("status", ["AVAILABLE", "RESERVED"]);

  if (error) throw error;

  const seen = new Map<string, string>();
  for (const row of data ?? []) {
    const key = normalizeKey(row.type);
    if (!seen.has(key)) seen.set(key, row.type);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, "es"));
}
