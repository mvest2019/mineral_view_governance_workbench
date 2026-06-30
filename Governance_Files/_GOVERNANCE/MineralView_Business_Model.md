# Business Model & Product Positioning

> **Status:** ENHANCED (deep) · **Owner:** Product · **Reviewer:** Legal (claims) · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Builds on:** existing `_GOVERNANCE` business-model docs · **Companion:** `pricing-and-plan-governance.md`, `brand-and-messaging-governance.md`.

---

## 1. Purpose & scope
Govern how Mineral View describes its **business model, audience value, and differentiation** in customer-facing copy — so positioning stays truthful, persona-correct, and free of advice/guarantee claims. Scope: marketing/product copy framing; pricing mechanics live in `pricing-and-plan-governance.md` (and the old-doc pricing section is excluded).

## 2. Positioning statement
A Texas mineral-rights intelligence SaaS that turns public RRC/GIS/appraisal data into **owner-ready insight**: claim your records, see your dossier, estimate value, and track activity — for owners and the professionals who serve them.

## 3. Audience segments & value props
| Segment | Value proposition | Monetization |
|---|---|---|
| Mineral owner | "Understand and value what you own." Find records, MVestimate (projected 6-yr earnings), reports, activity alerts. | Metered Free/Pro/Premium ($0/$49.99/$99.99) |
| Professional | "Work many properties efficiently." Mostly-unlimited tooling, operator directory + benchmarking, bulk owner reports. | Higher-priced Free/Pro/Premium ($0/$150/$200) |
| Enterprise | "Scale data access." Portfolio analytics, advanced reporting. | Custom / contact-sales |

## 4. Differentiation rules
| Copy MAY emphasize | Copy MUST NOT claim |
|---|---|
| Texas depth; RRC-grounded data | Nationwide coverage |
| Owner-friendly dossier + valuation | Guaranteed values/returns |
| Operator intelligence + benchmarking | Advice to lease/sell/sign |
| Family heritage (truthful) | Embellished heritage/years |

## 5. Business-model claims needing review
Any statement about market size, accuracy, savings, or outcomes is a **claim** → route to `legal-compliance-and-claims-governance.md` (risk classification). Heritage claims (75+ years, 6th-gen, family-owned) must stay truthful (constitution P7).

## 6. How copy supports the model
Owner pages emphasize education + self-service + valuation; professional pages emphasize tooling/scale + operator intelligence; both drive to claim/upgrade/contact. Pricing copy follows the persona × tier matrix only.

## 7. Worked examples
**Good (owner):** "See your Texas mineral interests in one dossier and get a six-year earnings estimate." **Good (pro):** "Benchmark operators and pull owner reports at scale." **Bad:** "The smartest investment decision you'll make" (advice + guarantee).

## 8. Ownership & review
Owner: Product. Reviewer: Legal for claims. Final: Ryan. Review quarterly and on any pricing/positioning change.

## 9. Evidence notes & gaps
Segments, monetization, and Enterprise framing confirmed from pricing/Enterprise screenshots + "Our Story". Excluded old-doc pricing must not be used. Exact market/accuracy claims **Not confirmed from the uploaded files** — treat as High-risk claims pending evidence.

---

## Deep context (2026-06-30) — audiences, product surfaces, and monetization

**Who it serves (two audiences, one data spine).** Mineral View is a **Texas oil-and-gas mineral-rights intelligence SaaS**. It serves (1) **mineral & royalty owners** — who want to know which wells/leases they own, what is producing, what activity is happening, and an estimate of their cash flow — and (2) **industry professionals** (landmen, family offices, fiduciaries, investors) — who need portfolio-level visibility across counties, operators, and leases. Both audiences run on the **same RRC-derived data spine** (constitution P1: Texas-only), surfaced through audience-specific UIs (the owner portal vs. the professional account).

**Core jobs-to-be-done.** Find my minerals (owner/lease search + Claim Mineral Owner) → see my portfolio (dashboards, financials, activity by lease/county/operator) → understand my assets (field reports: lease, well, reservoir; owner-level reports) → stay informed (notifications/agents for permits, completions, production, operator activity) → estimate value (MVestimate cashflow). Professionals layer on **Data Coverage**, the **Operator directory/hub**, and broader county/operator activity tracking.

**Monetization.** Subscription tiers — **Free, Pro, Enterprise** — gate features and **claim limits** (e.g. claim caps for Free/Pro). Tier logic lives in code (`SUBSCRIPTION_PLAN_MAP` / `featureAccess`) and is governed by `pricing-and-plan-governance.md` / `free-tier-and-upgrade-path-governance.md`. Payments run through the configured payment processor (Braintree, per the security findings). The **free tier + education content** (glossary, blogs, YouTube) is the top of the funnel; **claiming** is the activation event; **Pro/Enterprise** is the expansion path.

**Growth engine.** Organic SEO + educational content (25+ blogs, glossary pages, YouTube Shorts), plus CRM-driven outreach (Pursuit / HubSpot / Mailchimp) and demos tailored to sophisticated buyers. Trust is the differentiator — claims are anchored in **RRC data credibility**, never hype (P3: estimates labeled; P2: no overstatement).

**Trust boundary (MUST).** The business is built on being *right* about someone's minerals; every figure is Texas-scoped, sourced, vintaged, and any estimate is labeled. Overstating coverage or accuracy is an existential brand risk, not a marketing choice.
