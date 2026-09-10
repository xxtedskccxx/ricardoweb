export type Currency = "USD" | "DOP";
export type PriceMode = "FIXED" | "NEGOTIABLE" | "CONTACT";

const FORMATTERS: Record<Currency, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }),
  DOP: new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  }),
};

/**
 * Renders the price the way the public site should show it:
 * - CONTACT mode never shows a number, even if one is stored.
 * - NEGOTIABLE appends "(negociable)" to a real price.
 * - FIXED shows the currency-formatted amount as-is.
 */
export function formatPrice(
  price: number | null,
  currency: Currency,
  priceMode: PriceMode,
): string {
  if (priceMode === "CONTACT" || price === null) {
    return "Precio a consultar";
  }

  const formatted = FORMATTERS[currency].format(price);

  if (priceMode === "NEGOTIABLE") {
    return `${formatted} (negociable)`;
  }

  return formatted;
}
