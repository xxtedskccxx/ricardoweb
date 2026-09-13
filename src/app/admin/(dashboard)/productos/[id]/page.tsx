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
    <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/productos"
          className="w-fit text-sm text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/30"
        >
          ← Productos
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-olive)]">
              Editar publicación
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
                {product.title}
              </h1>
              <StatusBadge status={product.status} />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Mantén la información al día. Publica cuando todo esté listo.
            </p>
          </div>
          {product.status === "AVAILABLE" && (
            <Link
              href={`/producto/${product.slug}`}
              target="_blank"
              className="w-fit rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-[background-color,border-color,transform] hover:-translate-y-px hover:border-[var(--color-olive)] hover:bg-[var(--color-bone)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/30"
            >
              Ver publicación pública ↗
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-olive)]">Paso 2</p>
              <h2 className="mt-2 font-display text-xl text-[var(--color-ink)]">Publicación</h2>
            </div>
            <span className="sr-only">Estado: {product.status}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">Elige si está visible, reservada o vendida.</p>
          <div className="mt-5">
            <StatusControls productId={product.id} status={product.status} />
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-olive)]">Paso 3</p>
            <h2 className="mt-2 font-display text-xl text-[var(--color-ink)]">Imágenes</h2>
          </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">Sube una portada y añade más fotos después de guardar los datos.</p>
          <div className="mt-5">
            <ImageManager productId={product.id} initialImages={images} />
          </div>
        </section>
      </div>

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

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-danger)]">Acción permanente</p>
        <h2 className="mt-2 font-display text-lg text-[var(--color-ink)]">Borrado permanente</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          También se borrarán sus imágenes. Esta acción no se puede deshacer.
        </p>
        <div className="mt-4">
          <DeleteProductButton productId={product.id} productTitle={product.title} />
        </div>
      </section>
    </div>
  );
}
