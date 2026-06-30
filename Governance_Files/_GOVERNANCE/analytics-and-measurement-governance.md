# Analytics & Measurement Governance

> **Status:** ENHANCED (deep) · **Owner:** Product/Growth · **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly
> **Companion:** `event-tracking-and-dashboard-governance.md`, `privacy-and-data-use-governance.md`, `site-overview.md`.

---

## 1. Purpose & scope
Govern KPIs and measurement across SEO, conversion, product, content, and technical health — measured in a **privacy-respecting, goal-tied** way. Measurement must never become a privacy backdoor (no PII in analytics) and must always tie to a stated goal (no vanity metrics).

## 2. KPI areas
| Area | Example metrics |
|---|---|
| Organic search | impressions, clicks, rankings (Texas / owner / RRC / valuation clusters) |
| Conversion | signup, claim, Free→paid upgrade, Enterprise leads |
| Product engagement | dossier views, MVestimate runs, report downloads, map usage, Lease Pulse |
| Content | blog traffic, glossary/FAQ entries, refresh impact |
| Regulatory / news | feed engagement |
| Technical health | error rate, latency, Core Web Vitals, **data freshness** |

## 3. Rules (MUST)
- Measurement respects privacy/consent; **no PII** in analytics keys/URLs/payloads.
- Every metric ties to a goal in `site-overview.md`; vanity metrics with no goal are dropped.
- Metric definitions are canonical and shared (one definition of "claim", "upgrade", etc.).
- Report on a defined cadence with named dashboard owners.

## 4. Checklist
☐ Metrics mapped to goals ☐ Events defined (`event-tracking-and-dashboard-governance.md`) ☐ Privacy-respecting (no PII) ☐ Dashboard owned ☐ Definitions canonical ☐ Cadence set.

## 5. Anti-patterns
Vanity metrics with no goal; PII in analytics; unowned dashboards; inconsistent metric definitions.

## 6. Evidence notes & gaps
KPI areas synthesized from the confirmed product/content surfaces; the exact analytics stack is **Not confirmed from the uploaded files**.

---

## Deep context (2026-06-30) — what we measure, and the privacy line

Mineral View captures **product-usage analytics** to guide decisions (grounded in the backend work summaries): **user IP addresses, page visits, engagement patterns, most-viewed sections, and activity trends**, plus Python-derived **country-level traffic insight** from IPs to understand geographic reach. These feed product decisions (which features draw interest) and the marketing funnel.

**Rules (MUST):**
- **Privacy line:** IP and behavior data are **personal/PII-adjacent** — collection, retention, and use follow `privacy-and-data-use-governance.md`; they are never sold and never exposed in customer-facing surfaces; aggregate (e.g. country-level) before display.
- **Purpose limitation:** behavioral analytics inform product/marketing only; they do not alter a user's owner/financial data.
- **Separation:** analytics tables are distinct from system-of-record owner data; analytics never become a source of truth for ownership/production.
- **Funnel metrics:** signup → first claim (activation) → Pro/Enterprise (expansion) are the headline measures; tie events to the funnel in `event-tracking-and-dashboard-governance.md`.
- **Consent/region:** respect any applicable consent and regional rules; default to the most privacy-preserving option.
