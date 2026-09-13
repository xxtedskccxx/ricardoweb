export default function CatalogLoading() {
  return (
    <div role="status" className="mx-auto max-w-[var(--container-max)] px-4 py-10 sm:px-6 lg:px-8" aria-label="Cargando catálogo">
      <div className="h-3 w-32 animate-pulse rounded-full bg-[var(--color-bone)]" />
      <div className="mt-4 h-10 w-44 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bone)]" />
      <div className="mt-8 h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-bone)]" />
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-sm)]">
            <div className="aspect-[4/3] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-bone)]" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-[var(--color-bone)]" />
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-[var(--color-bone)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
