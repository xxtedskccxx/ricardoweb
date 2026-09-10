const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
  DRAFT: "Borrador",
};

const STATUS_CLASSES: Record<string, string> = {
  AVAILABLE: "text-[var(--color-available)] bg-[var(--color-available-bg)]",
  RESERVED: "text-[var(--color-reserved)] bg-[var(--color-reserved-bg)]",
  SOLD: "text-[var(--color-sold)] bg-[var(--color-sold-bg)]",
  DRAFT: "text-[var(--color-ink-muted)] bg-[var(--color-bone)]",
};

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status] ?? status;
  const classes = STATUS_CLASSES[status] ?? STATUS_CLASSES.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium ${classes}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current"
      />
      {label}
    </span>
  );
}
