import { describe, expect, it } from "vitest";
import { buildWhatsAppGreetingUrl, buildWhatsAppUrl } from "@/lib/whatsapp";

describe("buildWhatsAppUrl", () => {
  it("strips non-digit characters from the phone number", () => {
    const url = buildWhatsAppUrl(
      "+1 (809) 555-0100",
      "Villa Frente al Mar",
      "https://altamar.example/producto/villa-frente-al-mar",
    );
    expect(url.startsWith("https://wa.me/18095550100?text=")).toBe(true);
  });

  it("includes the exact product title and URL in the encoded message", () => {
    const url = buildWhatsAppUrl(
      "8095550100",
      "Rolex Submariner",
      "https://altamar.example/producto/rolex-submariner",
    );
    const decoded = decodeURIComponent(url.split("?text=")[1] ?? "");
    expect(decoded).toContain('Rolex Submariner');
    expect(decoded).toContain(
      "https://altamar.example/producto/rolex-submariner",
    );
  });
});

describe("buildWhatsAppGreetingUrl", () => {
  it("greets the owner by name and strips non-digits", () => {
    const url = buildWhatsAppGreetingUrl("+1 (829) 672-7363", "Ricardo");
    expect(url.startsWith("https://wa.me/18296727363?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1]!)).toBe(
      "Hola Ricardo, vi tu página y me gustaría más información.",
    );
  });
});
