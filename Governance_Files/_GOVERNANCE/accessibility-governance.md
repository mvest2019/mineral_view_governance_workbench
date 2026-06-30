# Accessibility Governance

> **Status:** ENHANCED (deep) · **Owner:** Frontend · **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly + per major UI change
> **Companion:** `frontend-governance.md`, `design-ux-and-screenshot-governance.md`, `page-governance.md`.

---

## 1. Purpose & scope
Ensure the site is usable by everyone and meets accessibility expectations across pages, forms, the map, and data tables. Accessibility also reinforces the brand's "Empowerment" value — an owner can't be empowered by data they can't perceive or operate.

## 2. Rules (MUST)
Semantic HTML; logical heading order (exactly one H1 per page); labeled form fields; visible focus states; full keyboard navigation; sufficient color contrast (navy/teal text **must** meet contrast); meaningful alt text; clear, announced error messages; ARIA only where needed; mobile accessibility.

## 3. Surface-specific rules
| Surface | Requirement |
|---|---|
| Forms | Labels + announced errors; required state programmatic (not color-only); phone field labeled |
| Map | Provide non-map access to key data where feasible; keyboard-operable controls |
| Data tables / dossier | Proper header associations; meaning not conveyed by color alone |
| Modals/toasts | Focus management; dismissible; announced |

## 4. QA checklist
☐ Semantic structure ☐ One H1 + logical order ☐ Labels ☐ Focus states ☐ Keyboard nav (no traps) ☐ Contrast (navy/teal) ☐ Alt text ☐ ARIA correct ☐ Errors announced ☐ Mobile.

## 5. Anti-patterns
Color-only meaning; missing labels; keyboard traps; low contrast; multiple/zero H1s; unlabeled icons; modals that trap or lose focus.

## 6. Evidence notes & gaps
Grounded in the frontend design system (Lexend/navy-teal). A formal accessibility audit is **Not confirmed from the uploaded files**.

---

## Deep context (2026-06-30) — accessibility baseline

**Baseline (MUST) on every public page and app surface:** semantic structure with exactly one H1 and logical headings; labeled form controls and clear error/focus states; keyboard operability for all interactive elements (map controls, popups, claim flows, report downloads); sufficient color contrast against the navy/teal system; descriptive alt text on images; no information conveyed by color alone.

**Application specifics:** map popups (well/lease/permit/completion), modals, and the engagement popups are keyboard-reachable and dismissible; dashboards/tables expose accessible semantics; the mobile app follows platform accessibility guidance. Accessibility is part of the **launch/update QA checklist** — a surface that fails the baseline doesn't ship.
