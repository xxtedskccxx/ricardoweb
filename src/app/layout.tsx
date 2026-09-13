import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import {
  absoluteUrl,
  serializeJsonLd,
  siteStructuredData,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Altamar | Propiedades y piezas en República Dominicana",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: { canonical: absoluteUrl("/") },
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "es_DO",
    siteName: siteConfig.name,
    title: "Altamar | Propiedades y piezas en República Dominicana",
    description: siteConfig.description,
    url: absoluteUrl("/"),
    images: [
      {
        url: absoluteUrl("/images/altamar/hero.webp"),
        width: 1200,
        height: 630,
        alt: "Altamar — colección personal en República Dominicana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Altamar | Propiedades y piezas en República Dominicana",
    description: siteConfig.description,
    images: [absoluteUrl("/images/altamar/hero.webp")],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className="h-full"
    >
      <body className="flex min-h-full flex-col bg-[var(--color-ivory)] text-[var(--color-ink)] antialiased no-overflow-guard">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteStructuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
