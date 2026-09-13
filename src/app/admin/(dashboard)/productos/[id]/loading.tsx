export default function ProductLoading() {
  return (
    <div role="status" aria-label="Cargando producto" className="mx-auto flex max-w-[var(--container-max)] flex-col gap-8">
      <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--color-bone)]" />
      <div className="flex flex-col gap-3">
        <div className="h-3 w-32 animate-pulse rounded-full bg-[var(--color-bone)]" />
        <div className="h-11 w-72 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bone)]" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-[var(--color-bone)]" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
            <div className="h-5 w-36 animate-pulse rounded-full bg-[var(--color-bone)]" />
            <div className="mt-5 h-12 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bone)]" />
            <div className="mt-3 h-12 w-4/5 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bone)]" />
          </div>
        ))}
      </div>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-sm)]">
          <div className="h-5 w-44 animate-pulse rounded-full bg-[var(--color-bone)]" />
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bone)]" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-ink)]/10" />
      </div>
    </div>
  );
}
