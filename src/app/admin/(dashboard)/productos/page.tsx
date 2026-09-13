import Link from "next/link";
import Image from "next/image";
import { getAdminProducts } from "@/server/queries";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice } from "@/lib/money";
import { AdminProductFilters } from "./AdminProductFilters";
import { ProductRowActions } from "@/features/admin/ProductRowActions";
import { cardImageSrc } from "@/lib/cloudinary/image-src";
import { isLocalMediaId, localProductImageSrc } from "@/lib/local-media";

interface PageProps {
  searchParams: Promise<{ q?: string; estado?: string; page?: string }>;
}

const PAGE_SIZE = 20;
const VALID_STATUSES = ["DRAFT", "AVAILABLE", "RESERVED", "SOLD"] as const;
type ProductStatus = (typeof VALID_STATUSES)[number];

function parseStatus(value: string | undefined): ProductStatus | undefined {
  return VALID_STATUSES.find((s) => s === value);
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { q, estado, page: pageParam } = await searchParams;
  const status = parseStatus(estado);
  const page = Math.max(1, Number(pageParam) || 1);
  let products: Awaited<ReturnType<typeof getAdminProducts>>["rows"] = [];
  let count = 0;
  let error = false;
  try {
    const result = await getAdminProducts({ q, status, page, pageSize: PAGE_SIZE });
    products = result.rows;
    count = result.count;
  } catch {
    error = true;
  }
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-[var(--color-ink)]">
          Productos
        </h1>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex h-11 items-center rounded-[var(--radius-pill)] bg-[var(--color-olive)] px-5 text-sm font-medium text-[var(--color-ivory)] shadow-[0_8px_18px_rgba(36,64,44,.14)] transition-transform hover:-translate-y-px active:scale-[0.98]"
        >
          Añadir producto
        </Link>
      </div>

      <AdminProductFilters />

      {error ? (
        <div role="alert" className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] px-6 py-12 text-center">
          <p className="font-medium text-[var(--color-danger)]">No pudimos cargar los productos.</p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Actualiza la página para intentarlo de nuevo.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center text-[var(--color-ink-muted)]">
          No encontramos productos con estos filtros.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-xs uppercase text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Actualizado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const cover = (product.product_images ?? []).slice().sort(
                  (a, b) => a.position - b.position,
                )[0];
                return (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bone)]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/productos/${product.id}`}
                        prefetch
                        className="flex items-center gap-3 font-medium text-[var(--color-ink)]"
                      >
                        <span className="relative flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bone)] text-[10px] text-[var(--color-ink-muted)]">
                          {cover ? (
                            <Image
                              src={isLocalMediaId(cover.public_id) ? localProductImageSrc(product.type, product.title) : cardImageSrc(cover.public_id)}
                              alt=""
                              fill
                              sizes="56px"
                              unoptimized={isLocalMediaId(cover.public_id)}
                              className="object-cover"
                            />
                          ) : (
                            "Sin foto"
                          )}
                        </span>
                        {product.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      {product.type}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      {formatPrice(product.price, product.currency, product.price_mode)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      {new Date(product.updated_at).toLocaleDateString("es-DO")}
                    </td>
                    <td className="px-4 py-3">
                      <ProductRowActions
                        productId={product.id}
                        productTitle={product.title}
                        status={product.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={`/admin/productos?page=${page - 1}${q ? `&q=${q}` : ""}${estado ? `&estado=${estado}` : ""}`}
              className="text-sm font-medium text-[var(--color-ink)] hover:underline"
            >
              Anterior
            </Link>
          )}
          <span className="text-sm text-[var(--color-ink-muted)]">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/productos?page=${page + 1}${q ? `&q=${q}` : ""}${estado ? `&estado=${estado}` : ""}`}
              className="text-sm font-medium text-[var(--color-ink)] hover:underline"
            >
              Siguiente
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
