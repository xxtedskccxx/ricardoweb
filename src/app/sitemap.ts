import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("slug, updated_at")
    .in("status", ["AVAILABLE", "RESERVED", "SOLD"]);

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
