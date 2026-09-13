/**
 * Single source of truth for brand identity and contact information.
 * Changing the brand name, logo, or contact channels happens here only —
 * no component may hard-code these values independently.
 */

export const siteConfig = {
  name: "Altamar",
  tagline: "Colección personal",
  description:
    "Aquí publico propiedades, vehículos y piezas de mi colección en República Dominicana. Si algo te interesa, escríbeme y te cuento más.",
  heroDescription:
    "La selección cambia. Revisa cada publicación para ver precio, ubicación y cómo contactarme.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "es-DO",
  country: "República Dominicana",

  nav: [
    { label: "Inicio", href: "/" as const },
    { label: "En venta", href: "/en-venta" as const },
  ],

  contact: {
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
    instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  },

  defaultCurrency: "USD" as const,

  /** Cloudinary public_id for the homepage hero background photo. */
  heroImagePublicId: "local:hero",
} as const;

export type SiteConfig = typeof siteConfig;
