import type { Metadata } from "next";
import { CatalogFilters } from "@/features/products/CatalogFilters";
import { ProductGrid } from "@/features/products/ProductGrid";
import { LinkButton } from "@/components/ui/Button";
import {
  getCatalogProducts,
  getDistinctLocations,
  getDistinctTypes,
} from "@/server/queries";
import { productFilterSchema } from "@/schemas/product";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = ["q", "tipo", "lugar", "min", "max", "orden", "vendidos", "page"].some(
    (key) => Boolean(firstValue(params[key])),
  );
  const title = hasFilters ? "Resultados de búsqueda" : "En venta";
  const description = hasFilters
    ? "Resultados de propiedades, vehículos y piezas disponibles en la colección de Altamar."
    : "Propiedades, vehículos y piezas en venta en República Dominicana. Filtra por tipo o ubicación y revisa cada publicación.";
  const socialTitle = hasFilters ? "Resultados de búsqueda | Altamar" : "En venta | Altamar";

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/en-venta") },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: socialTitle,
      description,
      url: absoluteUrl("/en-venta"),
      images: [
        {
          url: absoluteUrl("/images/altamar/hero.webp"),
          width: 1200,
          height: 630,
          alt: "Altamar — propiedades y piezas en República Dominicana",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [absoluteUrl("/images/altamar/hero.webp")],
    },
  };
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;

  const parsed = productFilterSchema.safeParse({
    q: firstValue(rawParams.q),
    tipo: firstValue(rawParams.tipo),
    lugar: firstValue(rawParams.lugar),
    min: firstValue(rawParams.min),
    max: firstValue(rawParams.max),
    orden: firstValue(rawParams.orden),
    vendidos: firstValue(rawParams.vendidos),
    page: firstValue(rawParams.page),
  });

  const filters = parsed.success
    ? parsed.data
    : productFilterSchema.parse({});

  const [{ products, totalCount, page, pageSize }, types, locations] =
    await Promise.all([
      getCatalogProducts(filters),
      getDistinctTypes(),
      getDistinctLocations(),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasActiveFilters = Boolean(
    filters.q || filters.tipo || filters.lugar || filters.min || filters.max,
  );
  const itemListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Propiedades y piezas en venta en República Dominicana",
    numberOfItems: totalCount,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: (page - 1) * pageSize + index + 1,
      name: product.title,
      url: absoluteUrl(`/producto/${product.slug}`),
    })),
  };

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.tipo) params.set("tipo", filters.tipo);
    if (filters.lugar) params.set("lugar", filters.lugar);
    if (filters.min !== undefined) params.set("min", String(filters.min));
    if (filters.max !== undefined) params.set("max", String(filters.max));
    if (filters.orden !== "recientes") params.set("orden", filters.orden);
    params.set("page", String(nextPage));
    return `/en-venta?${params.toString()}`;
  }

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListStructuredData) }}
      />
      <div className="flex flex-col gap-2 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-sand-text)]">
          Inventario disponible
        </p>
        <h1 className="font-display text-3xl text-[var(--color-ink)]">Propiedades y piezas en venta</h1>
        <p className="max-w-2xl text-[var(--color-ink-muted)]">
          Revisa las publicaciones disponibles en República Dominicana. Filtra por tipo, ubicación o precio para encontrar lo que buscas.
        </p>
      </div>

      <CatalogFilters types={types} locations={locations} />

      <div className="mt-8">
        {products.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-[var(--color-ink-muted)]">
              {totalCount} {totalCount === 1 ? "artículo" : "artículos"}
            </p>
            <ProductGrid products={products} priorityCount={3} />

            {totalPages > 1 && (
              <nav
                aria-label="Paginación"
                className="mt-10 flex items-center justify-center gap-3"
              >
                {page > 1 && (
                  <LinkButton href={pageHref(page - 1)} variant="secondary">
                    Anterior
                  </LinkButton>
                )}
                <span className="text-sm text-[var(--color-ink-muted)]">
                  Página {page} de {totalPages}
                </span>
                {page < totalPages && (
                  <LinkButton href={pageHref(page + 1)} variant="secondary">
                    Siguiente
                  </LinkButton>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <p className="text-[var(--color-ink-muted)]">
              {hasActiveFilters
                ? "No encontramos artículos con esos filtros."
                : "Aún no hay artículos publicados."}
            </p>
            {hasActiveFilters && (
              <div className="mt-4">
                <LinkButton href="/en-venta" variant="secondary">
                  Quitar filtros
                </LinkButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
