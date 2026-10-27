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

## Production (2026-10-22)

- Live at https://ricardoweb-two.vercel.app (Vercel Hobby), Neon project
  `ricardoweb` (Postgres 18, aws-us-east-1), Cloudinary folder `altamar/prod`.
- Repository: github.com/xxtedskccxx/ricardoweb. Every push to `main`
  deploys automatically through the Vercel GitHub integration.
- Daily encrypted database backup: `.github/workflows/backup.yml`.
- Publishing now only requires a non-empty description.
- Contact: WhatsApp/phone 829-672-7363, email ricardo-dlc@outlook.com
  (Vercel env vars; `NEXT_PUBLIC_*` changes need a redeploy).

## Admin as part of the site (2026-10-27)

- Admin pages and login render inside the public header/footer; signed-in
  admins see an "Admin" link in the header and an edit bar on product pages
  (`hasAdminSessionCookie()` is a UI hint only — `requireAdmin()` still guards).
- `/admin/cuenta`: admins change their own password.
- Brand name is provisional ("Ricardo Ventas") in `src/config/site.ts`, with
  `owner` shown on contact cards.

## Pending (need the owner)

- Final brand name and custom domain, once the client chooses.
- Real inventory.

## Verification still pending

- `pnpm e2e` has not been re-run against Neon since the map/form commits;
  run it against a Neon development branch, never production.
