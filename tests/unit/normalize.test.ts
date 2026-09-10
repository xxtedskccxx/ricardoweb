import { describe, expect, it } from "vitest";
import { normalizeKey } from "@/lib/normalize";

describe("normalizeKey", () => {
  it("treats case variants as the same key", () => {
    expect(normalizeKey("Punta Cana")).toBe(normalizeKey("PUNTA CANA"));
    expect(normalizeKey("Punta Cana")).toBe(normalizeKey("punta cana"));
  });

  it("collapses repeated internal whitespace", () => {
    expect(normalizeKey("Punta   Cana")).toBe(normalizeKey("Punta Cana"));
  });

  it("strips accents", () => {
    expect(normalizeKey("Baní")).toBe("bani");
  });

  it("trims leading/trailing whitespace", () => {
    expect(normalizeKey("  Santo Domingo  ")).toBe("santo domingo");
  });
});
