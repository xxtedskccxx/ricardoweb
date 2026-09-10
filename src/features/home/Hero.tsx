import { LinkButton } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

/**
 * No owner photography exists yet in this environment (Cloudinary is not
 * configured). Rather than reference a placeholder image file — which
 * would render broken or read as fake content — the hero uses a crafted
 * gradient in the brand palette. Swap in a real photo via CSS background
 * or an <Image> once the owner uploads one.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[70vh] min-h-[480px] w-full sm:h-[80vh] sm:min-h-[560px]">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 85% 20%, #d9cba3 0%, #b9a877 22%, #6f7d5c 48%, #24402c 78%, #17281b 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[var(--color-ivory)] via-[var(--color-ivory)]/55 to-transparent sm:via-[var(--color-ivory)]/25"
        />

        <div className="relative mx-auto flex h-full max-w-[var(--container-max)] items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-sand-text)]">
              {siteConfig.country}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.1] text-[var(--color-ink)] sm:text-5xl">
              Propiedades, vehículos y artículos únicos, en un solo lugar.
            </h1>
            <p className="mt-4 max-w-md text-base text-[var(--color-ink-muted)]">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/en-venta" size="lg">
                Ver lo disponible
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
