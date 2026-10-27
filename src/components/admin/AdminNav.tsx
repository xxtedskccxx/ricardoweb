"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Mis productos" },
  { href: "/admin/productos/nuevo", label: "+ Nuevo" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administración" className="min-w-0 sm:flex-1">
      <div className="grid grid-cols-3 items-center gap-1 sm:flex">
        <span className="hidden px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-sand-text)] sm:inline">
          Admin
        </span>
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin/productos"
              ? pathname.startsWith(item.href) && pathname !== "/admin/productos/nuevo"
              : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-h-11 items-center justify-center whitespace-nowrap rounded-[var(--radius-pill)] px-2 text-sm sm:px-4 font-medium transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                active
                  ? "bg-[var(--color-olive)] text-[var(--color-ivory)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-bone)] hover:text-[var(--color-ink)]",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
