"use client";

import { useState } from "react";

export interface AttributeItem {
  label: string;
  value: string;
}

interface AttributeEditorProps {
  name: string;
  initial: AttributeItem[];
  suggestions?: string[];
}

/**
 * Ordered spec editor. Up/down buttons (not drag) keep reordering fully
 * keyboard-accessible for a short list. It serializes to a hidden JSON input
 * so it works inside a plain form action.
 */
export function AttributeEditor({ name, initial, suggestions = [] }: AttributeEditorProps) {
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

  function addSuggestion(label: string) {
    if (items.length >= 20) return;
    if (items.some((item) => item.label.trim().toLowerCase() === label.toLowerCase())) return;
    setItems((prev) => [...prev, { label, value: "" }]);
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Especificaciones sugeridas">
          <span className="mr-1 text-xs font-medium text-[var(--color-ink-muted)]">Sugerencias</span>
          {suggestions.slice(0, 5).map((suggestion) => {
            const added = items.some((item) => item.label.trim().toLowerCase() === suggestion.toLowerCase());
            return (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSuggestion(suggestion)}
                disabled={added || items.length >= 20}
                className="min-h-9 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] px-3 text-xs font-medium text-[var(--color-ink-muted)] transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] hover:border-[var(--color-olive)] hover:bg-[var(--color-bone)] hover:text-[var(--color-olive)] active:scale-[0.98] disabled:cursor-default disabled:border-[var(--color-border)] disabled:bg-[var(--color-bone)] disabled:text-[var(--color-ink-muted)]/55"
              >
                {added ? `✓ ${suggestion}` : `+ ${suggestion}`}
              </button>
            );
          })}
        </div>
      )}

      {items.length === 0 && (
        <p className="rounded-[var(--radius-md)] bg-[var(--color-bone)]/70 px-3 py-3 text-sm text-[var(--color-ink-muted)]">
          Añade los datos que ayuden a decidir.
        </p>
      )}

      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-1 gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bone)]/45 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto] sm:items-center sm:border-0 sm:bg-transparent sm:p-0">
          <input
            type="text"
            value={item.label}
            onChange={(e) => update(index, { label: e.target.value })}
            placeholder="Etiqueta (ej. Habitaciones)"
            aria-label={`Etiqueta de especificación ${index + 1}`}
            className={inputClass}
          />
          <input
            type="text"
            value={item.value}
            onChange={(e) => update(index, { value: e.target.value })}
            placeholder="Valor (ej. 4)"
            aria-label={`Valor de especificación ${index + 1}`}
            className={inputClass}
          />
          <div className="flex items-center gap-2 sm:contents">
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label="Subir"
              className={iconButtonClass}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === items.length - 1}
              aria-label="Bajar"
              className={iconButtonClass}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Eliminar especificación ${item.label || index + 1}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]/30"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={add}
          disabled={items.length >= 20}
          className="min-h-10 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] hover:border-[var(--color-olive)] hover:bg-[var(--color-bone)] active:scale-[0.98] disabled:opacity-40"
        >
          + Añadir especificación
        </button>
        <span className="text-xs text-[var(--color-ink-muted)]">{items.length}/20 · El orden define la tarjeta</span>
      </div>
    </div>
  );
}

const inputClass =
  "min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus-visible:border-[var(--color-olive)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/20";

const iconButtonClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] text-[var(--color-ink)] transition-[background-color,border-color,transform] duration-[var(--duration-fast)] hover:border-[var(--color-olive)] hover:bg-[var(--color-bone)] active:scale-[0.98] disabled:cursor-default disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/30";
