"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/server/actions/product";

export function DeleteProductButton({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (!result.success) {
        setError(result.error ?? "No se pudo eliminar.");
        return;
      }
      router.push("/admin/productos");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[44px] rounded-[var(--radius-md)] border border-[var(--color-danger)] px-4 py-2 text-sm font-medium text-[var(--color-danger)]"
      >
        Eliminar producto
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/50 p-4"
        >
          <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)]">
            <h2 id={headingId} className="font-display text-lg text-[var(--color-ink)]">
              ¿Eliminar “{productTitle}”?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Esta acción no se puede deshacer. Las imágenes asociadas
              también se eliminarán.
            </p>
            {error && (
              <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
                {error}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--color-ink)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirmDelete}
                className="min-h-[44px] rounded-[var(--radius-md)] bg-[var(--color-danger)] px-4 py-2 text-sm font-medium text-[var(--color-ivory)] disabled:opacity-60"
              >
                {pending ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
