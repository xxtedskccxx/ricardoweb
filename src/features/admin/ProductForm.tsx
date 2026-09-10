"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createDraftProduct, updateProduct } from "@/server/actions/product";
import { AttributeEditor, type AttributeItem } from "./AttributeEditor";
import { Button } from "@/components/ui/Button";

export interface ProductFormValues {
  title: string;
  shortDescription: string;
  description: string;
  type: string;
  price: string;
  currency: "USD" | "DOP";
  priceMode: "FIXED" | "NEGOTIABLE" | "CONTACT";
  location: string;
  featured: boolean;
  attributes: AttributeItem[];
}

const EMPTY_VALUES: ProductFormValues = {
  title: "",
  shortDescription: "",
  description: "",
  type: "",
  price: "",
  currency: "USD",
  priceMode: "FIXED",
  location: "",
  featured: false,
  attributes: [],
};

interface ProductFormProps {
  productId?: string;
  initial?: ProductFormValues;
}

export function ProductForm({ productId, initial }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    initial ?? EMPTY_VALUES,
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaved(false);

    const formData = new FormData(event.currentTarget);
    const attributesRaw = String(formData.get("attributes") ?? "[]");
    let attributes: AttributeItem[] = [];
    try {
      attributes = JSON.parse(attributesRaw);
    } catch {
      attributes = [];
    }

    const input = {
      title: String(formData.get("title") ?? "").trim(),
      shortDescription: String(formData.get("shortDescription") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      type: String(formData.get("type") ?? "").trim(),
      price: formData.get("price") ? Number(formData.get("price")) : null,
      currency: String(formData.get("currency") ?? "USD") as "USD" | "DOP",
      priceMode: String(formData.get("priceMode") ?? "FIXED") as
        | "FIXED"
        | "NEGOTIABLE"
        | "CONTACT",
      location: String(formData.get("location") ?? "").trim() || null,
      featured: formData.get("featured") === "on",
      attributes: attributes.filter((a) => a.label.trim() && a.value.trim()),
    };

    startTransition(async () => {
      const result = productId
        ? await updateProduct(productId, input)
        : await createDraftProduct(input);

      if (!result.success) {
        setError(result.error ?? "No se pudo guardar.");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      if (!productId && "data" in result && result.data) {
        router.push(`/admin/productos/${result.data.id}`);
        return;
      }

      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg text-[var(--color-ink)]">
          Información básica
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Título" error={fieldErrors.title}>
            <input
              name="title"
              defaultValue={values.title}
              required
              minLength={3}
              maxLength={140}
              className={inputClass}
            />
          </Field>
          <Field label="Tipo" error={fieldErrors.type}>
            <input
              name="type"
              defaultValue={values.type}
              required
              placeholder="Villa, Vehículo, Reloj…"
              className={inputClass}
            />
          </Field>
          <Field label="Descripción corta" error={fieldErrors.shortDescription}>
            <input
              name="shortDescription"
              defaultValue={values.shortDescription}
              maxLength={200}
              className={inputClass}
            />
          </Field>
          <Field label="Descripción completa" error={fieldErrors.description}>
            <textarea
              name="description"
              defaultValue={values.description}
              rows={5}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg text-[var(--color-ink)]">
          Precio
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Modo">
            <select name="priceMode" defaultValue={values.priceMode} className={inputClass}>
              <option value="FIXED">Fijo</option>
              <option value="NEGOTIABLE">Negociable</option>
              <option value="CONTACT">A consultar</option>
            </select>
          </Field>
          <Field label="Precio" error={fieldErrors.price}>
            <input
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={values.price}
              className={inputClass}
            />
          </Field>
          <Field label="Moneda">
            <select name="currency" defaultValue={values.currency} className={inputClass}>
              <option value="USD">USD</option>
              <option value="DOP">DOP</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg text-[var(--color-ink)]">
          Ubicación
        </h2>
        <div className="mt-4">
          <Field label="Ubicación">
            <input
              name="location"
              defaultValue={values.location}
              placeholder="Punta Cana, La Altagracia"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg text-[var(--color-ink)]">
          Especificaciones
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Las primeras 3 aparecen en la tarjeta del producto.
        </p>
        <div className="mt-4">
          <AttributeEditor name="attributes" initial={values.attributes} />
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={values.featured}
            className="h-5 w-5"
          />
          Destacar en la página principal
        </label>
      </section>

      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-[var(--color-available)]">
          Guardado.
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando…" : productId ? "Guardar cambios" : "Crear borrador"}
      </Button>
    </form>
  );
}

const inputClass =
  "h-11 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-ink)]";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-[var(--color-ink)]">
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
    </div>
  );
}
