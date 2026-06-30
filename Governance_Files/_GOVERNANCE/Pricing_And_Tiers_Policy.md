# Pricing & Plan Governance

> **Status:** ENHANCED (deep) · **Owner:** Product · **Reviewer:** Legal · **Final approver:** Ryan Cochran
> **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly + on any pricing change · **Change class:** Major (Ryan approval required)
> **Builds on:** existing `_GOVERNANCE` pricing policy. **Resolves:** finding F-003 / Q-0003 (tier-naming conflict).
> **Companion:** `terms-billing-and-refund-governance.md`, `product-and-feature-governance.md`, `free-tier-and-upgrade-path-governance.md`.

---

## 1. Purpose & scope

Govern **every customer-facing representation of plans, tiers, prices, and limits** — the pricing page, in-portal upgrade prompts, comparison tables, sales/Enterprise copy, emails, and any blog/FAQ mention of cost. Pricing is one of the highest-risk surfaces because it is simultaneously a **legal commitment** (it must match the Terms), a **product fact** (it must match the enforced `SUBSCRIPTION_PLAN_MAP`), and a **conversion lever** (it tempts exaggeration). This file makes the canonical model explicit and locks the approval path so no surface can drift.

In scope: prices, per-tier limits, persona differences, Enterprise positioning, discounts/promotions, and the language describing them. Out of scope: the *billing mechanics* (processor, refund timing, arbitration) which live in `terms-billing-and-refund-governance.md`, and *feature behavior* which lives in `product-and-feature-governance.md`.

## 2. Source-of-truth & the binding exclusion

| Allowed pricing source | Rank | Use |
|---|---|---|
| Live `/pricing` page screenshots (batch 2 + batch 3) | canonical | Prices, limits, persona split, Enterprise bundles |
| Code tier logic (`SUBSCRIPTION_PLAN_MAP` / `featureAccess`) | canonical | The *enforced* limits; must match published copy |
| Terms & Conditions | rank-1 legal | Billing/refund/arbitration wording |

**Excluded (MUST NOT use):** the pricing section of the old "master feature spec" / old content document. Per standing instruction it is **not** a pricing source and **must not** be referenced for any price or limit, even if it appears more complete. If the excluded doc and a canonical source disagree, the canonical source wins and the excluded value is discarded — never reconciled in.

**Rule:** Published price/limit copy **must** equal the enforced code value. If the page and the code disagree, that is a **release-blocking defect** — neither is published until they match and Ryan confirms which is correct.

## 3. The canonical model

Mineral View prices on a **persona × tier matrix**, never a single flat table:

- **Personas:** Mineral Owner, Professional — chosen at signup, each with its own prices and limits.
- **Tiers:** Free / Pro / Premium (self-serve) + **Enterprise** (custom, contact-sales).
- **Canonical tier names:** **Free / Pro / Premium**. The legacy "Access / Insights / Pro" naming is **dead** and **must not** appear anywhere. The FAQ's loose "Free + Premium" phrasing was casual shorthand, not the model.

### 3.1 Mineral Owner — "One-Stop Mineral Management Solution"

| Feature | Free | Pro | Premium |
|---|---|---|---|
| **Price** | $0.00/mo | $49.99/mo | $99.99/mo |
| Map View | Unlimited | Unlimited | Unlimited |
| Download Map Report | 50 | 150 | 300 |
| Claim Mineral Owners | 1 | 2 | 5 |
| Operator Directory | 5 | 10 | 20 |
| Compare Performance | 5 | 10 | 20 |
| Compare Stats | 5 | 10 | 20 |
| Operator Activity | 5 | 10 | 20 |
| Operator Presentation | 5 | 10 | 20 |
| Notification Agents | 5 | 10 | 20 |
| View Activity | 5 | 10 | 20 |
| Lease Pulse | 5 | 10 | 20 |
| MVestimate, My Portfolio, Cash Flow Statement, Field Report (view), Lease Report (download), Monthly Report | Included | Included | Included |

### 3.2 Professional — "Easy-to-Use Professional Platform"

| Feature | Free | Pro | Premium |
|---|---|---|---|
| **Price** | $0.00/mo | $150.00/mo | $200.00/mo |
| Owner Reports | 1 | 5 | 8 |
| Claim Mineral Owners | 1 | 5 | 8 |
| Notification Agents | 100 | Unlimited | Unlimited |
| Map View, Download Map Report, View Activity, Operator Directory, Compare Performance, Compare Stats, Operator Activity, Operator Presentation, Lease Pulse | Unlimited | Unlimited | Unlimited |

### 3.3 Model logic (MUST be reflected in copy)

The two personas use **opposite metering philosophies**, and copy must not blur them:

