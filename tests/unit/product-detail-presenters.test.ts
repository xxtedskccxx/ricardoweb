import { describe, expect, it } from "vitest";
import { getDetailHighlights } from "@/features/products/detail-presenters";
import type { ProductAttribute } from "@/server/queries";

describe("getDetailHighlights", () => {
  it("extracts the expected real-estate summary specs from product attributes", () => {
    const attributes: ProductAttribute[] = [
      { label: "Habitaciones", value: "4" },
      { label: "Baños", value: "4.5" },
      { label: "Área de construcción", value: "520 m²" },
      { label: "Parqueos", value: "3" },
      { label: "Piscina", value: "Sí (privada)" },
    ];

    expect(getDetailHighlights(attributes)).toEqual([
      { label: "hab.", value: "4", icon: "bed" },
      { label: "baños", value: "4.5", icon: "bath" },
      { label: "m²", value: "520", icon: "area" },
      { label: "parqueos", value: "3", icon: "parking" },
    ]);
  });

  it("ignores missing or unrelated attributes without changing the order", () => {
    const attributes: ProductAttribute[] = [
      { label: "Piscina", value: "Sí" },
      { label: "Baños", value: "2" },
      { label: "Niveles", value: "1" },
    ];

    expect(getDetailHighlights(attributes)).toEqual([
      { label: "baños", value: "2", icon: "bath" },
    ]);
  });
});
