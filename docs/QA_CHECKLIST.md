# ALTAVISTA — QA Checklist

## Quality gates

Do not declare completion until the applicable gates are green.

### Static/build

- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] production build passes
- [ ] no avoidable warnings
- [ ] no hydration errors

## Unit tests

Cover logic such as:

- [ ] slug generation
- [ ] duplicate slug handling
- [ ] slug history policy
- [ ] price formatting USD/DOP
- [ ] NEGOTIABLE / CONTACT price behavior
- [ ] WhatsApp URL/message encoding
- [ ] type normalization
- [ ] location normalization
- [ ] attribute validation/order/duplicate labels
- [ ] publication contract
- [ ] status visibility mapping
- [ ] image transform builder

## Database/security tests

Against local/real Supabase when possible:

- [ ] anon cannot read DRAFT
- [ ] anon cannot write
- [ ] authenticated non-admin cannot write
- [ ] admin can create/update/delete
- [ ] publication validation enforced
- [ ] image rows cascade appropriately
- [ ] RLS cannot be bypassed by normal client calls

## Public E2E

- [ ] homepage loads
- [ ] published products come from persistence
- [ ] arbitrary inventory beyond six remains reachable
- [ ] card opens correct product
- [ ] detail shows correct title/price/specs/status
- [ ] gallery next/prev works
- [ ] gallery keyboard works
- [ ] lightbox works
- [ ] WhatsApp context includes product + URL
- [ ] phone link correct
- [ ] email link correct
- [ ] search works
- [ ] filters work
- [ ] sorting works
- [ ] RESERVED displays correctly
- [ ] SOLD absent from default catalog
- [ ] SOLD direct URL remains live
- [ ] DRAFT direct URL not public
- [ ] mobile nav works
- [ ] 404 works
- [ ] empty catalog state works
- [ ] zero search results state works

## Admin E2E

- [ ] unauthenticated `/admin` blocked
- [ ] bad login handled generically
- [ ] admin login works
- [ ] dashboard loads real counts
- [ ] create draft works
- [ ] incomplete draft may save
- [ ] incomplete draft cannot publish
- [ ] multi-image upload works
- [ ] per-file progress/error works
- [ ] invalid image rejected
- [ ] HEIC/HEIF tested when environment permits
- [ ] image reorder persists atomically
- [ ] cover change works
- [ ] alt text update works if implemented
- [ ] publish works
- [ ] published item appears publicly
- [ ] edit works
- [ ] reserve works
- [ ] sold works
- [ ] unpublish works
- [ ] delete confirmation works
- [ ] logout works

## Responsive QA widths

Inspect at least:

- [ ] 320
- [ ] 375
- [ ] 390
- [ ] 430
- [ ] 768
- [ ] 1024
- [ ] 1280
- [ ] 1440
- [ ] 1920

These are QA targets, not mandatory breakpoint values.

## Responsive checks

- [ ] no horizontal overflow
- [ ] no clipped headings
- [ ] no tiny tap targets
- [ ] nav does not collide
- [ ] cards remain coherent
- [ ] detail summary does not overflow
- [ ] gallery controls usable
- [ ] mobile contact action does not cover content
- [ ] filters usable on mobile/tablet
- [ ] admin table/list adapts properly
- [ ] image manager works on touch-sized layouts

## Accessibility

- [ ] semantic landmarks
- [ ] logical heading order
- [ ] links vs buttons correct
- [ ] labels on form fields
- [ ] `aria-invalid`/described errors where useful
- [ ] visible `:focus-visible`
- [ ] keyboard navigation
- [ ] dialogs trap/restore focus
- [ ] Esc closes dialogs/lightbox/menu
- [ ] touch targets usable
- [ ] alt text behavior correct
- [ ] reduced motion honored
- [ ] contrast reviewed
- [ ] axe checks if practical

## Visual reference QA

Authoritative files:

- `C:\Users\hduran\Downloads\altavistaReferenciaLanding.png`
- `C:\Users\hduran\Downloads\altavistaReferenciaDetalles.png`

For both pages:

- [ ] screenshot at 1440
- [ ] screenshot at 1024
- [ ] screenshot at 768
- [ ] screenshot at 390
- [ ] 320 overflow check

Review:

- [ ] hero proportion
- [ ] typography hierarchy
- [ ] whitespace
- [ ] section spacing
- [ ] container width
- [ ] card dimensions
- [ ] card gaps
- [ ] image crops
- [ ] price hierarchy
- [ ] badges
- [ ] detail gallery balance
- [ ] contact card
- [ ] specification alignment
- [ ] footer
- [ ] tablet composition
- [ ] mobile composition

Loop: implement → render → screenshot → compare → fix → render again.

## Image QA

Test:

- [ ] portrait
- [ ] square
- [ ] panorama
- [ ] high-resolution
- [ ] low-resolution
- [ ] large original
- [ ] HEIC/HEIF if possible

Confirm:

- [ ] no distortion
- [ ] no card collapse
- [ ] no severe CLS
- [ ] no huge mobile image request
- [ ] low-res warning behaves correctly

## Browser/network QA

- [ ] console: 0 errors
- [ ] console: 0 hydration errors
- [ ] network has no obvious failed resources
- [ ] mobile image payload is reasonable
- [ ] no original multi-MB image is used for small cards

## Performance

Inspect:

- [ ] LCP candidate
- [ ] CLS
- [ ] public JS bundle
- [ ] image sizes
- [ ] font loading
- [ ] DB query count
- [ ] N+1 behavior
- [ ] caching/revalidation

## Final code review

Look for and fix:

- [ ] duplication
- [ ] unused code/deps
- [ ] unsafe casts
- [ ] client/server leakage
- [ ] authorization gaps
- [ ] brittle absolute positioning
- [ ] dead controls
- [ ] unhandled errors
- [ ] inconsistent tokens
- [ ] speculative abstractions
