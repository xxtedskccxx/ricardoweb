import { Hero } from "@/features/home/Hero";
import { ProductGrid } from "@/features/products/ProductGrid";
import { LinkButton } from "@/components/ui/Button";
import { getHomepageProducts } from "@/server/queries";
import { siteConfig } from "@/config/site";

export default async function HomePage() {
  const products = await getHomepageProducts(6);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-[var(--container-max)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-2 pb-10">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-sand-text)]">
            Disponible ahora
          </p>
          <h2 className="font-display text-3xl text-[var(--color-ink)]">
            En venta
          </h2>
          <p className="max-w-lg text-[var(--color-ink-muted)]">
            Propiedades, vehículos, relojes y otras piezas que estoy ofreciendo
            en República Dominicana.
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <ProductGrid products={products} priorityCount={0} />
            <div className="mt-10 flex justify-center">
              <LinkButton href="/en-venta" variant="secondary">
                Ver todo el catálogo
              </LinkButton>
            </div>
          </>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <p className="text-[var(--color-ink-muted)]">
              Aún no hay artículos publicados. Vuelve pronto.
            </p>
          </div>
        )}
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-bone)]">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-col items-start gap-4 px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            ¿Te interesa alguna publicación?
          </h2>
          <p className="max-w-md text-[var(--color-ink-muted)]">
            Escríbeme y te comparto los detalles de la pieza que te interesa.
          </p>
          <div className="flex flex-wrap gap-3">
            {siteConfig.contact.whatsappNumber && (
              <LinkButton
                href={`https://wa.me/${siteConfig.contact.whatsappNumber}`}
                external
              >
                Escribir por WhatsApp
              </LinkButton>
            )}
            {siteConfig.contact.phone && (
              <LinkButton
                href={`tel:${siteConfig.contact.phone}`}
                variant="secondary"
              >
                Llamar
              </LinkButton>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
