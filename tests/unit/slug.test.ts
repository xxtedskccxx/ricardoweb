import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Villa Frente al Mar")).toBe("villa-frente-al-mar");
  });

  it("strips accents", () => {
    expect(slugify("Área privada en Baní")).toBe("area-privada-en-bani");
  });

  it("collapses repeated separators", () => {
    expect(slugify("Yate  --  Azimut 43")).toBe("yate-azimut-43");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  ¡Rolex Submariner!  ")).toBe("rolex-submariner");
  });

  it("caps length at 96 characters without a trailing hyphen", () => {
    const long = "a".repeat(50) + " " + "b".repeat(50);
    const result = slugify(long);
    expect(result.length).toBeLessThanOrEqual(96);
    expect(result.endsWith("-")).toBe(false);
  });
});
