import { normalizeKey } from "@/lib/normalize";

/**
 * Code-side registry for product "type". This is NOT a database enum —
 * `products.type` is free text so a new item type never requires a migration.
 * The registry only supplies a friendly label, icon key and a suggested
 * attribute template to prefill the admin form. Unknown/unregistered types
 * still render correctly using a humanized fallback.
 */

export type ProductTypeIcon =
  | "home"
  | "car"
  | "land"
  | "boat"
  | "tag"
  | "watch";

export interface ProductTypeDefinition {
  /** Normalized key, lowercase, no accents/spaces — used for filtering. */
  key: string;
  /** Human label shown in the UI. */
  label: string;
  /** Plural label for section headers. */
  labelPlural: string;
  icon: ProductTypeIcon;
  suggestedAttributes: string[];
}

export const PRODUCT_TYPE_REGISTRY: ProductTypeDefinition[] = [
  {
    key: "villa",
    label: "Villa",
    labelPlural: "Villas",
    icon: "home",
    suggestedAttributes: ["Habitaciones", "Baños", "Área", "Piscina"],
  },
  {
    key: "apartamento",
    label: "Apartamento",
    labelPlural: "Apartamentos",
    icon: "home",
    suggestedAttributes: ["Habitaciones", "Baños", "Área", "Nivel"],
  },
  {
    key: "propiedad",
    label: "Propiedad",
    labelPlural: "Propiedades",
    icon: "home",
    suggestedAttributes: ["Habitaciones", "Baños", "Área"],
  },
  {
    key: "terreno",
    label: "Terreno",
    labelPlural: "Terrenos",
    icon: "land",
    suggestedAttributes: ["Área", "Uso de suelo", "Frente"],
  },
  {
    key: "vehiculo",
    label: "Vehículo",
    labelPlural: "Vehículos",
    icon: "car",
    suggestedAttributes: ["Año", "Kilometraje", "Transmisión", "Combustible"],
  },
  {
    key: "yate",
    label: "Yate",
    labelPlural: "Yates",
    icon: "boat",
    suggestedAttributes: ["Año", "Eslora", "Motor", "Capacidad"],
  },
  {
    key: "reloj",
    label: "Reloj",
    labelPlural: "Relojes",
    icon: "watch",
    suggestedAttributes: ["Año", "Condición", "Incluye"],
  },
  {
    key: "articulo",
    label: "Artículo",
    labelPlural: "Artículos",
    icon: "tag",
    suggestedAttributes: ["Condición", "Incluye"],
  },
];

const REGISTRY_BY_KEY = new Map(
  PRODUCT_TYPE_REGISTRY.map((entry) => [entry.key, entry]),
);

export function getProductTypeDefinition(
  displayValue: string,
): ProductTypeDefinition {
  const key = normalizeKey(displayValue);
  return (
    REGISTRY_BY_KEY.get(key) ?? {
      key,
      label: displayValue,
      labelPlural: displayValue,
      icon: "tag",
      suggestedAttributes: [],
    }
  );
}
