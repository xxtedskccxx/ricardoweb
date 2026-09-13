import Link from "next/link";
import type { Route } from "next";
import { CardImage } from "@/components/ui/CardImage";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice } from "@/lib/money";
import type { ProductRow } from "@/server/queries";

interface ProductCardProps {
  product: ProductRow;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const cover = product.images[0];
  const specs = product.attributes.slice(0, 3);
  const showStatusBadge = product.status !== "AVAILABLE";

  return (
    <Link
      href={`/producto/${product.slug}` as Route}
      prefetch
      aria-label={`Ver ${product.title}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out)] lg:hover:-translate-y-1 lg:hover:shadow-[var(--shadow-md)] focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]"
    >
      <div className="relative p-2 pb-0">
        <CardImage
          publicId={cover?.publicId ?? "local:catalog"}
          alt={cover?.alt ?? product.title}
          productType={product.type}
          priority={priority}
        />
        <div className="absolute left-3 top-3">
          <TypeBadge type={product.type} />
        </div>
        {showStatusBadge && (
          <div className="absolute right-3 top-3">
            <StatusBadge status={product.status} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-medium leading-snug text-[var(--color-ink)]">
            {product.title}
          </h3>
        </div>

        <p className="font-display text-lg text-[var(--color-ink)]">
          {formatPrice(product.price, product.currency, product.priceMode)}
        </p>

        {product.showLocation && product.location && (
          <p className="flex items-center gap-1 text-sm text-[var(--color-ink-muted)]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {product.location}
          </p>
        )}

        {specs.length > 0 && (
          <p className="mt-1 truncate text-sm text-[var(--color-ink-muted)]">
            {specs.map((s) => s.value).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
