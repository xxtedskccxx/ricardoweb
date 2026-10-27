import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const { admin } = await requireAdmin();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-sand-text)]">
          Mi cuenta
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-[-0.02em] text-[var(--color-ink)] sm:text-4xl">
          Tu acceso
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
          Entras con <strong className="font-medium text-[var(--color-ink)]">{admin.email}</strong>.
        </p>
      </header>

      <section
        aria-labelledby="password-heading"
        className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
      >
        <h2 id="password-heading" className="font-display text-2xl text-[var(--color-ink)]">
          Cambiar contraseña
        </h2>
        <div className="mt-5">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
