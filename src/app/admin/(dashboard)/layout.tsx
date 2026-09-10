import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin, UnauthorizedError } from "@/server/auth";
import { logoutAdmin } from "@/server/actions/auth";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { template: `%s — Admin — ${siteConfig.name}`, default: "Admin" },
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/productos", label: "Productos" },
];

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Real security boundary — middleware's redirect is UX only. This is
  // what actually protects every page and query under /admin.
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/admin/login");
    }
    throw error;
  }

  return (
    <div className="flex min-h-svh flex-col bg-[var(--color-bone)] lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-1 border-b border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:w-56 lg:border-b-0 lg:border-r">
        <div className="mb-4 px-2">
          <span className="font-display text-lg text-[var(--color-ink)]">
            {siteConfig.name}
          </span>
          <p className="text-xs text-[var(--color-ink-muted)]">Admin</p>
        </div>

        <nav className="flex gap-1 lg:flex-col">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className="min-h-[44px] rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-bone)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={logoutAdmin} className="mt-auto pt-4">
          <button
            type="submit"
            className="min-h-[44px] w-full rounded-[var(--radius-md)] px-3 py-2 text-left text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-bone)]"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
