/**
 * Builds a wa.me link pre-filled with a message that names the exact
 * product and links back to it, so the visitor never has to explain
 * which item they saw.
 */
export function buildWhatsAppUrl(
  whatsappNumber: string,
  productTitle: string,
  productUrl: string,
): string {
  const digitsOnly = whatsappNumber.replace(/[^0-9]/g, "");
  const message = `Hola, estoy interesado en "${productTitle}".\nVi el artículo aquí:\n${productUrl}`;
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
