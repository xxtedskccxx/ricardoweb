# ALTAVISTA — Security Contract

## Principle

`/admin` is a real privileged surface. Hiding a URL is never security.

## Authentication

Use a short-lived HS256 token in a secure, httpOnly cookie. Verify the token
and the corresponding row in `admins` on every server request.

V1 auth:

- email + password
- no public registration
- no signup route
- no client-side role trust

Admin accounts are explicitly created/authorized.

## Authorization layers

### 1. Routing/middleware

Refresh/route session and redirect unauthenticated admin visitors for UX.

This is not the final security boundary.

### 2. Server authorization

Every privileged admin query/mutation must call a central `requireAdmin()`-style guard.

Validate authenticated user against the `admins` table.

Server authorization happens before mutation logic.

### 3. Database boundary

The Neon connection string is server-only. Public SQL statements explicitly
exclude drafts, while every admin statement runs only after `requireAdmin()`.
The database role is never sent to the browser.

## Draft leakage

Draft visibility must be blocked at database level, not merely by remembering to add `where status != DRAFT` in app code.

## Server validation

Use Zod at every mutation boundary.

Validate:

- product fields
- price/price mode
- status transitions
- dynamic attributes
- slug values
- image metadata
- image reorder payloads
- publication contract

Client validation is UX only. Server validation is authoritative.

## Publication security

Do not allow a manipulated client request to bypass publication requirements.

Publishing must validate server-side:

- product completeness
- legal status transition
- persisted cover image
- current admin authorization

## Upload security

Signing route must require admin authentication.

Upload signatures must be short lived and scoped.

After upload, server must re-verify Cloudinary resource metadata before DB persistence.

Never trust extension or client MIME.

## Secrets

Never expose server secrets through `NEXT_PUBLIC_*` variables.

Privileged values include:

- Cloudinary API secret

Provide `.env.example` with names only.

No real secret may enter Git history.

## XSS

Do not render unsanitized HTML.

Descriptions may render as plain text with preserved line breaks.

Do not use `dangerouslySetInnerHTML` unless a future sanitized rich-text feature explicitly requires it.

## SQL injection

Use parameterized Neon queries. Dynamic filters are assembled from fixed SQL
fragments and `$n` placeholders; never interpolate user input into SQL text.

## CSRF / origin

Follow current framework guidance for Server Actions and route handlers. Protected media signing must verify session and expected origin behavior.

## Login UX

Use generic login failure text to avoid user enumeration.

## Destructive actions

Product delete requires explicit confirmation naming the product.

Image delete must be intentional.

Do not allow accidental destructive actions through ambiguous UI.

## Status transitions

Define valid transitions and enforce them server-side.

Do not trust a client-submitted arbitrary status.

## Security QA

Before completion, test/review:

- direct access to `/admin`
- direct calls to admin mutations
- unauthenticated upload signing
- authenticated non-admin writes
- draft direct URL
- draft search/catalog leakage
- malformed product IDs
- manipulated status transitions
- image metadata tampering
- secret exposure in browser bundle
- database-role and query boundary behavior
- destructive operations
