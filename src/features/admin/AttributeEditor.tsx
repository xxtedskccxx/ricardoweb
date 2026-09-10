"use client";

import { useState } from "react";

export interface AttributeItem {
  label: string;
  value: string;
}

interface AttributeEditorProps {
  name: string;
  initial: AttributeItem[];
}

/**
 * Ordered spec editor. Up/down buttons (not drag) so reordering is fully
 * keyboard-accessible without pulling in a DnD library for what is a
 * short, occasionally-reordered list. Serializes to a hidden JSON input
 * so it works inside a plain form action.
 */
export function AttributeEditor({ name, initial }: AttributeEditorProps) {
  const [items, setItems] = useState<AttributeItem[]>(
    initial.length > 0 ? initial : [],
  );

  function update(index: number, patch: Partial<AttributeItem>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = prev.slice();
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      if (!item) return prev;
      next.splice(target, 0, item);
      return next;
    });
  }

  function add() {
    if (items.length >= 20) return;
    setItems((prev) => [...prev, { label: "", value: "" }]);
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length === 0 && (
        <p className="text-sm text-[var(--color-ink-muted)]">
          Aún no hay especificaciones.
        </p>
      )}

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={item.label}
            onChange={(e) => update(index, { label: e.target.value })}
            placeholder="Etiqueta (ej. Habitaciones)"
            className="h-11 w-1/2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm"
          />
          <input
            type="text"
            value={item.value}
            onChange={(e) => update(index, { value: e.target.value })}
            placeholder="Valor (ej. 4)"
            className="h-11 w-1/2 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm"
          />
          <button
            type="button"
            onClick={() => move(index, -1)}
            disabled={index === 0}
            aria-label="Subir"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(index, 1)}
            disabled={index === items.length - 1}
            aria-label="Bajar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => remove(index)}
            aria-label={`Eliminar especificación ${item.label || index + 1}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-danger)]"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={items.length >= 20}
        className="self-start rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] disabled:opacity-40"
      >
        + Añadir especificación
      </button>
    </div>
  );
}
