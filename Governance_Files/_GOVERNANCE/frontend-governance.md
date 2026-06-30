# Frontend Governance (Mview-Presentation-Next)

> **Status:** ENHANCED (deep) · **Owner:** Frontend · **Reviewer:** SEO + Design + a11y · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + per significant page/component change · **Companion:** `seo-governance.md`, `accessibility-governance.md`, `design-ux-and-screenshot-governance.md`, `performance-and-technical-seo-governance.md`.

---

## 1. Purpose & scope
Govern the public **Next.js** site: routing, components, styling, SEO/meta, performance, accessibility, and merge gates. The frontend is where claims, pricing, and estimates become visible, so it inherits the constitution's labeling/disclaimer rules in addition to engineering standards.

## 2. Framework & architecture
Next.js public/presentation frontend with **NextAuth** for auth and SEO pages. Design system: **Lexend** font, **navy/teal** palette. In-app **modals/toasts** replace browser `alert`/`confirm`/`prompt`.

## 3. Routing & page rules (MUST)
Every page follows `page-governance.md`: exactly one H1, unique title tag, concise meta description, logical H2/H3, canonical tag, internal links to relevant glossary/FAQ, and one clear primary CTA. New routes are SEO-reviewed before merge.

## 4. Components & reuse
Reuse shared components (nav, cards, tables, dossier widgets, pricing tables) rather than duplicate. New components are documented and accessible. Pricing tables render **per persona** (never a merged grid) and read canonical values.

## 5. Styling conventions
Use design tokens (Lexend, navy/teal); **do not** introduce ad-hoc colors/fonts. Responsive by default; mobile parity required; contrast must meet accessibility on navy/teal text.

## 6. SEO/meta implementation
Each page emits title, meta description, canonical, and structured data where applicable (`seo-governance.md`). **Do not** ship pages with missing/duplicate titles or that index thin/private pages.

## 7. Data presentation rules (constitution)
Any surfaced estimate (MVestimate, EUR, decline, acre/well) **must** carry the estimate label, scenario/range where applicable, source, and vintage. **Do not** render demo/test values as real.

## 8. Performance & accessibility
Optimize images, defer non-critical JS, respect Core Web Vitals (`performance-and-technical-seo-governance.md`); show progressive loading for API-bound views. Semantic HTML, labeled forms (phone required + validated at registration), focus states, alt text, contrast (`accessibility-governance.md`).

## 9. Frontend QA / merge checklist
☐ One H1 + title/meta/canonical ☐ Responsive + mobile parity ☐ Accessible (labels/contrast/focus/keyboard) ☐ No console errors ☐ Images optimized + alt text ☐ Primary CTA present ☐ Estimates labeled + provenance ☐ Pricing per-persona + canonical ☐ No secrets in client bundle.

## 10. Evidence notes & gaps
Next.js + NextAuth + SEO pages confirmed from repo; Lexend/navy-teal + modal/toast system confirmed from prior UI work. **Not confirmed from the uploaded files:** exact component inventory and CWV metrics.

---

## Deep context (2026-06-30) — stack, surfaces, and UI rules

**Stack.** React.js + Next.js (responsive, mobile-first), reusable component architecture, dynamic routing, client/server data handling, and SEO-friendly rendering. The map was modernized into a dedicated **TypeScript map application** deployed to staging and production. A **mobile app** (Android & iOS) is in active development, mirroring core web workflows.

**Governed frontend surfaces.** Dashboard & analytics interfaces; My Portfolio (filters, sorting, financials); **Claim Lease / Claim Mineral Owner** flows and **Switch Owner**; interactive **map** (lease/well/county/operator search, County Filters, well/lease popups, **permit popup**, **completion-status**, report downloads); operator listing & detail; Data Coverage; field reports (lease/well/reservoir) with **PDF download**; landing/feature pages; Community; Contact Us; and the **visit-based engagement popup system** (targeted popups by visit count with interaction tracking).

**UI rules (MUST).**
- **Tier-aware rendering:** show/enable features per the user's plan (Free/Pro/Enterprise) and respect **claim limits**; never render an action the user's tier cannot perform.
- **Data integrity on screen:** any data figure displays its **source + vintage** context where the design allows; **estimates are visibly labeled** (P3); never imply nationwide coverage (P1 — Texas-only).
- **Accessibility & performance:** one H1 per page, labeled controls, keyboard/focus support, Core-Web-Vitals discipline (`accessibility-governance.md`, `performance-and-technical-seo-governance.md`).
- **Consistency:** reuse the design system (navy/teal, Lexend); claim/portfolio/map components stay consistent across owner and professional UIs.
- **Incremental change:** prefer small, targeted, well-QA'd changes over redesigns; every change passes the launch/update QA checklist before release.
