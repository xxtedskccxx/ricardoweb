"use client";

import { useActionState, useEffect, useRef } from "react";
import { changeAdminPassword } from "@/server/actions/auth";
import { Button } from "@/components/ui/Button";

const FIELDS = [
  { name: "current", label: "Contraseña actual", autoComplete: "current-password" },
  { name: "next", label: "Nueva contraseña", autoComplete: "new-password", hint: "Mínimo 12 caracteres. Una frase corta es fácil de recordar y difícil de adivinar." },
  { name: "confirm", label: "Repite la nueva contraseña", autoComplete: "new-password" },
] as const;

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeAdminPassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {FIELDS.map((field) => (
        <div key={field.name} className="flex flex-col gap-1">
          <label htmlFor={field.name} className="text-sm font-medium text-[var(--color-ink)]">
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type="password"
            required
            autoComplete={field.autoComplete}
            minLength={field.name === "current" ? undefined : 12}
            aria-describedby={"hint" in field ? `${field.name}-hint` : undefined}
            className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm"
          />
          {"hint" in field && (
            <p id={`${field.name}-hint`} className="text-xs text-[var(--color-ink-muted)]">
              {field.hint}
            </p>
          )}
        </div>
      ))}

      {state?.error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="text-sm font-medium text-[var(--color-available)]">
          Listo, tu contraseña se cambió. Úsala la próxima vez que entres.
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 self-start">
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
