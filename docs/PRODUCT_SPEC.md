# ALTAVISTA — Product Specification

## 1. Product definition

ALTAVISTA is a premium digital sales catalog for **one owner** in the Dominican Republic.

The owner can publish anything they want to sell. Real estate is likely to be the dominant inventory type, but the system must also support vehicles, motorcycles, boats, yachts, watches, furniture, land, electronics, collectibles, luxury objects, and arbitrary future item types.

The system is **not a marketplace**.

## 2. Core journeys

### Public

Landing → browse items for sale → open item → inspect images/information/specifications → contact owner.

### Admin

Login → dashboard → create draft → enter data → upload/reorder/select cover image → publish → verify publicly → edit later → reserve/sell/unpublish/delete.

## 3. Public routes

Recommended:

- `/`
- `/en-venta`
- `/producto/[slug]`
- `/admin/login`
- `/admin`
- `/admin/productos`
- `/admin/productos/nuevo`
- `/admin/productos/[id]`

Keep public URLs clean, stable, human-readable, and SEO-friendly.

## 4. Landing page

Use the visual direction in `DESIGN_REFERENCE.md`.

The landing should communicate immediately:

- premium single-owner collection
- items currently for sale
- Dominican context
- easy browsing
- easy contact

### Hero

Keep it spacious and image-led.

Use:

- concise headline
- short support copy
- one strong primary CTA
- optional quiet contact action

Avoid stats, floating dashboards, fake testimonials, multiple competing CTAs, or decorative noise.

### Inventory

Use one unified section: **En venta**.

Do not split the homepage into separate category sections such as “Propiedades destacadas” and “Vehículos destacados”. Type/category may appear as a small badge or filter, but inventory is unified.

There is no item-count limit.

Recommended responsive grid:

- desktop: 3 columns
- tablet: 2 columns
- mobile: 1 column

Products continue below as inventory grows. Use pagination or sensible progressive loading at scale; never impose a business limit of six.

## 5. Product cards

Cards must be compact, elegant, and scannable.

Show only meaningful information:

- cover image
- optional type label
- title
- price
- location when relevant
- status when relevant
- up to 3 dynamic specs

Examples:

### Property

- Villa Frente al Mar
- US$ 4,200,000
- Punta Cana, La Altagracia
- 5 hab · 5.5 baños · 650 m²

### Vehicle

- Toyota Land Cruiser 300
- US$ 125,000
- Santo Domingo
- 2023 · 24,000 km · 3.3L Diesel

### Watch

- Rolex Submariner
- US$ 12,500
- Santo Domingo
- Excelente estado · Caja incluida · Documentos

Never force property fields onto arbitrary items.

The card should be a real link, with keyboard focus and pointer/touch states.

## 6. Catalog

`/en-venta` exposes the full published inventory.

Useful features:

- text search
- type filter
- location filter
- price range if practical
- sorting: newest, price ascending, price descending
- optional sold inclusion toggle

Prefer URL search params so filters are shareable and back-button-safe.

Do not download the full unbounded inventory and filter everything only in the browser.

## 7. Product detail

The page must work for properties, vehicles, watches, land, boats, and arbitrary items.

Required:

- breadcrumbs
- image gallery
- title
- type
- availability
- price
- location when relevant
- primary specifications
- full description
- complete dynamic specs
- contact card/actions
- optional real location/map link when configured
- more items for sale

Hide irrelevant sections cleanly.

## 8. Contact

Primary conversion options:

- WhatsApp
- telephone
- email
- Instagram if configured

WhatsApp message must include product title and canonical URL.

Example:

`Hola, estoy interesado en "Villa Frente al Mar". Vi el artículo aquí: [URL]`

Use real `tel:`, `mailto:`, and WhatsApp links.

Do not implement checkout.

Do not implement a contact form in V1 unless later requested.

## 9. Status behavior

- `DRAFT`: never public.
- `AVAILABLE`: normal public listing.
- `RESERVED`: still public, visibly marked, contact remains available.
- `SOLD`: hidden from default catalog but direct URL remains live and marked sold.

## 10. Generic product model

Required concepts:

- id
- slug
- title
- short_description
- description
- type
- type_normalized
- price
- currency
- price_mode
- location
- location_normalized
- status
- homepage_position nullable
- attributes ordered JSONB
- published_at
- created_at
- updated_at

Supported currency at minimum:

- USD
- DOP

Price modes:

- FIXED
- NEGOTIABLE
- CONTACT

## 11. Dynamic attributes

Use an ordered JSONB array:

```json
[
  {"label":"Habitaciones","value":"4"},
  {"label":"Baños","value":"4.5"},
  {"label":"Área","value":"520 m²"}
]
```

Requirements:

- order preserved
- labels unique case-insensitively
- reasonable max count
- validated with Zod
- reorderable in admin
- first 3 may be shown on cards

Do not build a dynamic-schema platform.

## 12. Type and location normalization

Prevent filtering fragmentation caused by casing or whitespace.

`Punta Cana`, `punta cana`, `PUNTA CANA`, and `Punta   Cana` should normalize to the same searchable value while preserving a human-readable display value.

Apply same principle to product type.

## 13. Homepage priority

`homepage_position` is optional and only controls prominence/order. It is not a limit.

If no position is set, use normal catalog order. If useful, the homepage may prioritize positioned products first, then fill with newest available products.

## 14. Publication contract

Drafts may be incomplete.

Publishing must fail server-side unless minimum requirements are valid, including:

- title
- slug
- type
- price configuration
- required description/content
- at least one persisted image
- valid cover image
- valid status transition

## 15. Admin UX

Admin is for the non-technical owner.

Product form sections should be grouped:

- Información básica
- Precio
- Ubicación
- Especificaciones
- Imágenes
- Publicación

Support:

- create
- edit
- draft
- publish
- unpublish
- available/reserved/sold
- delete with confirmation
- arbitrary specs
- image upload/reorder/cover/remove/retry
- search/filter/pagination in admin list

Do not expose database vocabulary unnecessarily.

## 16. Site settings

Centralize:

- brand name
- logo
- WhatsApp
- phone
- email
- Instagram
- country/location
- default currency
- hero copy/media if configured

Do not duplicate contact values across components.
