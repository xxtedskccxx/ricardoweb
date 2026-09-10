import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-sand-text)]">
        Error 404
      </p>
      <h1 className="font-display text-3xl text-[var(--color-ink)]">
        No encontramos esta página
      </h1>
      <p className="max-w-md text-[var(--color-ink-muted)]">
        Puede que el artículo ya no esté disponible o que el enlace sea
        incorrecto.
      </p>
      <div className="mt-4 flex gap-3">
        <LinkButton href="/en-venta">Ver la colección</LinkButton>
        <Link
          href="/"
          className="flex items-center px-4 text-sm font-medium text-[var(--color-ink)] hover:underline"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
