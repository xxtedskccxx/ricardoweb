"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchForm({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    router.push(
      trimmed ? `/en-venta?q=${encodeURIComponent(trimmed)}` : "/en-venta",
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`relative ${className ?? ""}`}
    >
      <label htmlFor="site-search" className="sr-only">
        Buscar en la colección
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-muted)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar en la colección…"
        className="h-11 w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] pl-9 pr-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus-visible:outline-none"
      />
    </form>
  );
}
