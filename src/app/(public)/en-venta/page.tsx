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

export const metadata: Metadata = {
  title: "En venta",
  description:
    "Explora la colección completa: propiedades, vehículos y artículos únicos disponibles.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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
      <div className="flex flex-col gap-2 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-sand-text)]">
          Colección completa
        </p>
        <h1 className="font-display text-3xl text-[var(--color-ink)]">
          En venta
        </h1>
      </div>

      <CatalogFilters types={types} locations={locations} />

      <div className="mt-8">
        {products.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-[var(--color-ink-muted)]">
              {totalCount} {totalCount === 1 ? "artículo" : "artículos"}
            </p>
            <ProductGrid products={products} />

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
