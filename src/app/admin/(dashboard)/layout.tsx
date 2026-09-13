import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin, UnauthorizedError } from "@/server/auth";
import { logoutAdmin } from "@/server/actions/auth";
import { siteConfig } from "@/config/site";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { template: `%s - Admin - ${siteConfig.name}`, default: "Admin" },
  robots: { index: false, follow: false },
};

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
      <aside className="flex shrink-0 flex-col border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 shadow-[var(--shadow-sm)] lg:sticky lg:top-0 lg:h-svh lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link href="/admin" className="group inline-flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-olive)] text-sm font-semibold text-[var(--color-ivory)] transition-transform duration-[var(--duration-fast)] group-hover:scale-105">
              A
            </span>
            <span>
              <span className="block font-display text-lg leading-none text-[var(--color-ink)]">
                {siteConfig.name}
              </span>
              <span className="mt-1 block text-xs text-[var(--color-ink-muted)]">
                Administración
              </span>
            </span>
          </Link>
          <span className="rounded-[var(--radius-pill)] bg-[var(--color-bone)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)] lg:mt-5 lg:inline-flex">
            Admin
          </span>
        </div>

        <AdminNav />

        <div className="mt-5 hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bone)]/70 p-3 lg:block">
          <p className="text-xs font-medium text-[var(--color-ink)]">Tu inventario</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
            Edita productos, fotos y estados desde aquí.
          </p>
        </div>

        <form action={logoutAdmin} className="mt-4 lg:mt-auto lg:pt-4">
          <button
            type="submit"
            className="min-h-11 w-full rounded-[var(--radius-md)] px-3 py-2 text-left text-sm font-medium text-[var(--color-ink-muted)] transition-[background-color,color] duration-[var(--duration-fast)] hover:bg-[var(--color-bone)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/30"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
