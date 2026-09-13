import { describe, expect, it } from "vitest";
import {
  getFeaturedAttributes,
  getPropertySectionTitle,
} from "@/lib/product-presentation";

describe("product presentation", () => {
  it("limits the summary row to the first four populated attributes", () => {
    const attributes = [
      { label: "Habitaciones", value: "5 hab." },
      { label: "Baños", value: "5.5 baños" },
      { label: "Área", value: "650 m²" },
      { label: "Parqueos", value: "3 parqueos" },
      { label: "Niveles", value: "2" },
    ];

    expect(getFeaturedAttributes(attributes)).toEqual(attributes.slice(0, 4));
  });

  it("omits attributes without a visible label or value", () => {
    expect(
      getFeaturedAttributes([
        { label: "Habitaciones", value: "4" },
        { label: "", value: "Piscina" },
        { label: "Baños", value: "" },
      ]),
    ).toEqual([{ label: "Habitaciones", value: "4" }]);
  });

  it("uses a property-specific related section title", () => {
    expect(getPropertySectionTitle("Villa")).toBe("Más propiedades en venta");
    expect(getPropertySectionTitle("Apartamento")).toBe(
      "Más propiedades en venta",
    );
    expect(getPropertySectionTitle("Yate")).toBe("Más productos en venta");
  });
});
