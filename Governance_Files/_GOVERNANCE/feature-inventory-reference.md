# Feature Inventory Reference

> **Status:** NEW (reference) · **Owner:** Product · **Last Updated:** 2026-06-23
> **Source:** 31 product screenshots (batches 1–3), platform repos, feature spec (**pricing section EXCLUDED**). **Companion:** `product-and-feature-governance.md`, `owner-portal-governance.md`, `reporting-products-governance.md`, `pricing-and-plan-governance.md`.

---

## 1. Purpose & scope
The canonical catalog of platform features, their behavior, and the persona/tier that gates them — so feature copy is accurate and consistent. Feature **descriptions** are claims; an inaccurate capability or tier statement is a governance defect (`product-and-feature-governance.md`). The pricing section of the old feature spec is **excluded** as a source.

## 2. Owner portal features
| Feature | Behavior (confirmed) | Tier note (Owner persona) |
|---|---|---|
| Claim Mineral Owners | Search & claim an owner record | Free 1 / Pro 2 / Premium 5 |
| Owner Dossier | Lease / reservoir / well structure with provenance | Included |
| MVestimate | Modeled projected six-year earnings; daily delta; Mean/Down/High | Included |
| My Portfolio | Aggregated claimed interests | Included |
| Cash Flow Statement | Historical (solid) → 6-yr projection (dashed) with as-of boundary | Included |
| Field / Well / Reservoir Reports | RRC-derived report views; EUR ("next 6 years") | View |
| Lease Report | Lease-level detail | Download |
| Monthly Report | Recurring emailed summary (`sendMonthlyReportEmails.js`) | Included |

## 3. Map / GIS features
| Feature | Behavior |
|---|---|
| Texas map | RRC Districts 1–10; API-42 search; "zoom to 11 to see wells" |
| Well / operator / county linkage | Served from Mongo `Linkage_data` |
| Formation tops | Shown where confirmed (W-2 formation records) |
| Relevance radius | 1 / 3 / 5-mile radius concept |
| Map / Quick / Regulatory views | Toggleable map layers |

## 4. Operator features
| Feature | Behavior | Tier note (Owner) |
|---|---|---|
| Operator Directory | "Know Your Operators" backend; sanitized names | 5 / 10 / 20 |
| Compare Performance | Operator performance comparison | 5 / 10 / 20 |
| Compare Stats | Operator statistics | 5 / 10 / 20 |
| Operator Activity | Activity tracking | 5 / 10 / 20 |
| Operator Presentation | Operator presentation view | 5 / 10 / 20 |

## 5. Activity & alerts
| Feature | Behavior |
|---|---|
| 6 activity/event types | Permit, completion, etc. activity events |
| View Activity | Activity surface | 
| Lease Pulse | Lease-level activity | 
| Notification Agents | Saved alerts (Owner 5/10/20; Professional 100/∞/∞) |
| Custom filters | Custom-filter schema across surfaces |

## 6. Professional & Enterprise
Professional features are mostly unlimited tooling with metered Owner Reports + Claims (1/5/8); Enterprise adds portfolio analytics, Verified Operator Directory, and benchmarking (see `pricing-and-plan-governance.md` §3.2–3.4).

## 7. Governing rules (MUST)
- Use **canonical feature names** exactly (MVestimate, Owner Dossier, Cash Flow Statement, Lease Pulse).
- Feature copy matches actual behavior; estimates labeled; no advice.
- Availability/limits follow the persona × tier matrix; never describe a metered feature as "included/unlimited."
- Screenshots reflect current UI; demo values (Brent $95.33, MVestimate $131M) are illustrative, never cited as real.

## 8. Evidence notes & gaps
Features confirmed from the 31 screenshots + repos. Exact full feature-spec text (minus excluded pricing) is **Not confirmed from the uploaded files** verbatim.
