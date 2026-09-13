"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useState, useTransition } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "DRAFT", label: "Borrador" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "RESERVED", label: "Reservado" },
  { value: "SOLD", label: "Vendido" },
];

export function AdminProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchId = useId();
  const statusId = useId();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [pending, startTransition] = useTransition();

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`/admin/productos?${params.toString()}`));
  }, [router, searchParams]);

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;
    const timer = window.setTimeout(() => setParam("q", query), 320);
    return () => window.clearTimeout(timer);
  }, [query, searchParams, setParam]);

  return (
    <div key={searchParams.toString()} aria-busy={pending} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor={searchId} className="sr-only">Buscar por nombre</label>
      <input
        id={searchId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ej. Toyota, villa o Punta Cana"
        className="h-11 flex-1 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm focus-visible:border-[var(--color-olive)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/20"
      />
      <label htmlFor={statusId} className="sr-only">Filtrar por estado</label>
      <select
        id={statusId}
        value={searchParams.get("estado") ?? ""}
        onChange={(e) => setParam("estado", e.target.value)}
        className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm focus-visible:border-[var(--color-olive)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/20 sm:w-48"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
