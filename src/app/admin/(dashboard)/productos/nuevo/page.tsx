import { ProductForm } from "@/features/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-[var(--color-ink)]">
          Crear producto
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Se guardará como borrador. Podrás subir imágenes y publicar
          después de crearlo.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
