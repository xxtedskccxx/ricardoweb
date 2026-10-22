# ALTAVISTA — Image Pipeline

## Objective

The owner uploads images without manually creating desktop/tablet/mobile versions. The system automatically stores originals and delivers optimized responsive derivatives.

Images must never stretch, distort, overflow, or cause avoidable layout shift.

## Provider

Use Cloudinary unless a verified implementation blocker appears.

## Supported uploads

Verify current Cloudinary support during implementation and support when available:

- JPEG
- PNG
- WebP
- AVIF
- HEIC
- HEIF

HEIC/HEIF are important because uploads may come directly from iPhones.

## Upload flow

1. Admin selects one or multiple files.
2. Client performs UX-only checks for type and size.
3. Client requests a short-lived upload signature from a protected server endpoint.
4. Server verifies authenticated admin before signing.
5. Browser uploads directly to Cloudinary.
6. Client returns Cloudinary identifiers to a server action.
7. Server verifies the stored Cloudinary resource using authoritative provider metadata.
8. Persist only after real format, size, width, height, and identifier are validated.
9. If verification fails, destroy the uploaded resource and reject persistence.

Never trust filename extensions or client-reported MIME as authority.

## Secrets

Never expose:

- Cloudinary API secret
- `DATABASE_URL` and `AUTH_SECRET`
- privileged signatures

in public/browser code.

## Upload restrictions

Use provider/server controls for:

- allowed formats
- max file size
- product-scoped folder
- short-lived signature

Suggested V1 max upload size: approximately 15 MB, configurable.

## Admin image manager

Required:

- multi-upload
- per-file progress
- preview
- per-file error
- retry
- reorder
- choose cover
- remove
- optional alt text edit
- low-resolution warning

Partial upload success must be preserved.

## Ordering

Image order must be persisted atomically.

Do not perform a naive one-by-one update that can leave duplicate/partial positions after failure.

Use one server-side transaction/RPC or equivalent atomic operation.

Cover is position `0`.

## Delivery

Use Cloudinary responsive transforms with appropriate Next.js integration.

Avoid double optimization through two CDNs when not necessary.

### Cards

- consistent visual aspect ratio, approximately 4:3 unless the visual reference clearly dictates otherwise
- crop with content-aware gravity where appropriate
- original remains untouched

### Detail

- preserve more of the original composition
- use contain/limit strategy where appropriate
- derive stable aspect behavior from stored dimensions
- support portrait, landscape, square, and panorama

### Lightbox

- larger capped derivative
- keyboard and touch navigation

## Responsive behavior

Correct `sizes`/responsive widths must prevent mobile from downloading desktop-scale images.

Only genuinely above-the-fold media should be prioritized.

Below-fold images lazy load.

## Low-resolution uploads

Warn rather than block unless genuinely unusable.

A practical warning threshold can be based on width and intended use.

## Failure behavior

### Upload/sign failure

- explain clearly in admin
- do not silently fail
- allow retry

### Cloudinary delete failure

Do not block the admin's product operation solely because remote cleanup failed.

Record/log orphan media for later cleanup.

Do not add workers/message brokers solely for V1 media cleanup.

## QA asset set

Test deliberately with:

- 1:2 portrait
- square
- 3:1 panorama
- large high-resolution image
- low-resolution image
- very large original
- HEIC/HEIF when environment permits

Confirm:

- no distortion
- no horizontal overflow
- no severe CLS
- card consistency
- detail usability
- mobile receives reasonable payload
