import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { LinkButton } from "@/components/ui/Button";

interface ContactCardProps {
  productTitle: string;
  productUrl: string;
}

export function ContactCard({ productTitle, productUrl }: ContactCardProps) {
  const { whatsappNumber, phone, email } = siteConfig.contact;
  const hasAnyContact = Boolean(whatsappNumber || phone || email);

  if (!hasAnyContact) return null;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
      <h2 className="font-display text-lg text-[var(--color-ink)]">
        Contactar
      </h2>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Escribe directamente, sin intermediarios.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {whatsappNumber && (
          <LinkButton
            href={buildWhatsAppUrl(whatsappNumber, productTitle, productUrl)}
            external
            className="w-full"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-1.4-.7-2.3-1.2-3.2-2.8-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.5-.3Z" />
            </svg>
            Escribir por WhatsApp
          </LinkButton>
        )}
        {phone && (
          <LinkButton href={`tel:${phone}`} variant="secondary" className="w-full">
            Llamar
          </LinkButton>
        )}
        {email && (
          <LinkButton
            href={`mailto:${email}?subject=${encodeURIComponent(`Interés en "${productTitle}"`)}`}
            variant="secondary"
            className="w-full"
          >
            Enviar un correo
          </LinkButton>
        )}
      </div>
    </div>
  );
}
