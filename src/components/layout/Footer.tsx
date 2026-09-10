import Link from "next/link";
import { siteConfig } from "@/config/site";

const YEAR = new Date().getFullYear();

export function Footer() {
  const socialLinks = [
    siteConfig.contact.instagramUrl && {
      label: "Instagram",
      href: siteConfig.contact.instagramUrl,
    },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-ivory)]">
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-olive)] text-[var(--color-ivory)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M3 18 9 8l4 6 3-4 5 8H3Z" />
            </svg>
          </span>
          <span className="font-display text-base font-medium text-[var(--color-ink)]">
            {siteConfig.name}
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--color-ink-muted)]">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[var(--color-ink)]">
              {item.label}
            </Link>
          ))}
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-ink)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-sm text-[var(--color-ink-muted)]">
          © {YEAR} {siteConfig.name}. {siteConfig.country}.
        </p>
      </div>
    </footer>
  );
}
