import Link from "next/link";
import { PageTransition } from "@/components/motion/Reveal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice } from "@/lib/money";
import { getAdminDashboardData } from "@/server/queries";

const STATUSES = [
  { key: "AVAILABLE", label: "Disponibles", tone: "bg-[var(--color-available)]" },
  { key: "DRAFT", label: "Borradores", tone: "bg-[var(--color-ink-muted)]" },
  { key: "RESERVED", label: "Reservados", tone: "bg-[var(--color-reserved)]" },
  { key: "SOLD", label: "Vendidos", tone: "bg-[var(--color-sold)]" },
] as const;

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const { counts, recent } = await getAdminDashboardData();

  return (
    <PageTransition>
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-sand-text)]">
              Vista general
            </p>
            <h1 className="mt-2 font-display text-3xl tracking-[-0.02em] text-[var(--color-ink)] sm:text-4xl">
              <span className="sr-only">Panel: </span>
              Tu inventario, en orden.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-ink-muted)]">
              Aquí ves qué está publicado, qué sigue en borrador y qué necesita atención.
            </p>
          </div>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-[var(--radius-pill)] bg-[var(--color-olive)] px-5 text-sm font-medium text-[var(--color-ivory)] shadow-[0_10px_22px_rgba(36,64,44,.16)] transition-[background-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:-translate-y-px hover:bg-[var(--color-olive-strong)] hover:shadow-[0_14px_28px_rgba(36,64,44,.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/35 active:scale-[0.98]"
          >
            <span aria-hidden="true" className="text-lg leading-none">+</span>
            Añadir producto
          </Link>
        </header>

        <section aria-labelledby="inventory-status" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 id="inventory-status" className="text-sm font-semibold text-[var(--color-ink)]">
              Estado de tus publicaciones
            </h2>
            <Link href="/admin/productos" className="text-sm font-medium text-[var(--color-olive)] hover:underline">
              Ver publicaciones
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {STATUSES.map((item) => (
              <Link
                key={item.key}
                href={`/admin/productos?estado=${item.key}`}
                className="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-[border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 rounded-full ${item.tone}`} />
                  <span aria-hidden="true" className="text-lg text-[var(--color-ink-muted)] transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5">↗</span>
                </div>
                <p className="mt-5 font-display text-4xl leading-none text-[var(--color-ink)]">
                  {counts[item.key] ?? 0}
                </p>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{item.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
          <section
            aria-labelledby="recent-products"
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
              <div>
                <h2 id="recent-products" className="font-display text-xl text-[var(--color-ink)]">
                  Últimos cambios
                </h2>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Las publicaciones que has actualizado recientemente.</p>
              </div>
              <Link href="/admin/productos" className="text-sm font-medium text-[var(--color-olive)] hover:underline">
                Ver publicaciones
              </Link>
            </div>

            {recent.length > 0 ? (
              <ul className="divide-y divide-[var(--color-border)]">
                {recent.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/admin/productos/${product.id}`}
                      prefetch
                      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--color-bone)]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-olive)]/30 sm:px-6"
                    >
                      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bone)] text-sm font-semibold text-[var(--color-olive)]">
                        {product.title.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--color-ink)] group-hover:text-[var(--color-olive)]">
                          {product.title}
                        </span>
                        <span className="mt-1 block truncate text-xs text-[var(--color-ink-muted)]">
                          {product.type} · {formatPrice(product.price, product.currency, product.price_mode)} · {formatUpdatedAt(product.updated_at)}
                        </span>
                      </span>
                      <StatusBadge status={product.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-16 text-center">
                <p className="font-medium text-[var(--color-ink)]">Aún no tienes publicaciones.</p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Crea la primera para empezar a organizar tu inventario.</p>
                <Link href="/admin/productos/nuevo" className="mt-5 inline-flex text-sm font-medium text-[var(--color-olive)] hover:underline">
                  Crear la primera publicación →
                </Link>
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className="rounded-[var(--radius-lg)] bg-[var(--color-olive)] p-6 text-[var(--color-ivory)] shadow-[var(--shadow-md)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-sand-soft)]">Siguiente paso</p>
              <h2 className="mt-3 font-display text-2xl leading-tight">Crea una publicación.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-ivory)]/75">
                Guarda los datos básicos primero. Después podrás añadir fotos, revisar la información y publicarla.
              </p>
              <Link
                href="/admin/productos/nuevo"
                className="mt-6 inline-flex min-h-10 items-center rounded-[var(--radius-pill)] bg-[var(--color-ivory)] px-4 text-sm font-medium text-[var(--color-olive)] transition-transform duration-[var(--duration-fast)] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ivory)]/70 active:scale-[0.98]"
              >
                Crear publicación
              </Link>
            </section>

            <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-sand-text)]">Accesos rápidos</p>
              <div className="mt-4 flex flex-col divide-y divide-[var(--color-border)]">
                <Link href="/admin/productos?estado=DRAFT" className="flex items-center justify-between py-3 text-sm font-medium text-[var(--color-ink)] transition-colors first:pt-0 hover:text-[var(--color-olive)]">
                  Revisar borradores <span aria-hidden="true">→</span>
                </Link>
                <Link href="/admin/productos" className="flex items-center justify-between py-3 text-sm font-medium text-[var(--color-ink)] transition-colors last:pb-0 hover:text-[var(--color-olive)]">
                  Ver todas las publicaciones <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
}
