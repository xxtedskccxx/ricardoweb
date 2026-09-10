"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  publishProduct,
  setProductStatus,
} from "@/server/actions/product";
import { Button } from "@/components/ui/Button";

interface StatusControlsProps {
  productId: string;
  status: "DRAFT" | "AVAILABLE" | "RESERVED" | "SOLD";
}

export function StatusControls({ productId, status }: StatusControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "No se pudo actualizar el estado.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {status === "DRAFT" && (
          <Button
            type="button"
            disabled={pending}
            onClick={() => run(() => publishProduct(productId))}
          >
            Publicar
          </Button>
        )}
        {status !== "DRAFT" && (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => setProductStatus(productId, "unpublish"))}
          >
            Despublicar
          </Button>
        )}
        {status !== "AVAILABLE" && status !== "DRAFT" && (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => setProductStatus(productId, "available"))}
          >
            Marcar disponible
          </Button>
        )}
        {status !== "RESERVED" && status !== "DRAFT" && (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => setProductStatus(productId, "reserved"))}
          >
            Marcar reservado
          </Button>
        )}
        {status !== "SOLD" && status !== "DRAFT" && (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => setProductStatus(productId, "sold"))}
          >
            Marcar vendido
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
