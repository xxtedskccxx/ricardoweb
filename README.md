# ALTAVISTA — Claude Code Project Pack

This package contains the durable project specification and working documents for building ALTAVISTA from zero with Claude Code in Goal Mode.

## How to use

1. Put this folder content in the future project root at:
   `C:\Users\hduran\Desktop\Altavista`
2. Keep Goal Mode enabled.
3. Copy the contents of `docs/GOAL_CONDITION.md` into Claude Code's **Goal condition** field.
4. Start Claude from `C:\Users\hduran\Desktop` or the Altavista project root.
5. Tell Claude to read `CLAUDE.md` and all files under `docs/` before implementation.
6. Make sure these visual references exist before public UI work begins:
   - `C:\Users\hduran\Downloads\altavistaReferenciaLanding.png`
   - `C:\Users\hduran\Downloads\altavistaReferenciaDetalles.png`
7. Claude must copy the references into `references/` once the project exists, without modifying the originals.

## Core product

ALTAVISTA is a premium, single-owner sales catalog. The owner can publish properties, vehicles, boats, watches, furniture, collectibles, or any other item. There is no multi-vendor model, no cart, no checkout, and no public customer account. The primary conversion is contacting the owner.

## Documents

- `CLAUDE.md` — permanent rules Claude must always follow.
- `docs/GOAL_CONDITION.md` — short Goal Mode completion condition (<4000 chars).
- `docs/PRODUCT_SPEC.md` — complete product and UX specification.
- `docs/DESIGN_REFERENCE.md` — visual reference analysis requirements.
- `docs/ARCHITECTURE.md` — approved technical architecture and data model.
- `docs/IMAGE_PIPELINE.md` — image upload, processing, storage, responsive delivery, and QA.
- `docs/SECURITY.md` — auth, authorization, RLS, secrets, upload security, and threat model.
- `docs/QA_CHECKLIST.md` — automated, visual, responsive, accessibility, and performance QA.
- `docs/IMPLEMENTATION_PLAN.md` — implementation phases and gates.
- `docs/IMPLEMENTATION_STATE.md` — persistent progress tracker Claude must update during Goal Mode.
- `docs/START_PROMPT.md` — concise first message to send Claude after the docs are present.

## Scope discipline

Do not add multi-vendor features, cart, checkout, payments, shipping, CRM, customer accounts, seller profiles, vendor ratings, or speculative analytics unless explicitly requested later.
