"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useState, useTransition } from "react";

interface CatalogFiltersProps {
  types: string[];
  locations: string[];
}

const SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
];

/**
 * Every control here writes to the URL (searchParams), so filtering is
 * shareable, back-button correct and server-rendered — no client-side
 * scan of the full inventory.
 */
export function CatalogFilters({ types, locations }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qId = useId();
  const tipoId = useId();
  const lugarId = useId();
  const ordenId = useId();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [pending, startTransition] = useTransition();

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => router.push(`/en-venta?${params.toString()}`));
  }, [router, searchParams]);

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;
    const timer = window.setTimeout(() => setParam("q", query), 320);
    return () => window.clearTimeout(timer);
  }, [query, searchParams, setParam]);

  return (
    <div key={searchParams.toString()} aria-busy={pending} className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:min-w-[180px]">
        <label htmlFor={qId} className="text-xs font-medium text-[var(--color-ink-muted)]">
          Buscar publicaciones
        </label>
        <input
          id={qId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej. villa, Rolex, Punta Cana…"
          className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm focus-visible:border-[var(--color-olive)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/20"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1 sm:w-40">
        <label htmlFor={tipoId} className="text-xs font-medium text-[var(--color-ink-muted)]">
          Tipo
        </label>
        <select
          id={tipoId}
          defaultValue={searchParams.get("tipo") ?? ""}
          onChange={(e) => setParam("tipo", e.target.value)}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm focus-visible:border-[var(--color-olive)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/20"
        >
          <option value="">Todos</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-0 flex-col gap-1 sm:w-44">
        <label htmlFor={lugarId} className="text-xs font-medium text-[var(--color-ink-muted)]">
          Ubicación
        </label>
        <select
          id={lugarId}
          defaultValue={searchParams.get("lugar") ?? ""}
          onChange={(e) => setParam("lugar", e.target.value)}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm focus-visible:border-[var(--color-olive)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/20"
        >
          <option value="">Todas</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-w-0 flex-col gap-1 sm:w-52">
        <label htmlFor={ordenId} className="text-xs font-medium text-[var(--color-ink-muted)]">
          Ordenar por
        </label>
        <select
          id={ordenId}
          defaultValue={searchParams.get("orden") ?? "recientes"}
          onChange={(e) => setParam("orden", e.target.value)}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
