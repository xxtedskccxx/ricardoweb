"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  cloneElement,
  useId,
  useState,
  useTransition,
  type FormEvent,
  type ReactElement,
} from "react";
import { motion } from "motion/react";
import { PRODUCT_TYPE_REGISTRY, getProductTypeDefinition } from "@/config/product-types";
import { formatPrice } from "@/lib/money";
import { createDraftProduct, updateProduct } from "@/server/actions/product";
import { AttributeEditor, type AttributeItem } from "./AttributeEditor";
import { Button } from "@/components/ui/Button";
import { LocationPicker } from "@/components/admin/LocationPicker";

export interface ProductFormValues {
  title: string;
  shortDescription: string;
  description: string;
  type: string;
  price: string;
  currency: "USD" | "DOP";
  priceMode: "FIXED" | "NEGOTIABLE" | "CONTACT";
  location: string;
  showLocation: boolean;
  locationLatitude: number | null;
  locationLongitude: number | null;
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
  showLocation: false,
  locationLatitude: null,
  locationLongitude: null,
  featured: false,
  attributes: [],
};

interface ProductFormProps {
  productId?: string;
  initial?: ProductFormValues;
}

export function ProductForm({ productId, initial }: ProductFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<ProductFormValues>(() => {
    const source = initial ?? EMPTY_VALUES;
    return { ...source, attributes: source.attributes.slice() };
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const typeDefinition = getProductTypeDefinition(draft.type);
  const hasTitle = draft.title.trim().length >= 3;
  const hasType = draft.type.trim().length > 0;
  const hasPrice = draft.priceMode === "CONTACT" || Number(draft.price) > 0;

  function updateDraft<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  }

  function updateCoordinates(coordinates: { latitude: number; longitude: number }) {
    setDraft((previous) => ({
      ...previous,
      locationLatitude: coordinates.latitude,
      locationLongitude: coordinates.longitude,
    }));
    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      showLocation: formData.get("showLocation") === "yes",
      locationLatitude: String(formData.get("locationLatitude") ?? "").trim()
        ? Number(formData.get("locationLatitude"))
        : null,
      locationLongitude: String(formData.get("locationLongitude") ?? "").trim()
        ? Number(formData.get("locationLongitude"))
        : null,
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
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-w-0 flex-col gap-6"
      >
        {error && (
          <p role="alert" className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <section className={sectionClass}>
          <SectionHeading
            title="Información básica"
            eyebrow="Lo esencial"
            description="Empieza por los datos que alguien necesita para entenderlo rápido."
          />
          <div className="mt-6 flex flex-col gap-5">
            <Field label="Título" error={fieldErrors.title} hint="Pon un nombre descriptivo; evita frases promocionales." required>
              <input
                name="title"
                value={draft.title}
                onChange={(event) => updateDraft("title", event.target.value)}
                required
                minLength={3}
                maxLength={140}
                autoComplete="off"
                className={inputClass}
              />
            </Field>
            <Field label="Tipo" error={fieldErrors.type} hint="Elige una categoría para mostrar los campos más útiles." required>
              <input
                name="type"
                value={draft.type}
                onChange={(event) => updateDraft("type", event.target.value)}
                required
                placeholder="Villa, Vehículo, Reloj…"
                list="product-type-options"
                autoComplete="off"
                className={inputClass}
              />
            </Field>
            <datalist id="product-type-options">
              {PRODUCT_TYPE_REGISTRY.map((entry) => (
                <option key={entry.key} value={entry.label} />
              ))}
            </datalist>
            <div className="-mt-2 flex flex-wrap gap-2" aria-label="Categorías sugeridas">
              {PRODUCT_TYPE_REGISTRY.slice(0, 4).map((entry) => {
                const active = typeDefinition.key === entry.key;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => updateDraft("type", entry.label)}
                    className={`min-h-9 rounded-[var(--radius-pill)] border px-3 text-xs font-medium transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] active:scale-[0.98] ${
                      active
                        ? "border-[var(--color-olive)] bg-[var(--color-olive)] text-[var(--color-ivory)]"
                        : "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:border-[var(--color-olive)] hover:text-[var(--color-olive)]"
                    }`}
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>
            <Field label="Descripción corta" error={fieldErrors.shortDescription} hint="Resume lo esencial en una frase.">
              <input
                name="shortDescription"
                value={draft.shortDescription}
                onChange={(event) => updateDraft("shortDescription", event.target.value)}
                maxLength={200}
                className={inputClass}
              />
            </Field>
            <Field label="Descripción completa" error={fieldErrors.description} hint="Incluye estado, medidas, ubicación y cualquier detalle importante.">
              <textarea
                name="description"
                value={draft.description}
                onChange={(event) => updateDraft("description", event.target.value)}
                rows={6}
                className={`${inputClass} py-3 leading-relaxed`}
              />
            </Field>
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHeading
            title="Precio"
            eyebrow="Cómo se presenta"
            description="Define cómo quieres mostrar el precio en la publicación."
          />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Modo" hint="Así verá el precio quien visite la publicación.">
              <select
                name="priceMode"
                value={draft.priceMode}
                onChange={(event) => updateDraft("priceMode", event.target.value as ProductFormValues["priceMode"])}
                className={inputClass}
              >
                <option value="FIXED">Fijo</option>
                <option value="NEGOTIABLE">Negociable</option>
                <option value="CONTACT">A consultar</option>
              </select>
            </Field>
            {draft.priceMode === "CONTACT" ? (
              <div className="flex min-h-11 items-center rounded-[var(--radius-md)] bg-[var(--color-bone)] px-3 text-sm text-[var(--color-ink-muted)] sm:col-span-2">
                El precio se mostrará como «A consultar».
              </div>
            ) : (
              <>
                <Field label="Precio" error={fieldErrors.price} hint="Escribe solo el número; no hace falta añadir el símbolo.">
                  <input
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={draft.price}
                    onChange={(event) => updateDraft("price", event.target.value)}
                    inputMode="decimal"
                    className={inputClass}
                  />
                </Field>
                <Field label="Moneda">
                  <select
                    name="currency"
                    value={draft.currency}
                    onChange={(event) => updateDraft("currency", event.target.value as ProductFormValues["currency"])}
                    className={inputClass}
                  >
                    <option value="USD">USD</option>
                    <option value="DOP">DOP</option>
                  </select>
                </Field>
              </>
            )}
          </div>
          {draft.priceMode === "CONTACT" && <input type="hidden" name="price" value="" />}
          {draft.priceMode === "CONTACT" && <input type="hidden" name="currency" value={draft.currency} />}
        </section>

        <section className={sectionClass}>
          <SectionHeading
            title="Ubicación"
            eyebrow="Dónde está"
            description="Indica una zona y decide con calma si quieres enseñarla en el anuncio."
          />
          <div className="mt-6 flex flex-col gap-6">
            <Field label="Zona o referencia" hint="Escribe una ciudad, sector o punto cercano. No hace falta poner la dirección exacta.">
              <input
                name="location"
                value={draft.location}
                onChange={(event) => updateDraft("location", event.target.value)}
                placeholder="Punta Cana, La Altagracia"
                autoComplete="address-level2"
                className={inputClass}
              />
            </Field>

            <fieldset className="flex flex-col gap-3" aria-describedby="location-visibility-help">
              <legend className="text-sm font-medium text-[var(--color-ink)]">¿Quieres mostrar la ubicación?</legend>
              <p id="location-visibility-help" className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
                Si eliges «No», estos datos quedan solo para ti y nunca aparecen en la página pública.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="group relative flex min-h-16 cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4 transition-[border-color,background-color,box-shadow] duration-[var(--duration-fast)] has-[:checked]:border-[var(--color-olive)] has-[:checked]:bg-[var(--color-available-bg)] has-[:checked]:shadow-[var(--shadow-sm)]">
                  <input
                    type="radio"
                    name="showLocation"
                    value="yes"
                    checked={draft.showLocation}
                    onChange={() => updateDraft("showLocation", true)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-olive)]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[var(--color-ink)]">Sí, mostrarla</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--color-ink-muted)]">Ayuda a que las personas sepan dónde está.</span>
                  </span>
                </label>
                <label className="group relative flex min-h-16 cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4 transition-[border-color,background-color,box-shadow] duration-[var(--duration-fast)] has-[:checked]:border-[var(--color-olive)] has-[:checked]:bg-[var(--color-available-bg)] has-[:checked]:shadow-[var(--shadow-sm)]">
                  <input
                    type="radio"
                    name="showLocation"
                    value="no"
                    checked={!draft.showLocation}
                    onChange={() => updateDraft("showLocation", false)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-olive)]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[var(--color-ink)]">No, mantenerla privada</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--color-ink-muted)]">Solo la verás tú mientras editas.</span>
                  </span>
                </label>
              </div>
            </fieldset>

            {draft.showLocation && (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bone)]/60 p-4 sm:p-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-[var(--color-ink)]">Marca un punto aproximado</h3>
                  <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
                    Haz clic en el mapa para colocar el pin. Puedes moverlo; no es necesario señalar la dirección exacta.
                  </p>
                </div>
                <LocationPicker
                  value={draft.locationLatitude !== null && draft.locationLongitude !== null
                    ? { latitude: draft.locationLatitude, longitude: draft.locationLongitude }
                    : null}
                  onChange={updateCoordinates}
                />
                <p className="mt-3 text-xs text-[var(--color-ink-muted)]" aria-live="polite">
                  {draft.locationLatitude !== null && draft.locationLongitude !== null
                    ? "Punto guardado. Puedes moverlo cuando quieras."
                    : "Todavía no has elegido un punto; la zona escrita arriba seguirá siendo suficiente."}
                </p>
              </div>
            )}
            <input type="hidden" name="locationLatitude" value={draft.locationLatitude ?? ""} />
            <input type="hidden" name="locationLongitude" value={draft.locationLongitude ?? ""} />
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHeading
            title="Especificaciones"
            eyebrow="Qué lo hace especial"
            description="Añade los datos que ayudan a compararlo. Los tres primeros aparecen en la tarjeta."
          />
          <div className="mt-6">
            <AttributeEditor
              name="attributes"
              initial={draft.attributes}
              suggestions={typeDefinition.suggestedAttributes}
            />
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] p-1 text-sm text-[var(--color-ink)]">
            <input
              type="checkbox"
              name="featured"
              checked={draft.featured}
              onChange={(event) => updateDraft("featured", event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-olive)]"
            />
            <span>
              <span className="font-medium">Destacar en la página principal</span>
              <span className="mt-1 block text-xs leading-relaxed text-[var(--color-ink-muted)]">
                Aparecerá en la selección destacada cuando esté publicado.
              </span>
            </span>
          </label>
        </section>

        <div className="sticky bottom-4 z-20 -mx-1 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-3 shadow-[var(--shadow-md)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="px-1 text-xs text-[var(--color-ink-muted)]">
            <span className="block font-medium text-[var(--color-ink)]">
              {pending ? "Guardando cambios…" : saved ? "Cambios guardados" : productId ? "Los cambios se guardarán aquí" : "Se guardará como borrador"}
            </span>
            <span>{hasTitle && hasType && hasPrice ? "Ya tienes lo esencial para revisarlo." : "Completa lo esencial y podrás volver después."}</span>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            <Link
              href="/admin/productos"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] px-4 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-bone)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/30"
            >
              Cancelar
            </Link>
            <Button type="submit" disabled={pending} aria-busy={pending}>
              {pending ? "Guardando…" : productId ? "Guardar cambios" : "Crear borrador"}
            </Button>
          </div>
        </div>
      </motion.form>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-8">
        <section className="overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-ink)] p-5 text-[var(--color-ivory)] shadow-[var(--shadow-md)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-[var(--radius-pill)] border border-[var(--color-ivory)]/20 bg-[var(--color-ivory)]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--color-sand-soft)]">
              En edición
            </span>
            <span className="text-xs text-[var(--color-ivory)]/55">Vista previa</span>
          </div>
          <div className="mt-5 flex aspect-[4/3] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-ivory)]/10 bg-[var(--color-ivory)]/10">
            <span className="text-xs text-[var(--color-ivory)]/55">Las fotos se añaden después de guardar</span>
          </div>
          <div className="mt-5">
            <p className="font-display text-2xl leading-tight">
              {draft.title.trim() || "El producto aparecerá aquí"}
            </p>
            <p className="mt-2 text-sm text-[var(--color-ivory)]/60">
              {draft.type.trim() || "Tipo de producto"}
              {draft.location.trim() ? ` · ${draft.location.trim()}` : ""}
            </p>
            <p className="mt-5 text-lg font-medium text-[var(--color-sand)]">
              {draft.priceMode === "CONTACT" || !draft.price
                ? "Precio a consultar"
                : formatPrice(Number(draft.price), draft.currency, draft.priceMode)}
            </p>
          </div>
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <h2 className="font-display text-lg text-[var(--color-ink)]">Antes de publicar</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            <ChecklistItem label="Título" done={hasTitle} />
            <ChecklistItem label="Tipo" done={hasType} />
            <ChecklistItem label="Precio o “A consultar”" done={hasPrice} />
            <ChecklistItem label="Fotos" done={false} />
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-[var(--color-ink-muted)]">
            Guarda los detalles, añade imágenes y publica cuando todo esté listo.
          </p>
        </section>
      </aside>
    </div>
  );
}

function SectionHeading({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-olive)]">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-xl text-[var(--color-ink)]">{title}</h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--color-ink-muted)]">{description}</p>
    </div>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <li className="flex items-center gap-3 text-[var(--color-ink)]">
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${done ? "bg-[var(--color-available)]" : "border border-[var(--color-border-strong)] bg-[var(--color-bone)]"}`}
      />
      <span className={done ? "" : "text-[var(--color-ink-muted)]"}>{label}</span>
    </li>
  );
}

const sectionClass =
  "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-7";

const inputClass =
  "min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-ink)] transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)] placeholder:text-[var(--color-ink-muted)]/70 focus-visible:border-[var(--color-olive)] focus-visible:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-olive)]/20";

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactElement<Record<string, unknown>>;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-ink)]">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-[var(--color-olive)]">*</span>}
      </label>
      {cloneElement(children, {
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })}
      {hint && <p id={hintId} className="text-xs leading-relaxed text-[var(--color-ink-muted)]">{hint}</p>}
      {error && <span id={errorId} className="text-xs text-[var(--color-danger)]">{error}</span>}
    </div>
  );
}
