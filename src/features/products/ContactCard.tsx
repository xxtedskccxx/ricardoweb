import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { LinkButton } from "@/components/ui/Button";

interface ContactCardProps {
  productTitle: string;
  productUrl: string;
}

export function ContactCard({
  productTitle,
  productUrl,
}: ContactCardProps) {
  const { whatsappNumber, phone, email } = siteConfig.contact;
  const hasAnyContact = Boolean(whatsappNumber || phone || email);

  if (!hasAnyContact) return null;

  return (
    <aside className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
      <h2 className="font-display text-2xl text-[var(--color-ink)]">
        Hablar sobre esta publicación
      </h2>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Escríbeme para confirmar disponibilidad y pedir cualquier detalle.
      </p>

      <div className="mt-5 flex items-center gap-3 border-b border-[var(--color-border)] pb-5">
        <span
          className="grid h-14 w-14 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-sand-soft)] font-display text-xl text-[var(--color-olive)]"
          aria-hidden="true"
        >
          {siteConfig.owner.name.charAt(0)}
        </span>
        <span>
          <strong className="block text-sm">{siteConfig.owner.name}</strong>
          <span className="text-xs text-[var(--color-ink-muted)]">
            {siteConfig.owner.note}
          </span>
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {whatsappNumber && (
          <LinkButton
            href={buildWhatsAppUrl(whatsappNumber, productTitle, productUrl)}
            external
            className="w-full justify-between"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-1.4-.7-2.3-1.2-3.2-2.8-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.5-.3Z" />
            </svg>
            Escribir por WhatsApp <span aria-hidden="true">→</span>
          </LinkButton>
        )}
        {phone && (
          <LinkButton
            href={`tel:${phone}`}
            variant="secondary"
            className="w-full justify-between"
          >
            Llamar <span aria-hidden="true">→</span>
          </LinkButton>
        )}
        {email && (
          <LinkButton
            href={`mailto:${email}?subject=${encodeURIComponent(`Interés en "${productTitle}"`)}`}
            variant="secondary"
            className="w-full justify-between"
          >
            Enviar un correo <span aria-hidden="true">→</span>
          </LinkButton>
        )}
      </div>
      <p className="mt-4 flex items-center gap-2 text-[11px] text-[var(--color-ink-muted)]">
        <span aria-hidden="true">▣</span> Hablas directamente con{" "}
        {siteConfig.owner.name}, sin intermediarios.
      </p>
    </aside>
  );
}
