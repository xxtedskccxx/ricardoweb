/*
  DESIGN TOKENS
  -----------------------------------------
  Background:   #FAF8F4  Surface: #FFFFFF  Primary: #24402C
  Text:         #1C2A24  Text Muted: #5B665F  Border: rgba(28,42,36,.1)

  TYPOGRAPHY
  -----------------------------------------
  Display/Headline: system serif / 500  Body/Caption: system sans / 400–500

  STYLE DECISION
  -----------------------------------------
  Style: editorial Caribbean luxury; Mood: warm, quiet, direct
  Anti-patterns to avoid: heavy gradients, glossy cards, center-everything layouts
*/

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Gallery } from "@/features/products/Gallery";
import { SpecsList } from "@/features/products/SpecsList";
import { ContactCard } from "@/features/products/ContactCard";
import { StickyMobileContact } from "@/features/products/StickyMobileContact";
import { ProductGrid } from "@/features/products/ProductGrid";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageTransition } from "@/components/motion/Reveal";
import { formatPrice } from "@/lib/money";
import { siteConfig } from "@/config/site";
import { getProductBySlug, getRelatedProducts } from "@/server/queries";
import { hasAdminSessionCookie } from "@/server/auth";
import {
  absoluteUrl,
  getPublicImageUrl,
  serializeJsonLd,
  toMetaDescription,
} from "@/lib/seo";
import {
  getDetailHighlights,
} from "@/features/products/detail-presenters";
import { getPropertySectionTitle } from "@/lib/product-presentation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

async function resolveProduct(slug: string) {
  const result = await getProductBySlug(slug);
  if (result.kind === "redirect") {
    permanentRedirect(`/producto/${result.currentSlug}`);
  }
  if (result.kind === "not-found") {
    notFound();
  }
  return result.product;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);
  if (result.kind !== "found") return {};

  const { product } = result;
  const url = absoluteUrl(`/producto/${product.slug}`);
  const description = toMetaDescription(
    product.shortDescription ?? product.description,
    `${product.title} — ${product.type} disponible en ${siteConfig.country}.`,
  );
  const cover = product.images[0];
  const imageUrl = getPublicImageUrl(
    cover?.publicId,
    product.type,
    product.title,
  );

  return {
    title: product.title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: product.title,
      description,
      url,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: { card: "summary_large_image", title: product.title, description, images: [imageUrl] },
  };
}

