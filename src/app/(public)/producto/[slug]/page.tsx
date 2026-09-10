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
import { formatPrice } from "@/lib/money";
import { siteConfig } from "@/config/site";
import { getProductBySlug, getRelatedProducts } from "@/server/queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
  const url = `${siteConfig.url}/producto/${product.slug}`;
  const description =
    product.shortDescription ?? product.description?.slice(0, 160) ?? "";
  const cover = product.images[0];

  return {
    title: product.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.title,
      description,
      url,
      type: "website",
      images: cover
        ? [
            {
              url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1200,h_630,c_fill,g_auto/${cover.publicId}`,
              width: 1200,
              height: 630,
            },
          ]
        : [],
    },
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
  const related = await getRelatedProducts(product.id, product.type, 3);
  const productUrl = `${siteConfig.url}/producto/${product.slug}`;

  const structuredData =
    product.priceMode !== "CONTACT" && product.price !== null
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.shortDescription ?? product.description ?? "",
          image: product.images.map(
            (img) =>
              `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${img.publicId}`,
          ),
          offers: {
            "@type": "Offer",
            priceCurrency: product.currency,
            price: product.price,
            availability:
              OFFER_AVAILABILITY[product.status] ??
              "https://schema.org/InStock",
            url: productUrl,
          },
        }
      : null;

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-12">
      {structuredData && (
        // eslint-disable-next-line react/no-danger -- static JSON-LD we construct ourselves, no user HTML.
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

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

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Gallery images={product.images} productTitle={product.title} />

          <div className="mt-10">
            <h2 className="font-display text-xl text-[var(--color-ink)]">
              Descripción
            </h2>
            <p className="mt-3 whitespace-pre-line text-[var(--color-ink-muted)]">
              {product.description || "Sin descripción disponible."}
            </p>
          </div>

          <div className="mt-10">
            <SpecsList attributes={product.attributes} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <TypeBadge type={product.type} />
            <StatusBadge status={product.status} />
          </div>

          <h1 className="font-display text-3xl leading-tight text-[var(--color-ink)]">
            {product.title}
          </h1>

          {product.location && (
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

          <p className="font-display text-2xl text-[var(--color-ink)]">
            {formatPrice(product.price, product.currency, product.priceMode)}
          </p>

          <ContactCard productTitle={product.title} productUrl={productUrl} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-[var(--color-border)] pt-10">
          <h2 className="font-display text-2xl text-[var(--color-ink)]">
            Más productos
          </h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}

      <div className="lg:hidden">
        <StickyMobileContact productTitle={product.title} productUrl={productUrl} />
      </div>
    </div>
  );
}
