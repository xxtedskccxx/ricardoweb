# ALTAMAR — Implementation State

> Temporary/progress tracker. Durable rules live in `CLAUDE.md`.

## Current phase

Launch readiness. Features are complete; the backend runs on Neon Postgres
(migrated from Supabase on 2026-09-13), with a map location picker and a
simplified admin product form added afterwards.

## Done in the launch-readiness pass (2026-10-21)

- Status transitions enforced server-side (`src/lib/status-transitions.ts`):
  DRAFT can only become public through `publishProduct()`.
- A published product can no longer lose its last image; deleting an image
  re-compacts positions in one transaction so a cover (`position = 0`)
  always exists.
- Image reorder rejects payloads that don't list exactly the product's
  current images.
- Uploaded `public_id`s must live in the product's own Cloudinary folder.
- Alt-text edits revalidate the public catalog cache.
- Product delete destroys Cloudinary images immediately; only failures go to
  `media_cleanup_queue`, drained by the new `pnpm media:cleanup`.
- Admin login throttling (`login_attempts`, migration `0003`).
- GitHub Actions CI: typecheck, lint, unit tests, production build.
- Deployment guide: `docs/DEPLOYMENT.md`.

## Blockers (need the owner)

- Real contact details (WhatsApp, phone, email, Instagram).
- Production Neon project, Cloudinary production folder, Vercel project and
  domain — see `docs/DEPLOYMENT.md`.
- Real inventory and photos to replace the `[DEV]` seed products.

## Verification still pending

- `pnpm e2e` has not been re-run against Neon since the map/form commits and
  this pass; run it against a Neon development branch before launch.
