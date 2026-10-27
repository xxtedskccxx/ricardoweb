"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { siteConfig } from "@/config/site";
import { SearchForm } from "./SearchForm";

export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const reduceMotion = useReducedMotion();
  // false during SSR and hydration, true afterwards — portals need <body>.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          "a, button, input",
        );
        const list = Array.from(focusable);
        const first = list[0];
        const last = list[list.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink)]"
        aria-label="Abrir menú"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Portal to <body>: the header's backdrop-filter makes it the containing
          block for fixed descendants, which would trap this overlay inside
          the header bar instead of covering the screen. */}
      {mounted && createPortal(
      <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col bg-[var(--color-ivory)] p-6"
        >
          <div className="flex items-center justify-between">
            <span
              id={headingId}
              className="font-display text-lg font-medium text-[var(--color-ink)]"
            >
              {siteConfig.name}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink)]"
              aria-label="Cerrar menú"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <SearchForm id="site-search-mobile" className="mt-6" />

          <nav className="mt-8 flex flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="min-h-[44px] rounded-[var(--radius-md)] px-3 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-[var(--color-bone)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={isAdmin ? "/admin" : "/admin/login"}
              onClick={() => setOpen(false)}
              className={[
                "mt-2 min-h-[44px] rounded-[var(--radius-md)] px-3 py-3 text-base font-medium",
                isAdmin
                  ? "bg-[var(--color-olive)] text-[var(--color-ivory)]"
                  : "border border-[var(--color-border-strong)] text-[var(--color-ink)]",
              ].join(" ")}
            >
              Admin
            </Link>
          </nav>
        </motion.div>
      )}
      </AnimatePresence>,
      document.body,
      )}
    </div>
  );
}
