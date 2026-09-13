export default function AdminLoading() {
  return (
    <div role="status" className="mx-auto max-w-3xl space-y-6" aria-label="Cargando panel">
      <div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bone)]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface)]" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface)]" />
    </div>
  );
}
