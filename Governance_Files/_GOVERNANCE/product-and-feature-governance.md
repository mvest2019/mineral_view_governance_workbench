# Product & Feature Governance

> **Status:** ENHANCED (deep) · **Owner:** Product · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on feature/UI change · **Source:** 31 product screenshots, feature spec (**pricing section EXCLUDED**), repos. **Companion:** `owner-portal-governance.md`, `reporting-products-governance.md`, `pricing-and-plan-governance.md`.

---

## 1. Purpose & scope
Govern the **product feature inventory, naming, descriptions, tier mapping, and screenshot usage**. Feature copy is a claim surface — describing a feature inaccurately (capability or tier) is a governance defect, not a wording nuance. The pricing section of the old feature spec is **excluded** as a source.

## 2. Feature inventory (confirmed)
| Area | Features |
|---|---|
| Owner portal | Claim Mineral Owners, My Portfolio, Owner Dossier (lease/reservoir/well), MVestimate, Cash Flow Statement, Monthly Report |
| Reports | Field Report (view), Lease Report (download), Well Report, Reservoir Report |
| Map/GIS | Texas map (Districts 1–10), API-42 search, well/operator/county linkage, formation tops, 1/3/5-mile radius |
| Operator | Operator Directory, Compare Performance, Compare Stats, Operator Activity, Operator Presentation, benchmarking |
| Activity | 6 activity/event types, View Activity, Lease Pulse, Notification Agents |
| Filters | Custom-filter schema |

## 3. Naming rules (MUST)
Use canonical feature names exactly: "MVestimate", "Owner Dossier", "Cash Flow Statement", "Lease Pulse", etc. **Do not** rename features in copy without product approval (renames break SEO + user mental models).

## 4. Description rules
Feature copy **must** match actual behavior, label estimates, and avoid advice. Cash Flow renders **historical (solid) → future (dashed)** with an as-of boundary (~2026 projection line). EUR = produced + remaining reserves ("next 6 years").

## 5. Screenshot usage rules
Screenshots **must** reflect current UI and **must not** present test/demo values as real — e.g., portal demo figures (Brent $95.33, MVestimate $131M) are **illustrative**, not canonical facts. Mask any PII/secrets in screenshots (`design-ux-and-screenshot-governance.md`).

## 6. Tier mapping
Feature availability/limits follow `pricing-and-plan-governance.md` (persona × tier). **Do not** describe a feature as "included" where it is metered, or "unlimited" where it is capped.

## 7. Good vs bad
| Good | Bad |
|---|---|
| "Cash Flow Statement: historical production (solid) and a six-year projection (dashed)." | "Live cash flow showing your guaranteed income." |
| "MVestimate — a modeled six-year earnings estimate." | "Your verified mineral value." |

## 8. Product-copy QA checklist
☐ Canonical names ☐ Behavior-accurate ☐ Estimates labeled ☐ Tier-correct (persona × tier) ☐ Screenshots current ☐ No demo-as-real ☐ No advice ☐ Pricing excluded-doc not used.

## 9. Evidence notes & gaps
Feature list confirmed from screenshots + repos; demo-value caution from portal captures. Full feature-spec text (minus excluded pricing) **Not confirmed from the uploaded files** verbatim.

---

## Deep context (2026-06-30) — governed feature inventory

The platform's customer-facing surfaces, grounded in the team work summaries. Each is a governed surface; changes follow `change-management-governance.md` and the QA gates (`quality-assurance-checklists.md`).

- **Claim Mineral Owner / Claim Lease:** owner & lease search → claim submission → verification → portfolio integration; subject to **subscription claim limits** and duplicate-claim rules. The core activation flow.
- **Switch Owner / professional act-as-owner:** professionals manage multiple owner accounts and view the platform as a given owner (access-controlled — see `security-governance.md`).
- **Dashboard & My Portfolio:** ownership, financials, and activity tracking by **lease / county / operator**; filters and sorting; portfolio-level rollups.
- **Field Reports:** **Lease Report, Well Report, Reservoir Report**, and the **Mineral Owner Report** (transitioning from lease-centric to **owner-centric** aggregation across a single owner's leases — see `reporting-products-governance.md`).
- **Interactive Map:** lease/well/county/operator search, filters (incl. **County Filters**), well & lease popups, **permit popup**, **completion-status**, and report downloads from the map; modernized as a TypeScript map application.
- **Operator surfaces:** operator listing, operator detail pages, Operator Hub analytics ("Know Your Operators").
- **Data Coverage:** mineral-owners and production-data coverage modules with access control.
- **Notifications & Agents:** system/my notifications, **My Agents / Create Agent**; alerts for W-1 permits, completions, production updates, and operator activity.
- **Community (Oil & Gas Community):** groups, discussions, posts, comments, and expert interaction.
- **MVestimate (cashflow):** production-to-cashflow estimation for owners (labeled as an estimate, P3).
- **Mobile app (in progress):** Android & iOS, mirroring core web workflows.

**Cross-cutting rules (MUST):** every data figure carries source + vintage and Texas scope (P1/P4); estimates are labeled (P3); feature access matches the user's tier; new/changed surfaces pass the QA gates before release.