const OFFER_AVAILABILITY: Record<string, string> = {
  AVAILABLE: "https://schema.org/InStock",
  RESERVED: "https://schema.org/LimitedAvailability",
  SOLD: "https://schema.org/SoldOut",
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await resolveProduct(slug);
  const [related, isAdmin] = await Promise.all([
    getRelatedProducts(product.id, product.type, 3),
    hasAdminSessionCookie(),
  ]);
  const productUrl = absoluteUrl(`/producto/${product.slug}`);
  const highlights = getDetailHighlights(product.attributes);
  const hasCoordinates = product.locationLatitude !== null && product.locationLongitude !== null;
  const hasPublicLocation = product.showLocation && Boolean(product.location || hasCoordinates);
  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${product.locationLatitude}&mlon=${product.locationLongitude}#map=14/${product.locationLatitude}/${product.locationLongitude}`
    : product.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(product.location)}`
      : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.title,
    description: toMetaDescription(
      product.shortDescription ?? product.description,
      `${product.title} — ${product.type} disponible en ${siteConfig.country}.`,
    ),
    category: product.type,
    image: product.images.length
      ? product.images.map((img) =>
          getPublicImageUrl(img.publicId, product.type, product.title),
        )
      : [getPublicImageUrl(null, product.type, product.title)],
    url: productUrl,
    offers:
      product.priceMode !== "CONTACT" && product.price !== null
        ? {
            "@type": "Offer",
            priceCurrency: product.currency,
            price: product.price,
            availability:
              OFFER_AVAILABILITY[product.status] ??
              "https://schema.org/InStock",
            url: productUrl,
          }
        : undefined,
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-[var(--container-max)] px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />

      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-[var(--color-ink-muted)]">
        <Link href="/" className="hover:text-[var(--color-ink)]">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/en-venta" className="hover:text-[var(--color-ink)]">
          En venta
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-ink)]">{product.title}</span>
      </nav>

      {isAdmin && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--color-ink-muted)]">
            Estás viendo tu publicación como la ven los compradores.
          </p>
          <Link
            href={`/admin/productos/${product.id}`}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-[var(--color-olive)] px-5 text-sm font-medium text-[var(--color-ivory)] transition-opacity hover:opacity-90"
          >
            Editar publicación
          </Link>
        </div>
      )}

      {/* Mobile order: photos → title/price/contact → description. On desktop
          the summary column spans both rows on the right and stays sticky. */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-0">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <Gallery images={product.images} productTitle={product.title} productType={product.type} />
        </div>

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="flex items-center justify-between gap-2">
            <TypeBadge type={product.type} />
            <StatusBadge status={product.status} />
          </div>

          <h1 className="font-display text-4xl leading-[1.05] text-[var(--color-ink)] lg:text-5xl">
            {product.title}
          </h1>

          {hasPublicLocation && product.location && (
            <p className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {product.location}
            </p>
          )}

          <p className="font-display text-3xl text-[var(--color-ink)]">
            {formatPrice(product.price, product.currency, product.priceMode)}
          </p>

          {highlights.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-y border-[var(--color-border)] py-5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {highlights.map((item) => (
                <div key={item.icon} className="flex items-center gap-2 text-sm">
                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-olive)]" />
                  <dt className="sr-only">{item.label}</dt>
                  <dd className="whitespace-nowrap text-[var(--color-ink-muted)]"><strong className="font-medium text-[var(--color-ink)]">{item.value}</strong> {item.label}</dd>
                </div>
              ))}
            </dl>
          )}

          {product.shortDescription && (
            <p className="border-b border-[var(--color-border)] pb-5 text-sm leading-6 text-[var(--color-ink-muted)]">
              {product.shortDescription}
            </p>
          )}

          <ContactCard
            productTitle={product.title}
            productUrl={productUrl}
          />
          {hasPublicLocation && (
            <section
              id="ubicacion"
              aria-label="Mapa de ubicación"
              className="scroll-mt-28 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bone)]"
            >
              {hasCoordinates ? (
                <iframe
                  title="Mapa de ubicación aproximada"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${product.locationLongitude! - 0.03}%2C${product.locationLatitude! - 0.03}%2C${product.locationLongitude! + 0.03}%2C${product.locationLatitude! + 0.03}&layer=mapnik&marker=${product.locationLatitude}%2C${product.locationLongitude}`}
                  className="h-56 w-full border-0 sm:h-64"
                  loading="lazy"
                />
              ) : (
                <div className="flex min-h-44 items-center justify-center p-5 text-center text-sm text-[var(--color-ink-muted)]">
                  <p>Mapa disponible al abrir la zona indicada.</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:px-5">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-sand-text)]">Ubicación aproximada</p>
                  {product.location && <strong className="mt-1 block truncate text-base font-medium text-[var(--color-ink)]">{product.location}</strong>}
                </div>
                {mapUrl && <a className="shrink-0 text-sm font-medium text-[var(--color-olive)] hover:underline" href={mapUrl} target="_blank" rel="noopener noreferrer">Abrir mapa ↗</a>}
              </div>
            </section>
          )}
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <nav
            role="tablist"
            aria-label="Secciones de la propiedad"
            className="mt-7 flex gap-7 overflow-x-auto border-b border-[var(--color-border)] text-sm text-[var(--color-ink-muted)]"
          >
            <a
              id="tab-descripcion"
              role="tab"
              aria-selected="true"
              aria-controls="descripcion"
              href="#descripcion"
              className="shrink-0 border-b-2 border-[var(--color-olive)] pb-3 font-medium text-[var(--color-olive)]"
            >
              Descripción
            </a>
            <a
              id="tab-especificaciones"
              role="tab"
              aria-selected="false"
              aria-controls="especificaciones"
              href="#especificaciones"
              className="shrink-0 pb-3 hover:text-[var(--color-ink)]"
            >
              Especificaciones
            </a>
            {hasPublicLocation && (
              <a
                id="tab-ubicacion"
                role="tab"
                aria-selected="false"
                aria-controls="ubicacion"
                href="#ubicacion"
                className="shrink-0 pb-3 hover:text-[var(--color-ink)]"
              >
                Ubicación
              </a>
            )}
          </nav>

          <section id="descripcion" role="tabpanel" aria-labelledby="tab-descripcion" className="scroll-mt-28 pt-8">
            <h2 className="max-w-xl font-display text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl">
              {product.shortDescription || product.title}
            </h2>
            <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-[var(--color-ink-muted)]">
              {product.description || "Sin descripción disponible."}
            </p>
          </section>

          <section id="especificaciones" role="tabpanel" aria-labelledby="tab-especificaciones" className="scroll-mt-28 pt-10">
            <SpecsList attributes={product.attributes} />
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-[var(--color-border)] pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl text-[var(--color-ink)]">{getPropertySectionTitle(product.type)}</h2>
            <Link href="/en-venta" className="shrink-0 text-sm font-medium text-[var(--color-olive)] hover:underline">Ver más →</Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={related} priorityCount={0} />
          </div>
        </section>
      )}

      <div className="lg:hidden">
        <StickyMobileContact productTitle={product.title} productUrl={productUrl} />
      </div>
      </div>
    </PageTransition>
  );
}
