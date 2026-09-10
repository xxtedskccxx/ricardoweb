"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { detailImageSrc } from "@/lib/cloudinary/loader";
import type { ProductImageRow } from "@/server/queries";

interface GalleryProps {
  images: ProductImageRow[];
  productTitle: string;
}

export function Gallery({ images, productTitle }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    lightboxRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") goTo(activeIndex + 1);
      if (event.key === "ArrowLeft") goTo(activeIndex - 1);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, activeIndex, goTo]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bone)] text-[var(--color-ink-muted)]">
        Sin fotos disponibles
      </div>
    );
  }

  const active = images[activeIndex];
  if (!active) return null;

  return (
    <div>
      <div className="relative">
        <div
          className="relative w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bone)]"
          style={{ aspectRatio: `${active.width} / ${active.height}` }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 h-full w-full cursor-zoom-in"
            aria-label={`Ampliar imagen ${activeIndex + 1} de ${images.length}`}
          >
            <Image
              src={detailImageSrc(active.publicId)}
              alt={active.alt ?? `${productTitle} — foto ${activeIndex + 1}`}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority={activeIndex === 0}
              className="object-contain"
            />
          </button>

          {images.length > 1 && (
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
                {activeIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div
          role="tablist"
          aria-label="Miniaturas"
          className="mt-3 flex gap-2 overflow-x-auto pb-1 no-overflow-guard"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              role="tab"
              aria-selected={index === activeIndex}
              onClick={() => goTo(index)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] border-2 ${
                index === activeIndex
                  ? "border-[var(--color-olive)]"
                  : "border-transparent"
              }`}
            >
              <Image
                src={detailImageSrc(image.publicId)}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${productTitle} — imagen ampliada`}
          tabIndex={-1}
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
          <div
            className="relative h-full max-h-[90vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={detailImageSrc(active.publicId)}
              alt={active.alt ?? `${productTitle} — foto ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
