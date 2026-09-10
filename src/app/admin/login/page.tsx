import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[var(--color-bone)] px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-sand)]">
          {siteConfig.name}
        </p>
        <h1 className="mt-1 font-display text-2xl text-[var(--color-ink)]">
          Acceso administrador
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Solo cuentas autorizadas.
        </p>

        <div className="mt-6">
          <LoginForm next={next ?? "/admin"} />
        </div>
      </div>
    </div>
  );
}
