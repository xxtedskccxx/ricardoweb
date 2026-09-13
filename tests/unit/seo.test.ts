import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  getPublicImageUrl,
  serializeJsonLd,
  toMetaDescription,
} from "@/lib/seo";

describe("SEO helpers", () => {
  it("builds absolute URLs from the configured site origin", () => {
    expect(absoluteUrl("/en-venta")).toBe("http://localhost:3000/en-venta");
  });

  it("keeps descriptions readable while enforcing the search snippet limit", () => {
    const description = toMetaDescription(
      "Una descripción   con saltos de línea y suficiente contenido para comprobar que el texto se limpia y se acorta sin cortar una palabra a mitad del camino cuando supera el límite recomendado.",
    );

    expect(description.length).toBeLessThanOrEqual(160);
    expect(description).not.toMatch(/\s{2,}/);
    expect(description).toMatch(/[^\s]…$/);
    expect(description).not.toMatch(/\s…$/);
  });

  it("uses the real local asset for development and fallback product media", () => {
    expect(getPublicImageUrl("local:cover", "Vehículo", "Land Cruiser")).toBe(
      "http://localhost:3000/images/altamar/vehicle.webp",
    );
  });

  it("escapes script-breaking characters in JSON-LD", () => {
    const serialized = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
  });
});
