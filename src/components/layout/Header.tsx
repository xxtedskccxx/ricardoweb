import Link from "next/link";
import { siteConfig } from "@/config/site";
import { hasAdminSessionCookie } from "@/server/auth";
import { SearchForm } from "./SearchForm";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const isAdmin = await hasAdminSessionCookie();

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 max-w-[var(--container-max)] items-center gap-4 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-ivory)]/88 px-4 shadow-[var(--shadow-sm)] backdrop-blur-md sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-olive)] text-[var(--color-ivory)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M3 18 9 8l4 6 3-4 5 8H3Z" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-medium text-[var(--color-ink)]">
              {siteConfig.name}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-sand-text)]">
              {siteConfig.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius-pill)] px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-bone)] hover:text-[var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <SearchForm id="site-search-desktop" className="ml-auto hidden max-w-xs flex-1 sm:block" />

        <Link
          href={isAdmin ? "/admin" : "/admin/login"}
          className={[
            "ml-auto hidden shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-[background-color,color,opacity] sm:ml-0 lg:inline-flex",
            isAdmin
              ? "bg-[var(--color-olive)] text-[var(--color-ivory)] hover:opacity-90"
              : "border border-[var(--color-border-strong)] text-[var(--color-ink-muted)] hover:bg-[var(--color-bone)] hover:text-[var(--color-ink)]",
          ].join(" ")}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
          </svg>
          Admin
        </Link>

        <MobileNav isAdmin={isAdmin} />
      </div>
    </header>
  );
}
