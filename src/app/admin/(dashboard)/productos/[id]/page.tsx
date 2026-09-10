import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/features/admin/ProductForm";
import { ImageManager } from "@/features/admin/ImageManager";
import { StatusControls } from "@/features/admin/StatusControls";
import { DeleteProductButton } from "@/features/admin/DeleteProductButton";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, title, short_description, description, type, price, currency, price_mode, location, featured, attributes, status, slug, product_images(id, public_id, width, height, alt, position)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  const attributes = Array.isArray(product.attributes)
    ? (product.attributes as { label: string; value: string }[])
    : [];

  const images = (product.product_images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((img) => ({
      id: img.id,
      publicId: img.public_id,
      width: img.width,
      height: img.height,
      alt: img.alt,
      position: img.position,
    }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link href="/admin/productos" className="text-sm text-[var(--color-ink-muted)] hover:underline">
          ← Productos
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl text-[var(--color-ink)]">
            {product.title}
          </h1>
          <StatusBadge status={product.status} />
        </div>
        {product.status === "AVAILABLE" && (
          <Link
            href={`/producto/${product.slug}`}
            target="_blank"
            className="text-sm text-[var(--color-olive)] hover:underline"
          >
            Ver en el sitio público ↗
          </Link>
        )}
      </div>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg text-[var(--color-ink)]">
          Publicación
        </h2>
        <div className="mt-4">
          <StatusControls productId={product.id} status={product.status} />
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg text-[var(--color-ink)]">
          Imágenes
        </h2>
        <div className="mt-4">
          <ImageManager productId={product.id} initialImages={images} />
        </div>
      </section>

      <ProductForm
        productId={product.id}
        initial={{
          title: product.title,
          shortDescription: product.short_description ?? "",
          description: product.description ?? "",
          type: product.type,
          price: product.price !== null ? String(product.price) : "",
          currency: product.currency,
          priceMode: product.price_mode,
          location: product.location ?? "",
          featured: product.featured,
          attributes,
        }}
      />

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg text-[var(--color-ink)]">
          Zona de riesgo
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Eliminar un producto también elimina sus imágenes.
        </p>
        <div className="mt-4">
          <DeleteProductButton productId={product.id} productTitle={product.title} />
        </div>
      </section>
    </div>
  );
}
