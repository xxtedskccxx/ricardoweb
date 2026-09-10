# ALTAVISTA — Implementation Plan

Use this as the execution sequence. Claude may adjust ordering only when it clearly reduces risk or rework.

## Phase 0 — Bootstrap

Create:

- project directory
- current stable Next.js app with pnpm
- strict TypeScript
- Tailwind
- `.gitignore`
- `.env.example`
- Git repository
- `CLAUDE.md`
- docs
- copied visual references

Gate:

- project runs locally
- typecheck/lint/build baseline clean
- both reference images readable

## Phase 1 — Domain + database

Implement:

- Supabase project/local setup
- SQL migrations
- RLS
- admins
- generic products
- ordered JSONB attributes
- product images
- slug history
- normalization helpers
- status transitions
- publication contract
- generated types
- Zod schemas

Gate:

- database/security tests green
- drafts proven private

## Phase 2 — Image architecture

Implement:

- Cloudinary integration
- signed upload endpoint
- server verification
- responsive delivery
- reusable image primitives
- card crop behavior
- detail image behavior
- awkward image fixtures

Gate:

- portrait/square/panorama render without distortion or severe CLS

## Phase 3 — Public shell + landing

Implement from actual landing reference:

- header/nav
- hero
- unified `En venta` section
- responsive product grid
- product cards
- footer/contact

Use real persistence, not hard-coded JSX products.

Gate:

- visual QA at 1440/1024/768/390
- no horizontal overflow

## Phase 4 — Catalog

Implement:

- `/en-venta`
- pagination/progressive loading
- search
- type filter
- location filter
- price/sort where practical
- empty/error states
- sold inclusion behavior if exposed

Gate:

- E2E search/filter/sort green
- inventory beyond six remains reachable

## Phase 5 — Product detail

Implement from actual detail reference:

- breadcrumbs
- gallery
- thumbnails
- lightbox
- summary
- price/status/location
- dynamic specs
- full description
- contact card
- WhatsApp/phone/email
- related inventory
- metadata/SEO
- slug redirects
- 404 behavior

Gate:

- public detail E2E green
- reference visual QA green

## Phase 6 — Auth/admin shell

Implement:

- Supabase SSR auth
- `/admin/login`
- no public registration
- admin middleware UX
- server authorization
- admin layout
- dashboard

Gate:

- anon blocked
- non-admin blocked
- admin access verified

## Phase 7 — Admin product CRUD

Implement:

- product list
- search/filter/pagination
- create draft
- grouped edit form
- price/currency
- location/type normalization
- dynamic attribute editor
- publish/unpublish
- available/reserved/sold
- delete confirmation

Gate:

- CRUD/status E2E green

## Phase 8 — Admin image manager

Implement:

- multi-upload
- progress
- preview
- retry
- atomic reorder
- cover selection
- alt text
- remove
- low-res warning
- cleanup fallback

Gate:

- image admin E2E green
- invalid upload rejection green

## Phase 9 — Responsive + accessibility polish

Inspect all public/admin routes.

Gate:

- no overflow
- keyboard works
- focus works
- dialogs accessible
- reduced motion works
- axe findings resolved where practical

## Phase 10 — Full E2E

Run public/admin suites on representative desktop/mobile.

Gate:

- critical flows green

## Phase 11 — Final visual QA

Compare rendered landing/detail with references.

Iterate until spacing, hierarchy, image crops, typography, cards, and composition are clearly in the same design family.

Gate:

- screenshots stored
- obvious visual defects fixed

## Phase 12 — Final audit

Review:

- security
- performance
- code quality
- secrets
- dead controls
- console/network
- README

Final gate:

- typecheck
- lint
- unit tests
- DB/integration tests where environment allows
- E2E
- build
- browser console clean
- responsive/visual QA complete

Do not deploy or push without explicit permission.
