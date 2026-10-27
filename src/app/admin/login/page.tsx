import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-sand-text)]">
            {siteConfig.name}
          </p>
          <h1 className="mt-1 font-display text-2xl text-[var(--color-ink)]">
            Iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Entra para agregar o editar tus publicaciones.
          </p>

          <div className="mt-6">
            <LoginForm next={next ?? "/admin"} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
