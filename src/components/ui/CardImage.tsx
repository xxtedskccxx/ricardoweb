import Image from "next/image";
import { cardImageSrc } from "@/lib/cloudinary/image-src";

interface CardImageProps {
  publicId: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
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
}: CardImageProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bone)]">
      <Image
        src={cardImageSrc(publicId)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)] group-hover:scale-[1.03]"
      />
    </div>
  );
}
