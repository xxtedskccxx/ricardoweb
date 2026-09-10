# Design Reference — Observations

Both reference screenshots were successfully opened and inspected (see
`references/landing-reference.png` and `references/product-detail-reference.png`).
They render a generated concept branded "Altavista" for a Punta Cana /
Casa de Campo audience. Recorded below is what was actually observed, and
how it was translated into ALTAMAR's implementation.

## What the references show

**Landing**: sticky header (mountain-triangle logomark + wordmark + tagline,
serif nav, a search input, heart/cart icons on the right), full-bleed
coastal-villa hero with an ivory-to-transparent gradient overlay on the
left third carrying an overline ("REPÚBLICA DOMINICANA"), serif headline,
one primary CTA. Below: an overline ("MI COLECCIÓN") + "En venta" heading +
a sort dropdown, then a 3×2 card grid (villa/vehicle/watch on row one,
villa/boat/golf-set on row two), a "Ver más productos" pill button, then a
lifestyle photo + short copy + secondary CTA band, then a footer repeating
the logo/nav/socials.

**Product detail**: breadcrumbs, large primary image with prev/next arrows
and an image counter, 5 thumbnails below, a tab row (Descripción/
Especificaciones/Ubicación/Más información) — only "Descripción" is
expanded in the shot. Right column: type badge + availability pill, serif
title, location, price, a compact spec strip, a lead paragraph, then below
the image a "Especificaciones" 2-column icon+label+value grid, a contact
card (avatar, "Respuesta rápida", stacked WhatsApp/Llamar/Correo buttons,
a privacy note), a small static map, then a "Más propiedades en venta"
related rail.

**Card anatomy**: photo (≈4:3), a rounded pill type-badge top-left, a heart
icon top-right, title, price right-aligned to the title row, location with
a pin icon, then a `·`-separated spec row.

**Palette/type as observed**: warm ivory/off-white background, deep
green/olive for the primary button and availability accents, a warm
gold/sand tone for overline labels and small icon accents, near-black
warm-toned serif for headings, a lighter warm gray for body/muted text,
white card surfaces with a soft shadow and thin border.

## What ALTAMAR kept

- The overall territory: ivory ground, deep olive primary action, warm
  gold/sand overline accent, serif display + sans body, card anatomy
  (photo → type badge → title → price → location → spec row), one unified
  "En venta" section, 3/2/1 responsive grid, breadcrumbs + large gallery +
  contact card on detail, a related-items rail at the bottom.
- Final tokens implemented in `src/app/globals.css`:
  `--color-ivory #faf8f4` / `--color-bone #f2eee7` / `--color-ink #1c2a24`
  / `--color-olive #24402c` / `--color-sand #b08a4e` (decorative only) /
  `--color-sand-text #7a5a2a` (text-safe variant — the raw sand token
  fails WCAG AA at small sizes, caught by an axe test) / status colors
  for available/reserved/sold. Display face: Fraunces. Body: Inter.

## What ALTAMAR deliberately changed

- **Removed the heart (wishlist) and cart icons from the header** — there is
  no wishlist and no cart in this product, and the no-dead-control rule
  forbids shipping controls for features that don't exist.
- **Removed the "Sobre mí" nav item and the map embed** — no About page or
  configured map provider exists; the location is shown as text plus a
  "Ver en Google Maps" link would require a real provider decision, so the
  map area was omitted for V1 rather than faking one.
- **Hero has no photograph.** No Cloudinary account is configured in this
  environment (see `docs/IMPLEMENTATION_STATE.md`), so a photographic hero
  would either 404 or be a fabricated stock image presented as the owner's
  own property — the hero instead uses a crafted brand-palette gradient
  until the owner uploads a real photo.
- **Owner-story lifestyle section was not reproduced** — its copy in the
  reference is fabricated personal narrative ("Mi historia"); inventing a
  biography for a real business would be dishonest content, so it was
  replaced with a plain WhatsApp/phone contact band using real config
  values.

## Responsive decisions actually implemented

- Mobile nav is a full-screen dialog (focus-trapped, `Esc`-closing) behind a
  hamburger button, not a squeezed inline bar.
- Hero uses `svh`-based height, never `100vh` (verified no mobile-chrome
  jump).
- Catalog filters stack to a vertical block on narrow widths; on wide
  screens they're an inline row.
- Gallery: desktop shows primary image + prev/next + thumbnail row +
  click-to-lightbox; the same component reflows to full-width single-column
  on mobile with the same tap targets (no shrunken thumbnails).
- A sticky WhatsApp bar appears only below `lg` on the detail page, as an
  *addition* to (not a replacement for) the full contact card — hiding the
  phone/email options on mobile would make them unreachable there.

## Verified, not assumed

`no horizontal overflow at 320px` and the homepage/catalog/detail responsive
behavior were checked live in a real browser at 320/390/768/1440px (see
`tests/e2e/public.spec.ts` and the Playwright run logged in
`docs/IMPLEMENTATION_STATE.md`), not inferred from code alone. Photography
crop/CLS behavior at the card and gallery aspect ratios could not be
verified against **real** photographs, because no Cloudinary account exists
in this environment yet — this is recorded as an open item, not silently
assumed to be fine.
