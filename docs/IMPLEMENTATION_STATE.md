# ALTAMAR — Implementation State

> Temporary/progress tracker. Durable rules live in `CLAUDE.md`.

## Current phase

Phase 12 (final audit) — in progress. Core product is complete and verified
end-to-end; remaining work is polish/verification, not missing features.

## Completed

- **Phase 0** — Next.js 16 (App Router, TS strict) + Tailwind v4 scaffold,
  design tokens from the reference screenshots, centralized `siteConfig`,
  `.env.example`, git initialized.
- **Phase 1** — Supabase schema (`products`, `product_images`,
  `product_slug_history`, `admins`, `media_cleanup_queue`), RLS on every
  table, generated `type_normalized`/`location_normalized` columns
  (`immutable_unaccent` wrapper — plain `unaccent()` isn't IMMUTABLE and
  can't sit in a generated column), atomic `reorder_product_images` RPC,
  Zod schemas, server query/action layer, 24 unit tests.
- **Phase 2/3/4/5** — Cloudinary loader (fill/limit crop modes via a
  src-prefix convention), CardImage/DetailImage, homepage, `/en-venta`
  catalog (real DB search/filter/sort/pagination), `/producto/[slug]`
  (gallery+lightbox+keyboard, specs, contact, JSON-LD, sitemap/robots,
  slug-history redirects, branded 404/error).
- **Phase 6/7/8** — Supabase-authenticated admin (no public signup),
  three-layer authorization, dashboard with real counts, product
  list/create/edit (grouped sections, ordered attribute editor,
  server-enforced publication contract), status transitions, named delete
  confirmation, image manager (signed upload, progress, server-side
  re-verification, dnd-kit atomic reorder, cover selection, alt text,
  low-res warning, cleanup-queue fallback).
- **Phase 9/10** — Responsive pass (320/390/768/1024/1440 checked live, zero
  horizontal overflow), full Playwright suite (22 tests × 2 projects = 44,
  all green) covering both public and admin critical flows, axe
  accessibility checks on 4 key pages (0 serious/critical violations after
  fixing 2 real WCAG contrast bugs the run caught).
- Migrated `middleware.ts` → `proxy.ts` via the official Next.js codemod
  (Next 16 deprecated the old convention).
- `pnpm build` passes clean (no warnings). `pnpm lint` clean. `pnpm
  typecheck` clean.

## Blockers

- **Real contact details are placeholders** (`.env.local` has a fake
  WhatsApp number and a `.example` email). Needs real values before any
  real launch — the current ones are clearly fake but functionally wired.

## Resolved this pass — Cloudinary real-credential verification

A real Cloudinary account (`vask4xsm`) was configured in `.env.local` and
the full upload pipeline was verified live end-to-end — signed upload,
server-side Admin API re-verification, DB persistence, and rendering —
not just reproduced as a diagnosed failure. This surfaced and fixed three
real bugs that had never been exercised before (upload always failed on
placeholder credentials, so nothing downstream of it had ever actually run
against real data):

1. **Wrong Admin API auth** (found in the prior pass) — confirmed fixed:
   `verifyCloudinaryResource` now uses plain Basic `api_key:api_secret`.
2. **`next.config.ts`'s custom image loader had no default export.**
   Next.js's `images.loaderFile` contract requires one; this was invisible
   until a real image actually needed rendering (`src/lib/cloudinary/loader.ts`).
   Fixed by adding `export default cloudinaryLoader` and the required
   `"use client"` directive.
3. **That `"use client"` directive then broke Server Component callers.**
   `cardImageSrc`/`detailImageSrc` were in the same file, so tainting it
   client-only broke `CardImage.tsx` (a Server Component) at runtime with
   "Attempted to call cardImageSrc() from the server". Fixed by moving
   those two pure string builders into a new `src/lib/cloudinary/image-src.ts`
   (no `"use client"`), leaving `loader.ts` as client-only and
   default-exported. Four importers updated.
4. **Gallery thumbnail buttons had no accessible name** — axe caught this
   only once a real product (Villa Frente al Mar, via `pnpm seed:media`)
   actually had 2+ images to populate the thumbnail strip; no seed data
   had ever done that before. Fixed with an `aria-label` on each
   `role="tab"` thumbnail in `src/features/products/Gallery.tsx`.

Live-verified via a real signed upload through the actual admin UI
(`/admin/productos/[id]`), confirmed by inspecting the rendered `<img>`'s
`src` (`res.cloudinary.com/vask4xsm/...`) and `naturalWidth`, then cleaned
up. `tests/e2e/admin-images.spec.ts` was rewritten to match: a real-success
test (uploads, verifies, renders as cover) replaces the old
"unconfigured Cloudinary fails" test (no longer true now that real
credentials exist), and a new test uses the previously-unused
`tests/fixtures/invalid-file.png` to exercise Cloudinary's *real* rejection
of a non-image payload — a check that was only simulable before.

## Test status

| Check | Result |
|---|---|
| Typecheck | clean |
| Lint | clean |
| Unit (Vitest) | 38/38 |
| E2E (Playwright, desktop+mobile) | 50/50 (real-upload success test replaces the old unconfigured-Cloudinary test; new invalid-file-rejection test) |
| Accessibility (axe, 4 pages) | 0 serious/critical (after fixing the gallery thumbnail aria-label bug real images exposed) |
| Production build | clean |
| RLS verified live | draft 404s for anon, admin sees drafts, unauthenticated write blocked |
| Visual QA | 320/390/768/1440 checked live (no overflow) |
| Cloudinary upload | **verified live with real credentials** — real signed upload, real Admin API verification, real DB row, real render confirmed in-browser |

## Next task

Real contact info is the one thing left needing your input before this
could go live. No deploy, push, or paid resource has been created.
