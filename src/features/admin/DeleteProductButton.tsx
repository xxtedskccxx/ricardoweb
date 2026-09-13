"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/server/actions/product";
import { TrashIcon } from "@/components/admin/ProductActionIcons";

export function DeleteProductButton({
  productId,
  productTitle,
  iconOnly = false,
}: {
  productId: string;
  productTitle: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const trigger = triggerRef.current;
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button"));
        const first = items[0];
        const last = items[items.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      (previous ?? trigger)?.focus();
    };
  }, [open]);

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
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label="Eliminar producto"
        title="Eliminar producto"
        className={iconOnly ? iconButtonClass : "min-h-[44px] rounded-[var(--radius-pill)] border border-[var(--color-danger)] px-4 py-2 text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]/30"}
      >
        {iconOnly ? <TrashIcon /> : "Eliminar producto"}
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

const iconButtonClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] transition-[background-color,border-color,transform] duration-[var(--duration-fast)] hover:-translate-y-px hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]/30";
