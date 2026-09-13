/**
 * Local development photography used until a real Cloudinary asset is
 * attached to a product. The fallback keeps the catalog feeling intentional
 * instead of exposing empty or synthetic placeholder cards.
 */
const TYPE_MEDIA: Record<string, string> = {
  villa: "/images/altamar/villa.webp",
  terreno: "/images/altamar/villa.webp",
  vehículo: "/images/altamar/vehicle.webp",
  vehiculo: "/images/altamar/vehicle.webp",
  reloj: "/images/altamar/watch.webp",
  yate: "/images/altamar/hero.webp",
};

function normalize(value: string | undefined) {
  return value?.trim().toLocaleLowerCase("es") ?? "";
}

export function localProductImageSrc(type?: string, title?: string) {
  const normalized = normalize(type);
  const titleKey = normalize(title);

  for (const [key, src] of Object.entries(TYPE_MEDIA)) {
    if (normalized.includes(key) || titleKey.includes(key)) return src;
  }

  return "/images/altamar/villa.webp";
}

export function isLocalMediaId(publicId: string | undefined) {
  return !publicId || publicId.startsWith("local:") || publicId.includes("[DEV]") || publicId.includes("/dev/") || publicId.startsWith("altamar/dev");
}
