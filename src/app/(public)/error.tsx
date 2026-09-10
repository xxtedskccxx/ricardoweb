"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-sand)]">
        Algo salió mal
      </p>
      <h1 className="font-display text-3xl text-[var(--color-ink)]">
        No pudimos cargar esta página
      </h1>
      <p className="max-w-md text-[var(--color-ink-muted)]">
        Intenta de nuevo en unos segundos.
      </p>
      <Button onClick={reset} className="mt-4">
        Reintentar
      </Button>
    </div>
  );
}
