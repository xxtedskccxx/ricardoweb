import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice } from "@/lib/money";
import { AdminProductFilters } from "./AdminProductFilters";

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
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("products")
    .select(
      "id, title, type, price, currency, price_mode, status, updated_at, product_images(public_id, position)",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (q) query = query.ilike("title", `%${q}%`);

  const from = (page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await query;
  const products = data ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-[var(--color-ink)]">
          Productos
        </h1>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-[var(--color-olive)] px-5 text-sm font-medium text-[var(--color-ivory)]"
        >
          Crear producto
        </Link>
      </div>

      <AdminProductFilters />

      {error && (
        <p className="text-sm text-[var(--color-danger)]">
          No se pudieron cargar los productos.
        </p>
      )}

      {products.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center text-[var(--color-ink-muted)]">
          No hay productos que coincidan.
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
                        className="flex items-center gap-3 font-medium text-[var(--color-ink)]"
                      >
                        <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bone)] text-[10px] text-[var(--color-ink-muted)]">
                          {cover ? "IMG" : "—"}
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
