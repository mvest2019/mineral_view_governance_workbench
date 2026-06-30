# Site Overview Governance

> **Status:** ENHANCED (deep) · **Owner:** Product/Content · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on any positioning/nav change · **Companion:** `business-model-and-product-positioning.md`, `brand-and-messaging-governance.md`, `page-governance.md`.

---

## 1. Purpose & scope
Define what the Mineral View website exists to do, who it serves, the journeys it must support, and the trust bar every page clears. This is the orientation file that downstream content, SEO, page, and product files inherit from. Scope: the public site and the portal's public-facing surfaces; not internal admin (`admin-and-cerebro-governance.md`).

## 2. Positioning
Mineral View is a **Texas** oil-and-gas **mineral-rights intelligence platform**: it helps mineral owners and industry professionals **find, understand, and value** Texas mineral interests using RRC-derived data, maps, reports, and modeled estimates. Texas is the canonical data scope (constitution P1); US-level content is education only.

## 3. Audiences
| Audience | Tier of priority | Core need | Primary surfaces |
|---|---|---|---|
| Mineral owners | Primary | Understand what they own; find their record; estimate value; track activity | Claim flow, Owner Dossier, MVestimate, reports, alerts |
| Industry professionals (investors, landmen, consultants, attorneys) | Primary | Operate many properties; operator intelligence; bulk tooling | Operator directory, benchmarking, bulk owner reports |
| Family offices / land teams / O&G businesses | Secondary | Portfolio-scale access | Enterprise |

## 4. Core goals
| Goal type | Targets |
|---|---|
| Business | Qualified signups (phone required at registration); Free→Pro/Premium upgrades; Enterprise leads |
| Product | Education + self-service claiming + valuation + activity tracking |
| Conversion | Claim-a-record path; pricing/upgrade path; Enterprise contact |
| Trust | Every estimate labeled; every figure provenance-true; no advice |

## 5. Major user journeys
1. **Owner discovery → claim → value:** SEO/blog/glossary entry → search & claim owner record → Owner Dossier (lease/reservoir/well) → MVestimate + Cash Flow + reports → upgrade.
2. **Professional intelligence:** operator directory → compare performance/stats → activity tracking → bulk owner reports → upgrade/Enterprise.
3. **Education:** glossary/FAQ/blog → product page → claim/contact.

## 6. Content areas (confirmed nav taxonomy)
Mineral Owners · Know Your Operators · Map · Explore → (Data Coverage: Mineral/Production Data · Knowledge Center: Blogs/News/Glossary · Downloads · Professionals). Community is a moderated UGC surface (groups, Ask-a-Question) requiring the "not advice / verify independently" disclaimer.

## 7. Trust requirements (MUST, every data/estimate page)
☐ Estimates labeled as estimates ☐ Source + vintage shown or governed ☐ No advice/steering language ☐ Legal entity **Mineral View, LLC** + disclaimers consistent ☐ Demo values not presented as real.

## 8. Good vs bad framing
| Good | Bad |
|---|---|
| "Find and understand your Texas mineral interests." | "Discover what your minerals are worth — guaranteed." |
| "Texas RRC data, explained for owners." | "Nationwide mineral coverage." |

## 9. Ownership & review
Owner: Product/Content. Claims/positioning changes route to Ryan. Review quarterly and on any nav/audience/positioning change.

## 10. Evidence notes & gaps
Nav taxonomy, audiences, journeys, and community surface confirmed from product screenshots + "Our Story". Exhaustive page list is **Not confirmed from the uploaded files** (see `page-governance.md`).

---

## Deep context (2026-06-30) — site map & surface ownership

**Public site (presentation, Next.js):** home, feature landing pages (map, claim, reports, operator hub, data coverage), county pages, blog, glossary, FAQ, news, contact, pricing/plans, legal (privacy, terms). **App (owner portal):** dashboard, My Portfolio, claim flows, field reports, notifications/agents, map. **Professional account:** multi-owner management (Switch Owner), Data Coverage, operator analytics. **Internal:** Cerebro admin; the Governance Workbench.

**Ownership (who governs what):** public content → Marketing/Content (`blog-and-seo-content-governance.md`, `faq-and-glossary-governance.md`); app surfaces → Development (frontend/backend) with QA; data/estimates → Data Science; pricing/claims/legal → Ryan. Every surface inherits the cross-cutting rules: Texas scope (P1), no overstatement (P2), estimates labeled (P3), provenance + vintage (P4).

**Rule:** this overview is the index of surfaces; when a surface is added or retired, update here and in the relevant per-surface governance file and `feature-inventory-reference.md`.
