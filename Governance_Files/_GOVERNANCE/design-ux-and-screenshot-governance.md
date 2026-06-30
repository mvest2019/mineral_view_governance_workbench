# Design, UX & Screenshot Governance

> **Status:** ENHANCED (deep) · **Owner:** Design/Frontend · **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly
> **Companion:** `accessibility-governance.md`, `media-and-assets-governance.md`, `frontend-governance.md`, `feature-inventory-reference.md`.

---

## 1. Purpose & scope
Govern visual design, navigation, UX patterns, and **screenshot usage** so the product looks consistent, trustworthy, and never leaks PII or misrepresents capability through a stale or demo screenshot.

## 2. Design system (confirmed)
**Lexend** font; **navy/teal** palette. Ad-hoc colors/fonts are prohibited — use the design tokens. Components are reused (nav, cards, tables, dossier widgets, per-persona pricing tables). Mobile parity is required. In-app **modals/toasts** replace browser `alert`/`confirm`/`prompt`.

## 3. Navigation & layout
Consistent nav taxonomy (Mineral Owners · Know Your Operators · Map · Explore). Clear hierarchy; **one primary CTA per view**; progressive disclosure where forms are complex (e.g., the claim-search modal's "all fields optional" note).

## 4. Screenshot rules (MUST)
- Screenshots reflect **current** UI.
- **Do not** present demo/test values as real — e.g., Brent $95.33, MVestimate $131M are **illustrative**, never cited as facts.
- **Mask all PII/secrets** in screenshots (owner names/addresses, keys, internal config, account data).
- Screenshots used in marketing follow the same claim rules as copy (no implied guarantee/coverage).

## 5. UX QA checklist
☐ Design tokens (Lexend/navy-teal) ☐ Responsive + mobile parity ☐ One primary CTA ☐ Accessible ☐ In-app modals (not browser alerts) ☐ Screenshots current ☐ No PII/demo-as-real ☐ No claim via screenshot.

## 6. Anti-patterns
Ad-hoc colors/fonts; browser alert/confirm/prompt; competing CTAs; screenshots with real PII or demo-as-real values; stale UI screenshots implying current capability.

## 7. Evidence notes & gaps
Design system, modal/toast system, and the demo-value caution are confirmed from prior UI work + screenshots. The full component inventory is **Not confirmed from the uploaded files**.

---

## Deep context (2026-06-30) — design system & screenshot truth

**Design system.** Consistent UI across owner and professional surfaces: dark navy sidebar, **teal** accents, **Lexend** typography, reusable components. Frontend favors **incremental, targeted changes** over redesigns; new UI matches the system rather than introducing one-off styles.

**UX rules (MUST):** tier-aware UI (never show actions a tier can't perform); clear primary CTA per surface; consistent claim/portfolio/map/report components; accessible (labels/contrast/focus/keyboard) and performant (Core Web Vitals); mobile parity as the mobile app matures.

**Screenshot truth (MUST):** marketing/docs screenshots show the **current UI** with **realistic, non-misleading** data and **masked owner PII**; stale screenshots are refreshed when the UI changes (tracked in the screenshot inventory). A screenshot that overstates coverage/accuracy is a P2 violation, not a design choice.
