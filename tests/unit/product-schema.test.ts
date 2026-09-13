import { describe, expect, it } from "vitest";
import {
  attributesSchema,
  productDraftSchema,
  publicationContractSchema,
} from "@/schemas/product";

describe("attributesSchema", () => {
  it("accepts a well-formed ordered list", () => {
    const result = attributesSchema.safeParse([
      { label: "Habitaciones", value: "4" },
      { label: "Baños", value: "4.5" },
    ]);
    expect(result.success).toBe(true);
  });

  it("rejects duplicate labels case-insensitively", () => {
    const result = attributesSchema.safeParse([
      { label: "Año", value: "2024" },
      { label: "año", value: "2025" },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects more than 20 entries", () => {
    const attrs = Array.from({ length: 21 }, (_, i) => ({
      label: `Campo ${i}`,
      value: "x",
    }));
    expect(attributesSchema.safeParse(attrs).success).toBe(false);
  });
});

describe("productDraftSchema", () => {
  const base = {
    title: "Villa Frente al Mar",
    shortDescription: null,
    description: null,
    type: "Villa",
    currency: "USD" as const,
    location: "Punta Cana",
    featured: false,
    attributes: [],
  };

  it("requires a price unless priceMode is CONTACT", () => {
    const result = productDraftSchema.safeParse({
      ...base,
      price: null,
      priceMode: "FIXED",
    });
    expect(result.success).toBe(false);
  });

  it("allows a null price when priceMode is CONTACT", () => {
    const result = productDraftSchema.safeParse({
      ...base,
      price: null,
      priceMode: "CONTACT",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an optional public location and a coordinate pair", () => {
    const result = productDraftSchema.safeParse({
      ...base,
      price: 850000,
      priceMode: "FIXED",
      showLocation: true,
      locationLatitude: 18.5601,
      locationLongitude: -68.3725,
    });

    expect(result.success).toBe(true);
  });

  it("rejects coordinates outside the map bounds", () => {
    const result = productDraftSchema.safeParse({
      ...base,
      price: 850000,
      priceMode: "FIXED",
      locationLatitude: 91,
      locationLongitude: -68.3725,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a coordinate without its pair", () => {
    const result = productDraftSchema.safeParse({
      ...base,
      price: 850000,
      priceMode: "FIXED",
      locationLatitude: 18.5601,
      locationLongitude: null,
    });

    expect(result.success).toBe(false);
  });
});

describe("publicationContractSchema", () => {
  it("rejects publishing without a cover image", () => {
    const result = publicationContractSchema.safeParse({
      title: "Villa Frente al Mar",
      slug: "villa-frente-al-mar",
      type: "Villa",
      description: "Una villa espectacular frente al mar con acceso privado.",
      priceMode: "FIXED",
      price: 850000,
      imageCount: 1,
      hasCoverImage: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects publishing with zero images", () => {
    const result = publicationContractSchema.safeParse({
      title: "Villa Frente al Mar",
      slug: "villa-frente-al-mar",
      type: "Villa",
      description: "Una villa espectacular frente al mar con acceso privado.",
      priceMode: "FIXED",
      price: 850000,
      imageCount: 0,
      hasCoverImage: true,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a fully-formed publication", () => {
    const result = publicationContractSchema.safeParse({
      title: "Villa Frente al Mar",
      slug: "villa-frente-al-mar",
      type: "Villa",
      description: "Una villa espectacular frente al mar con acceso privado.",
      priceMode: "FIXED",
      price: 850000,
      imageCount: 3,
      hasCoverImage: true,
    });
    expect(result.success).toBe(true);
  });
});
