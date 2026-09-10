/**
 * Deterministic slugify: lowercase, strip accents, replace anything that
 * isn't a-z0-9 with a hyphen, collapse repeats, trim edge hyphens.
 * Duplicate-avoidance (appending -2, -3, ...) happens where the slug is
 * persisted (server/actions/product.ts), because it requires a database
 * lookup this pure function must not perform.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}
