import type { ProductAttribute } from "@/server/queries";

const SPEC_ICON_PATHS = [
  "M4 19V5m0 10h16M8 15v-3a2 2 0 0 1 2-2h7a3 3 0 0 1 3 3v6M4 12h4",
  "M7 10V5a3 3 0 0 1 6 0v5m-8 0h14v3a7 7 0 0 1-14 0v-3Zm4 8v3m6-3v3",
  "M4 4h6M4 4v6m16-6h-6m6 0v6M4 20h6m-6 0v-6m16 6h-6m6 0v-6",
  "M5 20V4h9a4 4 0 0 1 0 8H9v8",
  "M4 20h16M6 20V8l6-4 6 4v12M9 20v-7h6v7",
  "M12 22s7-3.5 7-10V5l-7-3-7 3v7c0 6.5 7 10 7 10Z",
];

export function SpecsList({ attributes }: { attributes: ProductAttribute[] }) {
  if (attributes.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-3xl text-[var(--color-ink)]">
        Especificaciones
      </h2>
      <dl className="mt-5 grid grid-cols-1 gap-x-12 sm:grid-cols-2">
        {attributes.map((attr, index) => (
          <div
            key={attr.label}
            className="flex min-h-12 items-center justify-between gap-4 border-b border-[var(--color-border)] py-3 text-sm"
          >
            <dt className="flex items-center gap-3 text-[var(--color-ink-muted)]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-bone)] text-[var(--color-olive)]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4.5 w-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={SPEC_ICON_PATHS[index % SPEC_ICON_PATHS.length]} />
                </svg>
              </span>
              {attr.label}
            </dt>
            <dd className="font-medium text-[var(--color-ink)]">
              {attr.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
