# ALTAVISTA — Technical Architecture

## Stack

Use current stable releases at implementation time.

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- pnpm
- Neon PostgreSQL (serverless HTTP driver)
- Signed httpOnly cookie auth
- Cloudinary
- Zod
- React Hook Form where beneficial
- dnd-kit for image reorder
- Vitest
- Playwright

Do not add a second ORM unless a demonstrated need justifies it.

## Suggested project structure

```text
src/
  app/
    (public)/
      page.tsx
      en-venta/page.tsx
      producto/[slug]/page.tsx
    admin/
      login/page.tsx
      (app)/
        layout.tsx
        page.tsx
        productos/page.tsx
        productos/nuevo/page.tsx
        productos/[id]/page.tsx
    api/
      media/sign/route.ts
    sitemap.ts
    robots.ts
  components/
    ui/
  features/
    products/
    admin/
  server/
    queries/
    actions/
    auth/
  lib/
    db.ts
    auth/
    cloudinary/
  schemas/
  config/
db/
  migrations/
references/
docs/
tests/
  unit/
  integration/
  e2e/
```

Adjust only when a simpler structure is clearly better.

## Server/client boundaries

Server Components by default.

Client components only for true browser state/interactivity:

- mobile nav
- interactive gallery/lightbox
- filter controls when necessary
- admin forms
- attribute editor
- image manager
- DnD
- dialogs/toasts

Database reads and privileged mutations remain server-side.

## Data model

### `admins`

- `id uuid primary key`
- `email text unique not null`
- `password_hash text not null` (scrypt)
- `created_at timestamptz`

### `products`

- `id uuid primary key`
- `slug text unique not null`
- `title text not null`
- `short_description text`
- `description text`
- `type text not null`
- `type_normalized text not null`
- `price numeric(14,2) nullable`
- `currency` enum or constrained text: `USD`, `DOP`
- `price_mode`: `FIXED`, `NEGOTIABLE`, `CONTACT`
- `location text nullable`
- `location_normalized text nullable`
- `status`: `DRAFT`, `AVAILABLE`, `RESERVED`, `SOLD`
- `homepage_position integer nullable`
- `attributes jsonb not null default []`
- `published_at timestamptz nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Do not add a vendor/seller field.

### `product_images`

- `id uuid primary key`
- `product_id uuid references products(id) on delete cascade`
- `public_id text unique not null`
- `width int not null`
- `height int not null`
- `format text not null`
- `bytes int not null`
- `alt text nullable`
- `position int not null`
- `created_at timestamptz`

Cover image is `position = 0`.

### `product_slug_history`

- `slug text primary key`
- `product_id uuid references products(id) on delete cascade`
- `created_at timestamptz`

Used for permanent redirects from old published slugs.

### Optional cleanup tracking

A simple media cleanup table is acceptable if Cloudinary delete retry needs tracking, but do not add worker infrastructure in V1 solely for this.

## Constraints and indexes

Implement appropriate constraints for:

- nonnegative price
- price required unless `price_mode=CONTACT`
- attributes is JSON array
- title/description reasonable length limits
- unique slug
- image ordering
- publication timestamp/status consistency where appropriate

Useful indexes:

- `(status, published_at desc)`
- `type_normalized`
- `location_normalized`
- `price`
- product search index
- `(product_id, position)`

## Search

Use Postgres-backed search/filtering. Avoid loading the entire catalog client-side.

## Publication

Drafts may be incomplete.

Publishing is a server-side transition with validation. At least one persisted image/cover is required.

## Slug policy

- Generate readable slug automatically.
- Resolve duplicates safely.
- Once published, avoid casually changing canonical URLs.
- If slug changes, store old slug and redirect permanently.

## Homepage order

`homepage_position` is optional priority, not a limit.

Do not create a six-slot schema.

## Caching

Use Next.js/server caching only where it is safe and invalidatable. Mutations must invalidate affected public data.

Do not allow stale cache to expose a draft or hide a newly published item indefinitely.
