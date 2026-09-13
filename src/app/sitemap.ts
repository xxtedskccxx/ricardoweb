import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { dbQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await dbQuery<{ slug: string; updated_at: string | Date }>(
    "SELECT slug, updated_at FROM products WHERE status IN ('AVAILABLE', 'RESERVED', 'SOLD')",
  );

  const productEntries: MetadataRoute.Sitemap = (data ?? []).map((row) => ({
    url: absoluteUrl(`/producto/${row.slug}`),
    lastModified: row.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/en-venta"), changeFrequency: "daily", priority: 0.9 },
    ...productEntries,
  ];
}
