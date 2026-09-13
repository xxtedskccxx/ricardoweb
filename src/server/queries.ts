import "server-only";
import { dbQuery } from "@/lib/db";
import { normalizeKey } from "@/lib/normalize";
import type { ProductFilterInput } from "@/schemas/product";

export interface ProductAttribute { label: string; value: string }
export interface ProductImageRow {
  id: string; publicId: string; width: number; height: number; format: string;
  alt: string | null; position: number;
}
export interface ProductRow {
  id: string; slug: string; title: string; shortDescription: string | null;
  description: string | null; type: string; price: number | null;
  currency: "USD" | "DOP"; priceMode: "FIXED" | "NEGOTIABLE" | "CONTACT";
  location: string | null; showLocation: boolean; locationLatitude: number | null;
  locationLongitude: number | null; status: "DRAFT" | "AVAILABLE" | "RESERVED" | "SOLD";
  featured: boolean; attributes: ProductAttribute[]; publishedAt: string | null;
  images: ProductImageRow[];
}

type ProductDbRow = {
  id: string; slug: string; title: string; short_description: string | null;
  description: string | null; type: string; price: string | number | null;
  currency: ProductRow["currency"]; price_mode: ProductRow["priceMode"];
  location: string | null; show_location: boolean; location_latitude: string | number | null;
  location_longitude: string | number | null; status: ProductRow["status"]; featured: boolean;
  attributes: unknown; published_at: string | Date | null;
  image_id: string | null; public_id: string | null; image_width: number | null;
  image_height: number | null; image_format: string | null; image_alt: string | null;
  image_position: number | null;
};

function iso(value: string | Date | null) { return value instanceof Date ? value.toISOString() : value; }

function mapProducts(rows: ProductDbRow[]): ProductRow[] {
  const grouped = new Map<string, ProductRow>();
  for (const row of rows) {
    let product = grouped.get(row.id);
    if (!product) {
      product = {
        id: row.id, slug: row.slug, title: row.title,
        shortDescription: row.short_description, description: row.description,
        type: row.type, price: row.price === null ? null : Number(row.price),
        currency: row.currency, priceMode: row.price_mode, location: row.location,
        showLocation: row.show_location, locationLatitude: row.location_latitude === null ? null : Number(row.location_latitude),
        locationLongitude: row.location_longitude === null ? null : Number(row.location_longitude),
        status: row.status, featured: row.featured,
        attributes: Array.isArray(row.attributes) ? row.attributes as ProductAttribute[] : [],
        publishedAt: iso(row.published_at), images: [],
      };
      grouped.set(row.id, product);
    }
    if (row.image_id && row.public_id && row.image_width && row.image_height && row.image_format && row.image_position !== null) {
      product.images.push({ id: row.image_id, publicId: row.public_id, width: row.image_width, height: row.image_height, format: row.image_format, alt: row.image_alt, position: row.image_position });
    }
  }
  return Array.from(grouped.values()).map((product) => ({ ...product, images: product.images.slice().sort((a, b) => a.position - b.position) }));
}

const PRODUCT_FIELDS = `
  p.id, p.slug, p.title, p.short_description, p.description, p.type,
  p.price, p.currency, p.price_mode, p.location, p.show_location,
  p.location_latitude, p.location_longitude, p.status, p.featured,
  p.attributes, p.published_at, pi.id AS image_id, pi.public_id,
  pi.width AS image_width, pi.height AS image_height, pi.format AS image_format,
  pi.alt AS image_alt, pi.position AS image_position
`;

function productQuery(where: string, params: unknown[], order = "p.published_at DESC NULLS LAST", limit?: number, offset?: number) {
  const limitSql = limit === undefined ? "" : ` LIMIT $${params.push(limit)}`;
  const offsetSql = offset === undefined ? "" : ` OFFSET $${params.push(offset)}`;
  return { text: `SELECT ${PRODUCT_FIELDS} FROM products p LEFT JOIN product_images pi ON pi.product_id = p.id WHERE ${where} ORDER BY ${order}${limitSql}${offsetSql}`, params };
}

