import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin, UnauthorizedError } from "@/server/auth";
import { logoutAdmin } from "@/server/actions/auth";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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

  // Same header/footer as the public site: the admin is a section of the
  // site, not a separate app.
  return (
    <>
      <Header />
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
          <AdminNav />
          <div className="flex items-center justify-end gap-1">
          <Link
            href="/admin/cuenta"
            className="flex min-h-11 items-center rounded-[var(--radius-pill)] px-4 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-bone)] hover:text-[var(--color-ink)]"
          >
            Mi cuenta
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="min-h-11 rounded-[var(--radius-pill)] px-4 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-bone)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/30"
            >
              Cerrar sesión
            </button>
          </form>
          </div>
        </div>
      </div>
      <main className="mx-auto w-full min-w-0 max-w-[var(--container-max)] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
      <Footer />
    </>
  );
}
