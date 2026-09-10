import type { ProductAttribute } from "@/server/queries";

export function SpecsList({ attributes }: { attributes: ProductAttribute[] }) {
  if (attributes.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-xl text-[var(--color-ink)]">
        Especificaciones
      </h2>
      <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {attributes.map((attr) => (
          <div
            key={attr.label}
            className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] pb-2 text-sm"
          >
            <dt className="text-[var(--color-ink-muted)]">{attr.label}</dt>
            <dd className="font-medium text-[var(--color-ink)]">
              {attr.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
