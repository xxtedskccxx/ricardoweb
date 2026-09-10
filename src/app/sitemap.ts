import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("slug, updated_at")
    .in("status", ["AVAILABLE", "RESERVED", "SOLD"]);

  const productEntries: MetadataRoute.Sitemap = (data ?? []).map((row) => ({
    url: `${siteConfig.url}/producto/${row.slug}`,
    lastModified: row.updated_at,
  }));

  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/en-venta`, changeFrequency: "daily", priority: 0.9 },
    ...productEntries,
  ];
}
