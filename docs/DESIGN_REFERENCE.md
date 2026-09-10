# ALTAVISTA — Visual Reference Contract

## Authoritative references

Claude must successfully open and inspect these files before implementing the public UI:

- Landing: `C:\Users\hduran\Downloads\altavistaReferenciaLanding.png`
- Detail: `C:\Users\hduran\Downloads\altavistaReferenciaDetalles.png`

If either file cannot be read, public visual implementation must not be declared complete. Record the exact blocker in `IMPLEMENTATION_STATE.md` and continue unrelated backend/domain work.

Once the project exists, copy them to:

- `references/landing-reference.png`
- `references/product-detail-reference.png`

Do not modify the originals.

## What to study

Record observations for:

- hero composition
- navigation
- typography hierarchy
- line lengths
- whitespace
- section spacing
- container width
- grid rhythm
- product card width/height
- image aspect ratios and crops
- badge treatment
- price hierarchy
- detail-page gallery proportions
- detail summary column
- contact card
- spec layout
- footer
- desktop/tablet/mobile adaptation

## Design intent

The site should feel:

- premium
- contemporary
- warm
- Dominican
- sophisticated
- spacious
- image-led
- trustworthy
- calm
- elegant
- easy to understand

Avoid:

- overcrowding
- generic ecommerce templates
- SaaS dashboards
- marketplace density
- fake luxury clichés
- unnecessary glass effects
- decorative controls
- meaningless UI
- excessive animation

## Whitespace

Do not fill every empty area. Empty space is part of the composition.

Use clear section separation, generous vertical rhythm, and consistent horizontal gaps.

## Landing composition

The design family should preserve:

- clear brand/nav header
- premium Dominican hero imagery
- concise hero copy
- strong primary CTA
- one unified `En venta` inventory section
- compact cards
- 3-column desktop inventory rhythm
- calm lower-page content/contact/footer

The implementation does not need to copy every icon/control shown in a generated concept. If a reference contains cart/wishlist/search controls that are not real features, omit them.

## Product detail composition

Preserve the reference's broad structure:

- gallery-heavy left side
- summary/contact right side
- breadcrumbs
- status/type/price/location hierarchy
- concise lead description
- deeper description/specs below
- related inventory at the bottom

For non-property items, hide irrelevant sections and keep the layout balanced.

## Responsive interpretation

Do not simply stack desktop.

### Desktop

- generous max-width
- 3-column inventory
- split detail layout
- large gallery

### Tablet

- 2-column inventory
- intentional detail reflow
- readable nav/filters

### Mobile

- 1-column inventory
- deliberate hero crop/layout
- touch-friendly gallery
- no tiny thumbnails
- optional sticky contact action after gallery
- no horizontal overflow

## Visual QA loop

For landing and detail:

IMPLEMENT → RENDER → SCREENSHOT → COMPARE → FIX → RENDER AGAIN

Minimum screenshots:

- 1440px
- 1024px
- 768px
- 390px
- 320px overflow check

Compare art direction, not literal pixel identity.

Do not claim UI complete from code inspection alone.
