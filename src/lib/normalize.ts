/**
 * Shared normalization for free-text fields that back filters (`type`,
 * `location`). Prevents "Punta Cana" / "punta cana" / "Punta   Cana" from
 * fragmenting into separate filter buckets while preserving the
 * human-readable display value the owner typed.
 */
export function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Collapse whitespace only, preserving case/accents — for the display value itself. */
export function cleanDisplayValue(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