function escapeLike(value: string) { return value.replace(/[\\%_]/g, "\\$&"); }

export async function getHomepageProducts(limit = 6): Promise<ProductRow[]> {
  const query = productQuery("p.status = 'AVAILABLE'", [], "p.homepage_position ASC NULLS LAST, p.published_at DESC NULLS LAST", limit);
  return mapProducts(await dbQuery<ProductDbRow>(query.text, query.params));
}

export interface CatalogResult { products: ProductRow[]; totalCount: number; page: number; pageSize: number }
const PAGE_SIZE = 12;

function catalogWhere(filters: ProductFilterInput) {
  const params: unknown[] = [];
  const conditions = [filters.vendidos ? "p.status IN ('AVAILABLE', 'RESERVED', 'SOLD')" : "p.status IN ('AVAILABLE', 'RESERVED')"];
  const add = (value: unknown) => { params.push(value); return `$${params.length}`; };
  if (filters.q) { const needle = add(`%${escapeLike(filters.q)}%`); conditions.push(`(p.title ILIKE ${needle} ESCAPE '\\' OR p.short_description ILIKE ${needle} ESCAPE '\\' OR p.type ILIKE ${needle} ESCAPE '\\')`); }
  if (filters.tipo) conditions.push(`p.type_normalized = ${add(normalizeKey(filters.tipo))}`);
  if (filters.lugar) conditions.push(`p.show_location = true AND p.location_normalized = ${add(normalizeKey(filters.lugar))}`);
  if (filters.min !== undefined) conditions.push(`p.price >= ${add(filters.min)}`);
  if (filters.max !== undefined) conditions.push(`p.price <= ${add(filters.max)}`);
  return { where: conditions.join(" AND "), params };
}

export async function getCatalogProducts(filters: ProductFilterInput): Promise<CatalogResult> {
  const built = catalogWhere(filters);
  const countRows = await dbQuery<{ count: string }>(`SELECT count(*)::text AS count FROM products p WHERE ${built.where}`, built.params);
  const order = filters.orden === "precio-asc" ? "p.price ASC NULLS LAST" : filters.orden === "precio-desc" ? "p.price DESC NULLS LAST" : "p.published_at DESC NULLS LAST";
  const query = productQuery(built.where, built.params.slice(), order, PAGE_SIZE, (filters.page - 1) * PAGE_SIZE);
  return { products: mapProducts(await dbQuery<ProductDbRow>(query.text, query.params)), totalCount: Number(countRows[0]?.count ?? 0), page: filters.page, pageSize: PAGE_SIZE };
}

export type ProductLookupResult = { kind: "found"; product: ProductRow } | { kind: "redirect"; currentSlug: string } | { kind: "not-found" };

export async function getProductBySlug(slug: string): Promise<ProductLookupResult> {
  const query = productQuery("p.slug = $1", [slug]);
  const product = mapProducts(await dbQuery<ProductDbRow>(query.text, query.params))[0];
  if (product) return product.status === "DRAFT" ? { kind: "not-found" } : { kind: "found", product };
  const history = await dbQuery<{ current_slug: string; status: ProductRow["status"] }>("SELECT p.slug AS current_slug, p.status FROM product_slug_history h JOIN products p ON p.id = h.product_id WHERE h.slug = $1 LIMIT 1", [slug]);
  const historic = history[0];
  return historic && historic.status !== "DRAFT" ? { kind: "redirect", currentSlug: historic.current_slug } : { kind: "not-found" };
}

export async function getRelatedProducts(excludeId: string, type: string, limit = 3): Promise<ProductRow[]> {
  const same = productQuery("p.status IN ('AVAILABLE', 'RESERVED') AND p.type_normalized = $1 AND p.id <> $2", [normalizeKey(type), excludeId], "p.published_at DESC NULLS LAST", limit);
  const results = mapProducts(await dbQuery<ProductDbRow>(same.text, same.params));
  if (results.length >= limit) return results;
  const fallback = productQuery("p.status IN ('AVAILABLE', 'RESERVED') AND p.id <> $1", [excludeId], "p.published_at DESC NULLS LAST", limit);
  const seen = new Set(results.map((item) => item.id));
  for (const item of mapProducts(await dbQuery<ProductDbRow>(fallback.text, fallback.params))) if (!seen.has(item.id) && results.length < limit) { results.push(item); seen.add(item.id); }
  return results;
}

