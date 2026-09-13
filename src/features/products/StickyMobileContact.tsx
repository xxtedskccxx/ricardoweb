"use client";

import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface StickyMobileContactProps {
  productTitle: string;
  productUrl: string;
}

/** Appears only on small screens; reserves layout space so it never covers content underneath. */
export function StickyMobileContact({
  productTitle,
  productUrl,
}: StickyMobileContactProps) {
  const { whatsappNumber } = siteConfig.contact;
  if (!whatsappNumber) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
      <a
        href={buildWhatsAppUrl(whatsappNumber, productTitle, productUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-olive)] text-sm font-medium text-[var(--color-ivory)]"
      >
        Escribir por WhatsApp
      </a>
    </div>
  );
}
