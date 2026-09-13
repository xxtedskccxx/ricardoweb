"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/productos", label: "Productos" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación del panel" className="mt-5 overflow-x-auto lg:mt-10">
      <div className="flex min-w-max gap-1 lg:flex-col">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "group flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-[background-color,color,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                active
                  ? "bg-[var(--color-olive)] text-[var(--color-ivory)] shadow-[0_8px_18px_rgba(36,64,44,.12)]"
                  : "text-[var(--color-ink-muted)] hover:-translate-y-px hover:bg-[var(--color-bone)] hover:text-[var(--color-ink)]",
              ].join(" ")}
              >
              <span
                aria-hidden="true"
                className={[
                  "h-2 w-2 shrink-0 rounded-full transition-colors",
                  active
                    ? "bg-[var(--color-sand-soft)]"
                    : "bg-[var(--color-border-strong)] group-hover:bg-[var(--color-olive)]",
                ].join(" ")}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
