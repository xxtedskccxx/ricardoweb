import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/money";

describe("formatPrice", () => {
  it("formats a fixed USD price", () => {
    expect(formatPrice(850000, "USD", "FIXED")).toContain("850,000");
  });

  it("formats a fixed DOP price", () => {
    const result = formatPrice(50000, "DOP", "FIXED");
    expect(result).toContain("50,000");
  });

  it("appends negociable for NEGOTIABLE mode", () => {
    expect(formatPrice(100, "USD", "NEGOTIABLE")).toMatch(/negociable/);
  });

  it("never shows a number for CONTACT mode even if a price is stored", () => {
    expect(formatPrice(999999, "USD", "CONTACT")).toBe("Precio a consultar");
  });

  it("shows contact fallback when price is null regardless of mode", () => {
    expect(formatPrice(null, "USD", "FIXED")).toBe("Precio a consultar");
  });
});
