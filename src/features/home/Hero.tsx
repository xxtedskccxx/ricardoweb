import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { cardImageSrc } from "@/lib/cloudinary/image-src";
import { isLocalMediaId } from "@/lib/local-media";
import { Reveal } from "@/components/motion/Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[70vh] min-h-[480px] w-full sm:h-[80vh] sm:min-h-[560px]">
        <Image
          src={isLocalMediaId(siteConfig.heroImagePublicId) ? "/images/altamar/hero.webp" : cardImageSrc(siteConfig.heroImagePublicId)}
          alt=""
          fill
          priority
          loading="eager"
          unoptimized={isLocalMediaId(siteConfig.heroImagePublicId)}
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[var(--color-ivory)] via-[var(--color-ivory)]/90 to-[var(--color-ivory)]/60 sm:via-[var(--color-ivory)]/55 sm:to-transparent"
        />

        <div className="relative mx-auto flex h-full max-w-[var(--container-max)] items-center px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-sand-text)]">
              {siteConfig.country}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.1] text-[var(--color-ink)] sm:text-5xl">
              Propiedades, vehículos y piezas disponibles en República Dominicana.
            </h1>
            <p className="mt-4 max-w-md text-base text-[var(--color-ink-muted)]">
              {siteConfig.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/en-venta" size="lg">
                Ver lo disponible
              </LinkButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
