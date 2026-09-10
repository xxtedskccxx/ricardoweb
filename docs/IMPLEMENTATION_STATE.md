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

- **No Cloudinary account configured** — `.env.local` has placeholder
  Cloudinary values. Every code path (signed upload, server-side
  verification, responsive delivery) is implemented and unit/E2E-tested
  where possible without real credentials, but actual photo upload and
  real-photo crop/CLS QA have not been exercised end-to-end. **Needs your
  action**: create a Cloudinary account and provide
  `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` /
  `CLOUDINARY_API_SECRET`.
- **Real contact details are placeholders** (`.env.local` has a fake
  WhatsApp number and a `.example` email). Needs real values before any
  real launch — the current ones are clearly fake but functionally wired.
- **Browser tool in this environment can't drive a native file picker**, so
  the image-upload UI itself was verified by code review + unit-level
  reasoning, not a live upload — this is a tooling limitation, not a
  skipped requirement. Once Cloudinary credentials exist, upload one real
  image through `/admin/productos/[id]` manually to confirm the full round
  trip.

## Test status

| Check | Result |
|---|---|
| Typecheck | clean |
| Lint | clean |
| Unit (Vitest) | 24/24 |
| E2E (Playwright, desktop+mobile) | 44/44 |
| Accessibility (axe, 4 pages) | 0 serious/critical |
| Production build | clean |
| RLS verified live | draft 404s for anon, admin sees drafts, unauthenticated write blocked |
| Visual QA | 320/390/768/1440 checked live (no overflow); real-photo crop QA blocked on Cloudinary |

## Next task

Final security/performance self-review pass (see the completion report),
then hand off — real Cloudinary credentials and real contact info are the
two things that need your input before this could go live. No deploy, push,
or paid resource has been created.
