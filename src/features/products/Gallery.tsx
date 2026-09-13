"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { detailImageSrc } from "@/lib/cloudinary/image-src";
import { isLocalMediaId, localProductImageSrc } from "@/lib/local-media";
import type { ProductImageRow } from "@/server/queries";

interface GalleryProps {
  images: ProductImageRow[];
  productTitle: string;
  productType?: string;
}

export function Gallery({ images, productTitle, productType }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const activeIndexRef = useRef(activeIndex);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const goTo = useCallback(
    (index: number) => {
      const length = images.length || 1;
      setActiveIndex((index + length) % length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const opener = openButtonRef.current;
    lightboxRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") goTo(activeIndexRef.current + 1);
      if (event.key === "ArrowLeft") goTo(activeIndexRef.current - 1);
      if (event.key === "Tab" && lightboxRef.current) {
        const focusable = Array.from(
          lightboxRef.current.querySelectorAll<HTMLElement>("button, [tabindex]:not([tabindex='-1'])"),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (first && last) {
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      opener?.focus();
    };
  }, [lightboxOpen, goTo]);

  const media = images.length > 0 ? images : [{
    id: "local-cover",
    publicId: "local:cover",
    width: 4,
    height: 3,
    format: "png",
    alt: productTitle,
    position: 0,
  }];

  const active = media[activeIndex];
  if (!active) return null;

  return (
    <div>
      <div className="relative">
        <div
          className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bone)]"
        >
          <button
            ref={openButtonRef}
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 h-full w-full cursor-zoom-in"
            aria-label={`Ampliar imagen ${activeIndex + 1} de ${media.length}`}
          >
            <Image
              src={isLocalMediaId(active.publicId) ? localProductImageSrc(productType, productTitle) : detailImageSrc(active.publicId)}
              alt={active.alt ?? `${productTitle} - foto ${activeIndex + 1}`}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              preload={activeIndex === 0}
              fetchPriority={activeIndex === 0 ? "high" : undefined}
              loading={activeIndex === 0 ? "eager" : "lazy"}
              unoptimized={isLocalMediaId(active.publicId)}
              className="object-cover transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)] lg:hover:scale-[1.015]"
            />
          </button>

          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-surface)]/90 text-[var(--color-ink)] shadow-[var(--shadow-md)]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Foto siguiente"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-surface)]/90 text-[var(--color-ink)] shadow-[var(--shadow-md)]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
              <span className="absolute bottom-3 right-3 rounded-[var(--radius-pill)] bg-[var(--color-ink)]/70 px-2.5 py-1 text-xs font-medium text-[var(--color-ivory)]">
                {activeIndex + 1} / {media.length}
              </span>
            </>
          )}
        </div>
      </div>

      {media.length > 1 && (
        <div
          aria-label="Miniaturas"
          className="mt-3 grid grid-cols-5 gap-2 overflow-hidden"
        >
          {media.map((image, index) => (
            <button
              key={image.id}
              aria-label={`Ver foto ${index + 1} de ${media.length}`}
              onClick={() => goTo(index)}
              className={`relative aspect-[4/3] min-w-0 overflow-hidden rounded-[var(--radius-md)] border-2 transition-opacity ${
                index === activeIndex
                  ? "border-[var(--color-olive)]"
                  : "border-transparent"
              }`}
            >
              <Image
                src={isLocalMediaId(image.publicId) ? localProductImageSrc(productType, productTitle) : detailImageSrc(image.publicId)}
                alt=""
                fill
                sizes="80px"
                unoptimized={isLocalMediaId(image.publicId)}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
      {lightboxOpen && (
        <motion.div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${productTitle} - imagen ampliada`}
          tabIndex={-1}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar imagen ampliada"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-ivory)]/90 text-[var(--color-ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full max-h-[90vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={isLocalMediaId(active.publicId) ? localProductImageSrc(productType, productTitle) : detailImageSrc(active.publicId)}
              alt={active.alt ?? `${productTitle} - foto ${activeIndex + 1}`}
              fill
              sizes="100vw"
              unoptimized={isLocalMediaId(active.publicId)}
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