- **Mineral Owner** = low price, **per-feature quotas** that scale with tier (operator tools 5→10→20; map reports 50→150→300; claims 1→2→5). The owner is a focused user working a handful of properties.
- **Professional** = higher price, **mostly-unlimited tooling even on Free**, with the paid tiers buying **Owner-Report and Claim headroom (1→5→8)** and lifting Notification Agents (100→∞→∞). The professional manages many properties at once.

Writing the Owner "5/10/20" numbers into a Professional table (or vice versa) is a **factual error**, not a style choice.

### 3.4 Enterprise (custom — "Contact Now")

Two persona-flavored bundles; **no public fixed price**:

| Owner Enterprise | Professional Enterprise |
|---|---|
| For mineral owners, family offices, land teams, and O&G businesses managing multiple properties | For investors, landmen, consultants, attorneys managing large projects |
| Scalable data access, advanced reporting, portfolio analytics | Expanded data access, portfolio analytics |
| Mineral Owner Claims, owner-level lease insights, unlimited map access/reports, cash-flow reports, field/reservoir report access, lease-report downloads, operator directory, compare performance, operator-stats benchmarking, track operator activity | Mineral Owner Claims management, detailed/downloadable owner reports, production & revenue insights, **Verified** Operator Directory, operator benchmarking, owner portfolio analytics, cash-flow charts |

## 4. Pricing claim rules

| MUST | MUST NOT |
|---|---|
| Present prices/limits exactly as §3 | Invent, round, or "simplify" figures |
| Label the persona on any plan table | Mix Owner and Professional numbers in one column |
| Match the enforced `SUBSCRIPTION_PLAN_MAP` | Describe a metered feature as "included/unlimited" (or vice versa) |
| Keep billing/refund/arbitration consistent with the Terms | Imply guaranteed savings, returns, or value from any plan |
| Time-box and Ryan-approve any discount/promo | Show a promo price without a dated promo notice |

## 5. Plan-comparison rules

Comparison tables **must**: label the persona; list features in the canonical order in §3; use a consistent vocabulary ("Included" / "Unlimited" / "<number>"); and never imply a feature exists at a tier where it is absent. When comparing personas, use **two separate tables**, not one merged grid.

## 6. Worked examples

**Good upgrade prompt (Owner, hit claim limit on Free):**
> "You've used your 1 free mineral-owner claim. Pro ($49.99/mo) includes 2 claims and 150 map-report downloads. Upgrade to claim more."

**Bad upgrade prompt (violations flagged):**
> "Unlock the *true value* of your minerals — upgrade now before you lose access!" — invents value claim (P3), uses false urgency, omits the real limit/price.

**Good Enterprise CTA:** "Managing many properties? Contact us about Enterprise — scalable access and portfolio analytics." **Bad:** "Enterprise guarantees the best returns on your minerals."

## 7. Open confirmation (Ryan) — Q-A

Two captures showed **different Mineral-Owner figures** across batches (the `/pricing` table vs the persona view). Treat the `/pricing`-page values **$49.99 / $99.99** as canonical **pending Ryan's explicit confirmation**. Until confirmed, do not publish a *changed* Owner price. Tracked in `open-questions-and-evidence-gaps.md` (Q-A) and the priority-questions log.

## 8. Approval & change control

| Change | Reviewer(s) | Approver | Required checks |
|---|---|---|---|
| Any price/limit change | Product + Legal | **Ryan Cochran** | matches code `SUBSCRIPTION_PLAN_MAP`; Terms alignment; persona-correct; no excluded-doc source |
| Copy describing plans | Product | Product lead (Legal if claim) | claim rules §4 |
| Discount / promotion | Product + Legal | **Ryan Cochran** | dated; time-boxed; Terms-consistent |

Pricing changes are **Major** changes (`change-management-governance.md`) and **must** be logged in the decision log.

## 9. Pricing QA checklist
☐ Persona labeled on every table ☐ Tier names Free/Pro/Premium only ☐ Figures match screenshots **and** code ☐ Included vs metered correct per persona ☐ Terms-consistent ☐ No excluded-doc source ☐ No guaranteed-value/returns language ☐ Promo (if any) dated + Ryan-approved ☐ Owner-price reconciliation (Q-A) respected ☐ Decision-log entry filed.

## 10. Anti-patterns
Merged Owner/Professional grids; "from $49.99" ambiguity hiding the persona; describing Premium features as Free; sourcing the excluded old doc; guaranteed-value language; undated promo prices; publishing a page value that doesn't match enforced code.

## 11. Evidence notes & gaps
§3 tables are grounded in product screenshots (batches 2–3) and the code tier map. The **Owner-price discrepancy (Q-A)** is the one open item. Enterprise benefit lists are from the Enterprise screenshots. The processor wording (Braintree vs Cybersource, Q-B) is resolved in `terms-billing-and-refund-governance.md`, not here.
