import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SearchForm } from "./SearchForm";
import { MobileNav } from "./MobileNav";

export function Header() {
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

        <MobileNav />
      </div>
    </header>
  );
}
