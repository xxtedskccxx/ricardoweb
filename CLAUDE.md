# ALTAVISTA — Permanent Claude Code Rules

## Product invariant

ALTAVISTA is a **single-owner sales catalog**. One owner publishes items they personally have for sale. Real estate is expected to be prominent, but inventory may include vehicles, boats, watches, land, furniture, electronics, collectibles, or any arbitrary item.

Never introduce:

- vendors or seller accounts
- marketplace concepts
- public registration
- customer accounts
- cart
- checkout
- payments
- shipping
- order management
- reviews/ratings
- bidding
- CRM
- speculative analytics

**Contact is the conversion.** Public actions are browsing, viewing details, and contacting the owner.

## No inventory limit

There is **no maximum of 6 products**. The owner may publish arbitrary inventory. A 3x2 grid is only a visual composition, never a business or database limit.

## Generic product rule

The product domain must remain generic. Do not create separate database tables for properties, vehicles, watches, etc. New item types must not require a schema migration.

Use dynamic ordered attributes for type-specific specifications.

## Visual references

Before public UI implementation, inspect both files:

- `C:\Users\hduran\Downloads\altavistaReferenciaLanding.png`
- `C:\Users\hduran\Downloads\altavistaReferenciaDetalles.png`

Copy them into `references/` once the project exists. Do not modify the originals.

Do not claim visual completion until browser screenshots have been compared against both references.

## Visual direction

The public site must feel premium, modern, warm, spacious, Dominican, image-led, calm, trustworthy, and sophisticated.

Avoid:

- generic SaaS styling
- generic marketplace styling
- overcrowding
- excessive decoration
- fake luxury clichés
- AI-slop visuals
- meaningless UI
- excessive glassmorphism
- random gradients
- dead controls

Whitespace is intentional. Spacing, hierarchy, typography, and image crops must be deliberate.

## No-dead-control rule

Every visible interactive element must function.

Never ship:

- `href="#"`
- fake filters
- fake search
- fake dropdowns
- fake cart/wishlist
- fake map controls
- buttons without handlers
- controls for features that do not exist

If functionality is not implemented, remove the control.

## Stack direction

Prefer the current stable versions of:

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- pnpm
- Supabase PostgreSQL
- Supabase Auth
- Cloudinary
- Zod
- React Hook Form where useful
- dnd-kit for accessible image ordering
- Vitest
- Playwright

Do not pin an older Next.js major without a verified reason. Follow current official Supabase SSR/Auth guidance during implementation.

## Server/client rule

Use Server Components by default. Use `"use client"` only for real browser interactivity such as nav state, galleries, filters, forms, DnD, dialogs, and upload progress.

Database queries and privileged logic remain server-side.

## Security invariant

Admin security must have independent layers:

1. route/middleware UX protection
2. server-side `requireAdmin()`-style authorization
3. PostgreSQL RLS as the database boundary

Do not trust client roles, hidden URLs, or localStorage.

Draft products must be inaccessible to anonymous users at database level.

Never expose privileged secrets to browser code.

## Image invariant

Uploaded images must never stretch, distort, overflow, or cause avoidable layout shift.

Support automatic responsive delivery. The admin must not manually create desktop/tablet/mobile versions.

Use Cloudinary signed uploads and verify uploaded resources server-side before persistence.

Image reorder must persist atomically.

## Status policy

- `DRAFT`: never public.
- `AVAILABLE`: public and contactable.
- `RESERVED`: public, visibly marked reserved, contact still available.
- `SOLD`: excluded from default catalog, but direct product URL remains available and clearly marked sold.

## Publication invariant

Drafts may be incomplete. Publishing must fail server-side unless the minimum publication contract is satisfied, including valid basic data, valid price configuration, and at least one persisted cover image.

Do not rely only on disabled frontend controls.

## Code quality

- TypeScript strict.
- Avoid `any` and unsafe casts.
- Do not suppress errors just to make CI green.
- No business logic scattered through JSX.
- No hard-coded product cards in production UI.
- No client-side filtering of an unbounded full product table.
- No destructive Git or remote operations without explicit permission.

## QA invariant

A passing build does not mean the feature is done.

Before completion:

- typecheck passes
- lint passes
- tests pass
- production build passes
- critical public/admin E2E flows pass
- browser console is clean
- responsive QA is done
- accessibility is reviewed
- visual screenshots are compared against references
- image edge cases are tested
- security is reviewed
- obvious performance issues are fixed

## Goal Mode continuity

Keep progress in `docs/IMPLEMENTATION_STATE.md` and update it continuously.

Do not put temporary progress logs in this file.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
