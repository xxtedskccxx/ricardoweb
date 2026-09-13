import Image from "next/image";
import { cardImageSrc } from "@/lib/cloudinary/image-src";
import { isLocalMediaId, localProductImageSrc } from "@/lib/local-media";

interface CardImageProps {
  publicId: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  productType?: string;
}

/**
 * Fixed 4:3 content-aware crop used everywhere a product appears as a
 * card (homepage grid, catalog, related rail). The wrapper's aspect-ratio
 * is set in CSS so the box is stable before the image loads — zero CLS.
 */
export function CardImage({
  publicId,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  productType,
}: CardImageProps) {
  const localSrc = isLocalMediaId(publicId)
    ? localProductImageSrc(productType, alt)
    : null;
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bone)]">
      <Image
        src={localSrc ?? cardImageSrc(publicId)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        unoptimized={Boolean(localSrc)}
        placeholder="empty"
        className="object-cover transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)] lg:group-hover:scale-[1.03]"
      />
    </div>
  );
}
