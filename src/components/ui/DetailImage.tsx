import Image from "next/image";
import { detailImageSrc } from "@/lib/cloudinary/image-src";
import { isLocalMediaId, localProductImageSrc } from "@/lib/local-media";

interface DetailImageProps {
  publicId: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  productType?: string;
}

/**
 * Non-destructive presentation for detail/gallery views: the wrapper's
 * aspect-ratio comes from the image's own stored width/height, so
 * portrait, landscape, square and panorama uploads all render at their
 * true proportions with zero layout shift and no forced crop.
 */
export function DetailImage({
  publicId,
  alt,
  width,
  height,
  priority = false,
  sizes = "(min-width: 1024px) 60vw, 100vw",
  className,
  productType,
}: DetailImageProps) {
  const localSrc = isLocalMediaId(publicId)
    ? localProductImageSrc(productType, alt)
    : null;
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bone)] ${className ?? ""}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        src={localSrc ?? detailImageSrc(publicId)}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        unoptimized={Boolean(localSrc)}
        className="object-contain"
      />
    </div>
  );
}
