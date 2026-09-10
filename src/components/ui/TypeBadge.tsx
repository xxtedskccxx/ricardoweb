import { getProductTypeDefinition } from "@/config/product-types";

const ICON_PATH: Record<string, string> = {
  home: "M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9",
  car: "M4 16h16M6 16l1.5-5h9L18 16M8 19a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z",
  land: "M4 20h16M6 20V9l6-5 6 5v11",
  boat: "M3 17h18l-2 4H5l-2-4Zm3-2V8h2v7m4-7v7m4-7v7M5 8h14",
  watch: "M8 6h8l1 3H7l1-3Zm-1 3h10v6H7V9Zm1 9h8l-1 3H9l-1-3Z",
  tag: "m5 11 6-6h6v6l-6 6-6-6ZM14.5 8.5h.01",
};

export function TypeBadge({ type }: { type: string }) {
  const definition = getProductTypeDefinition(type);
  const path = ICON_PATH[definition.icon] ?? ICON_PATH.tag;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-ink)] shadow-[var(--shadow-sm)]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
      {definition.label}
    </span>
  );
}
