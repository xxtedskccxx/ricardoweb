import Link from "next/link";
import { ProductForm } from "@/features/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-6">
      <Link
        href="/admin/productos"
        className="w-fit text-sm text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/30"
      >
        ← Productos
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-olive)]">
            Nueva publicación
          </p>
          <h1 className="mt-2 font-display text-3xl text-[var(--color-ink)] sm:text-4xl">
            Crear producto
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Guarda los datos básicos primero. Quedará como borrador; después podrás añadir fotos y publicarlo.
          </p>
        </div>
        <span className="w-fit rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-muted)]">
          Paso 1 · Información
        </span>
      </div>
      <ProductForm />
    </div>
  );
}
