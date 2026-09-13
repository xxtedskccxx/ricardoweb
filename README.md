# Altamar

A premium, single-owner sales catalog for the Dominican Republic —
properties, vehicles, land, boats, watches, or any other item the owner has
for sale. Not a marketplace: one owner, one inventory, contact-driven
conversion (WhatsApp, phone, email).

## Stack

Next.js 16 (App Router) · TypeScript (strict) · Neon Postgres · cookie-based
admin auth · Cloudinary · Zod · dnd-kit · Vitest · Playwright + axe ·
pnpm

## Local setup

### Prerequisites

- Node 22+
- pnpm (`corepack enable` if you don't have it)
- A free Neon account (or any PostgreSQL 15+ database)

### 1. Install and start the database

```bash
pnpm install
```

Copy `.env.example` to `.env.local`, paste your Neon connection string in
`DATABASE_URL`, and generate a random `AUTH_SECRET` with at least 32
characters. Then run `pnpm db:migrate` to create the tables:

```bash
pnpm db:migrate
```

### 2. Cloudinary (optional for browsing, required for image upload)

Create a free account at cloudinary.com, then fill in
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET` in `.env.local`. Everything else works without this;
only image upload/verification needs it.

### 3. Contact info

Fill in `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CONTACT_PHONE`,
`NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_INSTAGRAM_URL` — these are the
single source of truth for every contact link on the site
(`src/config/site.ts`).

### 4. Create the admin account and seed demo data

```bash
pnpm admin:create you@example.com "a-strong-password"
pnpm seed
```

There is no public sign-up route by design — this script is the only way to
create an admin. `pnpm seed` inserts six demo products (titled `[DEV]`),
covering every status (draft/available/reserved/sold) and price mode
(fixed/negotiable/contact) for local testing.

Once real Cloudinary credentials are set (see
`docs/CLOUDINARY_SETUP.md`), run `pnpm seed:media` to attach the clearly-
synthetic labeled reference images in `dev-assets/reference-products/` to
the seeded products, so visual QA doesn't run against empty image
containers.

### 5. Run it

```bash
pnpm dev
```

Visit `http://localhost:3000` (or whatever port Next picks — see the port
note in `CLAUDE.md`) and `http://localhost:3000/admin/login`.

## Testing

```bash
pnpm typecheck
pnpm lint
pnpm test        # unit (Vitest)
pnpm e2e          # E2E + accessibility (Playwright + axe)
pnpm build        # production build
```

`pnpm e2e` starts its own dev server on port 4137 and uses the database in
`DATABASE_URL`. Use a separate Neon development branch for test data.

## Project structure

```
src/
  app/
    (public)/            homepage, /en-venta, /producto/[slug]
    admin/(dashboard)/    authenticated admin (layout calls requireAdmin())
    admin/login/          the only public admin-adjacent route
  components/ui/          Button, badges, CardImage/DetailImage
  components/layout/      Header, Footer, mobile nav, search
  features/products/      public product UI (card, grid, gallery, contact)
  features/admin/         admin-only UI (form, image manager, status/delete)
  features/home/          Hero
  config/                 site.ts (branding/contact), product-types.ts
  lib/                    slug, money, whatsapp, normalize, env,
                          db.ts, auth/*, cloudinary/*
  schemas/                Zod (product.ts, image.ts)
  server/                 auth.ts, queries.ts (public reads),
                          actions/ (Server Actions — the only writers)
db/migrations/             versioned Neon/Postgres SQL
scripts/                   seed.ts, create-admin.ts (dev-only)
tests/unit/                Vitest
tests/e2e/                 Playwright + axe
references/                the two design reference screenshots
```

## Image pipeline

Signed direct-to-Cloudinary upload from the browser (the API secret never
leaves the server). After upload, a Server Action re-fetches the resource
from Cloudinary's Admin API and validates the *real* format/size/dimensions
before persisting — the client's report is never trusted. Cover image is
whichever row sits at `position = 0`; reordering (including "make cover")
goes through an atomic Postgres RPC so a partial failure can never leave
duplicate/skipped positions.

## Deployment (not yet done — see docs/IMPLEMENTATION_STATE.md)

Intended target: Vercel (Next.js) + Neon Postgres + Cloudinary. Configure the
same variables from `.env.example` in Vercel; no database credentials are
committed to this repository.
