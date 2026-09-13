"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setProductStatus } from "@/server/actions/product";
import { DeleteProductButton } from "./DeleteProductButton";
import { EditIcon, EyeOffIcon } from "@/components/admin/ProductActionIcons";

type ProductStatus = "DRAFT" | "AVAILABLE" | "RESERVED" | "SOLD";

interface ProductRowActionsProps {
  productId: string;
  productTitle: string;
  status: ProductStatus;
}

export function ProductRowActions({
  productId,
  productTitle,
  status,
}: ProductRowActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isHidden = status === "DRAFT";

  function hideProduct() {
    setError(null);
    startTransition(async () => {
      const result = await setProductStatus(productId, "unpublish");
      if (!result.success) {
        setError(result.error ?? "No se pudo ocultar la publicación.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1" aria-label={`Acciones para ${productTitle}`}>
      <Link
        href={`/admin/productos/${productId}`}
        prefetch
        aria-label="Editar producto"
        title="Editar producto"
        className={iconButtonClass}
      >
        <EditIcon />
      </Link>
      <DeleteProductButton productId={productId} productTitle={productTitle} iconOnly />
      <button
        type="button"
        onClick={hideProduct}
        disabled={isHidden || pending}
        aria-label={isHidden ? "Producto oculto" : "Ocultar producto"}
        title={isHidden ? "Producto oculto" : "Ocultar producto"}
        aria-busy={pending}
        className={`${iconButtonClass} ${isHidden ? "cursor-default border-[var(--color-border)] text-[var(--color-ink-muted)]/50" : "text-[var(--color-ink-muted)] hover:border-[var(--color-olive)] hover:bg-[var(--color-bone)] hover:text-[var(--color-olive)]"}`}
      >
        <EyeOffIcon />
      </button>
      {error && <span role="alert" className="sr-only">{error}</span>}
    </div>
  );
}

const iconButtonClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] text-[var(--color-ink)] transition-[background-color,border-color,transform,color] duration-[var(--duration-fast)] hover:-translate-y-px active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/30";
