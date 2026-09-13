# ALTAMAR — Project Rules

## What this is

ALTAMAR is a premium, **single-owner** sales catalog for the Dominican
Republic (properties, vehicles, land, boats, watches, or any other item the
owner has for sale). It is **not** a marketplace. Contact (WhatsApp/phone/
email) is the only conversion — there is no cart, checkout, payments,
shipping, customer accounts, or vendor concept anywhere in this codebase.
Never introduce any of those without an explicit new request.

## Invariants that must never be violated

- **No inventory limit.** The homepage shows up to 6 items; that is a display
  choice, never a database or query limit. `/en-venta` paginates the full
  catalog.
- **Generic product model.** One `products` table with a code-side type
  registry (`src/config/product-types.ts`) and an ordered JSONB `attributes`
  array. Never add a per-type table (no `PropertyTable`, `VehicleTable`, …).
  A new item type is a registry entry, not a migration.
- **No dead controls.** Every visible button/link must do something real. If
  a feature isn't built, the control doesn't exist.
- **Publication is server-enforced.** `publishProduct()` in
  `src/server/actions/product.ts` validates the full contract (title, slug,
  type, description ≥20 chars, valid price config, ≥1 image, cover image)
  server-side. A disabled frontend button is never the only gate.
- **Drafts are invisible publicly** through every public SQL query
  (`status <> 'DRAFT'`), not just an application filter.
- **Two independent admin security layers**: middleware/proxy redirect (UX
  only) → `requireAdmin()` in `src/server/auth.ts` (the real boundary,
  validates the signed, httpOnly session + `admins` allow-list membership).
  There is no
  public admin registration route anywhere; accounts are created with
  `pnpm admin:create <email> <password>`.
- **Status policy**: DRAFT never public · AVAILABLE public+contactable ·
  RESERVED public with a badge, still contactable · SOLD excluded from the
  default `/en-venta` listing but its direct URL stays live and labeled
  "Vendido" (so shared links never break).

## Image pipeline

Cloudinary, signed direct-upload only. `CLOUDINARY_API_SECRET` is read only in server-only modules
(`src/lib/env.ts`, `src/lib/cloudinary/sign.ts`, `verify.ts`) — never in a
Client Component. The Admin API resource-details endpoint authenticates
with plain HTTP Basic Auth (`api_key:api_secret`) — it is NOT part of the
Upload API's timestamp+signature family; don't sign it like an upload.
After upload, the server re-fetches the resource from Cloudinary's Admin API
and validates the *real* format/size/dimensions before writing a row
(`src/lib/cloudinary/verify.ts`) — the browser's report is never trusted.
Card crops use `fill` (4:3, content-aware); detail/gallery uses `limit`
(never crops) — see `src/lib/cloudinary/loader.ts`. Cover image = the row at
`position = 0`; there is no separate `is_cover` flag. Reorder is atomic via
a two-statement Neon Postgres transaction (two-pass negative-offset swap) to
avoid partial-failure position collisions.

**`server-only` and scripts**: the `server-only` package throws
unconditionally under plain Node — not just inside Next's bundler — so a
standalone script (`scripts/*.ts`, run via `tsx`) can never import
`sign.ts`/`verify.ts`/`env.ts` even transitively. The pure signing/folder/
verification math lives in `src/lib/cloudinary/core.ts` (no `server-only`,
no env access) precisely so both the app and scripts share one
implementation instead of duplicating it. If you need Cloudinary logic in a
new script, add to `core.ts`, don't hand-roll it in the script.

## Stack

Next.js 16 (App Router, TypeScript strict, `noUncheckedIndexedAccess`),
Tailwind v4, Neon Postgres, signed cookie auth, Cloudinary, Zod, React Hook Form is
NOT used — forms are plain uncontrolled inputs read via `FormData` plus a
`useTransition` call to the Server Action, validated with Zod. dnd-kit for
image reorder. Vitest + Playwright/axe. pnpm.

## Server/client boundary

Server Components by default. `"use client"` only where there's real
browser interactivity: mobile nav, search/filter inputs, gallery/lightbox,
admin forms, the image manager (upload/reorder/DnD), delete-confirm dialog.

## Commands

```bash
pnpm dev                 # dev server
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint
pnpm test                 # vitest (unit)
pnpm e2e                  # playwright (spawns its own dev server on :4137)
pnpm build                # production build
pnpm db:migrate           # apply db/migrations to DATABASE_URL
pnpm seed                 # insert dev-only demo products (titled "[DEV]")
pnpm admin:create <email> <password>   # the only way to create an admin account
```

**Port note (this dev machine only):** ports 3000, 3010, and 3100 are
silently captured by an unrelated Docker/WSL relay regardless of what's
actually listening there. `playwright.config.ts` uses port 4137 for exactly
this reason — don't move it back to a low port without checking
`Get-NetTCPConnection -State Listen` first.

## Testing

No per-test database isolation exists; use a separate Neon development branch
for E2E data.
`playwright.config.ts` deliberately runs `workers: 1` / `fullyParallel: false`
— don't re-enable parallelism without adding real test-data isolation first.

## Design tokens

Single source: `src/app/globals.css`. Don't hardcode hex values in
components. `--color-sand` is decorative-only (borders, non-text accents) —
it fails WCAG AA as text on ivory/bone. Use `--color-sand-text` for any
overline/label text in that hue; axe caught this once already.

## Documentation

Temporary/progress state lives in `docs/IMPLEMENTATION_STATE.md`, not here.
`docs/DESIGN_REFERENCE.md` records what was actually observed in the two
reference screenshots under `references/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