export async function getDistinctLocations(): Promise<string[]> {
  const rows = await dbQuery<{ location: string | null }>("SELECT location FROM products WHERE status IN ('AVAILABLE', 'RESERVED') AND show_location = true AND location IS NOT NULL");
  const seen = new Map<string, string>();
  for (const row of rows) if (row.location && !seen.has(normalizeKey(row.location))) seen.set(normalizeKey(row.location), row.location);
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, "es"));
}

export async function getDistinctTypes(): Promise<string[]> {
  const rows = await dbQuery<{ type: string }>("SELECT type FROM products WHERE status IN ('AVAILABLE', 'RESERVED')");
  const seen = new Map<string, string>();
  for (const row of rows) if (!seen.has(normalizeKey(row.type))) seen.set(normalizeKey(row.type), row.type);
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, "es"));
}

export interface AdminProductRow { id: string; title: string; type: string; price: number | null; currency: ProductRow["currency"]; price_mode: ProductRow["priceMode"]; status: ProductRow["status"]; updated_at: string | Date; product_images: { public_id: string; position: number }[] }

export async function getAdminProducts(filters: { q?: string; status?: ProductRow["status"]; page: number; pageSize: number }) {
  const params: unknown[] = []; const conditions: string[] = []; const add = (value: unknown) => { params.push(value); return `$${params.length}`; };
  if (filters.status) conditions.push(`p.status = ${add(filters.status)}`);
  if (filters.q) conditions.push(`p.title ILIKE ${add(`%${escapeLike(filters.q)}%`)} ESCAPE '\\'`);
  const where = conditions.length ? conditions.join(" AND ") : "TRUE";
  const countRows = await dbQuery<{ count: string }>(`SELECT count(*)::text AS count FROM products p WHERE ${where}`, params);
  const rows = await dbQuery<AdminProductRow>(`SELECT p.id, p.title, p.type, p.price, p.currency, p.price_mode, p.status, p.updated_at, COALESCE(json_agg(json_build_object('public_id', pi.public_id, 'position', pi.position) ORDER BY pi.position) FILTER (WHERE pi.id IS NOT NULL), '[]') AS product_images FROM products p LEFT JOIN product_images pi ON pi.product_id = p.id WHERE ${where} GROUP BY p.id ORDER BY p.updated_at DESC LIMIT ${add(filters.pageSize)} OFFSET ${add((filters.page - 1) * filters.pageSize)}`, params);
  return { rows, count: Number(countRows[0]?.count ?? 0) };
}

export async function getAdminProductById(id: string): Promise<ProductRow | null> {
  const query = productQuery("p.id = $1", [id], "p.updated_at DESC");
  const product = mapProducts(await dbQuery<ProductDbRow>(query.text, query.params))[0];
  return product ?? null;
}

export async function getAdminDashboardData() {
  const counts = await dbQuery<{ status: ProductRow["status"]; count: string }>(
    "SELECT status, count(*)::text AS count FROM products GROUP BY status",
  );
  const recent = await dbQuery<{
    id: string; title: string; type: string; price: string | number | null;
    currency: ProductRow["currency"]; price_mode: ProductRow["priceMode"];
    status: ProductRow["status"]; updated_at: string | Date;
  }>("SELECT id,title,type,price,currency,price_mode,status,updated_at FROM products ORDER BY updated_at DESC LIMIT 5");
  return {
    counts: Object.fromEntries(counts.map((row) => [row.status, Number(row.count)])),
    recent: recent.map((row) => ({ ...row, price: row.price === null ? null : Number(row.price), updated_at: iso(row.updated_at) ?? "" })),
  };
}
