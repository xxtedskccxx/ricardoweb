export type ProductStatus = "DRAFT" | "AVAILABLE" | "RESERVED" | "SOLD";

/**
 * Status changes allowed through setProductStatus(). DRAFT -> public is
 * deliberately absent: leaving DRAFT must go through publishProduct(), which
 * enforces the publication contract.
 */
const ALLOWED_TRANSITIONS: Record<ProductStatus, readonly ProductStatus[]> = {
  DRAFT: [],
  AVAILABLE: ["RESERVED", "SOLD", "DRAFT"],
  RESERVED: ["AVAILABLE", "SOLD", "DRAFT"],
  SOLD: ["AVAILABLE", "RESERVED", "DRAFT"],
};

export function canTransition(from: ProductStatus, to: ProductStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
