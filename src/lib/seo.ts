import { siteConfig } from "@/config/site";
import { isLocalMediaId, localProductImageSrc } from "@/lib/local-media";

const MAX_DESCRIPTION_LENGTH = 160;
const DEFAULT_SOCIAL_IMAGE = "/images/altamar/hero.webp";

/** Returns an absolute URL using the public site origin from the environment. */
export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

/**
 * Normalizes metadata copy so snippets do not contain layout whitespace or
 * end halfway through a word. The ellipsis is intentional and stays readable
 * when a product description is longer than a search snippet.
 */
export function toMetaDescription(
  value: string | null | undefined,
  fallback: string = siteConfig.description,
) {
  const clean = (value || fallback).replace(/\s+/g, " ").trim();
  if (clean.length <= MAX_DESCRIPTION_LENGTH) return clean;

  const shortened = clean
    .slice(0, MAX_DESCRIPTION_LENGTH - 1)
    .replace(/\s+\S*$/, "")
    .trim();

  return `${shortened}…`;
}

/** Resolves local development media and Cloudinary media to crawlable URLs. */
export function getPublicImageUrl(
  publicId: string | null | undefined,
  productType?: string,
  productTitle?: string,
) {
  if (!publicId || isLocalMediaId(publicId)) {
    return absoluteUrl(localProductImageSrc(productType, productTitle));
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return absoluteUrl(DEFAULT_SOCIAL_IMAGE);

  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`;
}

/** Prevents user-provided product text from closing an application/json script. */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: siteConfig.name,
      url: absoluteUrl("/"),
      areaServed: siteConfig.country,
      ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: absoluteUrl("/"),
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: siteConfig.locale,
      publisher: { "@id": absoluteUrl("/#organization") },
    },
  ],
} as const;
