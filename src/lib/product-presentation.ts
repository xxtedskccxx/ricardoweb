import type { ProductAttribute } from "@/server/queries";

export function getFeaturedAttributes(attributes: ProductAttribute[]) {
  return attributes
    .filter((attribute) => attribute.label.trim() && attribute.value.trim())
    .slice(0, 4);
}

export function getPropertySectionTitle(type: string) {
  return ["villa", "apartamento", "propiedad", "terreno"].includes(
    type.trim().toLowerCase(),
  )
    ? "Más propiedades en venta"
    : "Más productos en venta";
}
