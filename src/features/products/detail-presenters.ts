import type { ProductAttribute } from "@/server/queries";

export type DetailHighlightIcon = "bed" | "bath" | "area" | "parking";

export interface DetailHighlight {
  label: string;
  value: string;
  icon: DetailHighlightIcon;
}

const HIGHLIGHTS: Array<{
  aliases: string[];
  label: string;
  icon: DetailHighlightIcon;
}> = [
  { aliases: ["habitaciones", "habitacion"], label: "hab.", icon: "bed" },
  { aliases: ["banos", "bano"], label: "baños", icon: "bath" },
  {
    aliases: ["area de construccion", "area", "metros cuadrados"],
    label: "m²",
    icon: "area",
  },
  { aliases: ["parqueos", "parqueo"], label: "parqueos", icon: "parking" },
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function numericValue(value: string) {
  return value.match(/[\d.,]+/)?.[0] ?? value;
}

export function getDetailHighlights(
  attributes: ProductAttribute[],
): DetailHighlight[] {
  return HIGHLIGHTS.flatMap((definition) => {
    const attribute = attributes.find((candidate) =>
      definition.aliases.includes(normalize(candidate.label)),
    );
    return attribute
      ? [{ label: definition.label, icon: definition.icon, value: numericValue(attribute.value) }]
      : [];
  });
}
