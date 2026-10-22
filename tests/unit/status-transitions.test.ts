import { describe, expect, it } from "vitest";
import { canTransition } from "@/lib/status-transitions";

describe("canTransition", () => {
  it("never lets a draft skip the publication contract", () => {
    expect(canTransition("DRAFT", "AVAILABLE")).toBe(false);
    expect(canTransition("DRAFT", "RESERVED")).toBe(false);
    expect(canTransition("DRAFT", "SOLD")).toBe(false);
  });

  it("allows moving between public states and unpublishing", () => {
    expect(canTransition("AVAILABLE", "RESERVED")).toBe(true);
    expect(canTransition("RESERVED", "SOLD")).toBe(true);
    expect(canTransition("SOLD", "AVAILABLE")).toBe(true);
    expect(canTransition("SOLD", "DRAFT")).toBe(true);
  });

  it("rejects no-op transitions", () => {
    expect(canTransition("AVAILABLE", "AVAILABLE")).toBe(false);
    expect(canTransition("SOLD", "SOLD")).toBe(false);
  });
});
