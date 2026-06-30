# Reporting Products Governance

> **Status:** ENHANCED (deep) · **Owner:** Product · **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly
> **Companion:** `mvestimate-governance.md`, `data-provenance-and-lineage-governance.md`, `pricing-and-plan-governance.md`.

---

## 1. Purpose & scope
Govern Field, Well, Reservoir, Lease, and Monthly reports — naming, data sources, explanations, disclaimers, and export/tier rules.

## 2. Report inventory
| Report | Content | Access |
|---|---|---|
| Field Report | Field-level RRC data | View |
| Well Report | Well-level data incl. EUR ("next 6 years") | View |
| Reservoir Report | Reservoir-level data | View |
| Lease Report | Lease-level data | Download |
| Monthly Report | Recurring summary, emailed (`sendMonthlyReportEmails.js`) | Included |

## 3. Data-source rules (MUST)
Reports read from governed sources (Postgres facts, Mongo analytics, model outputs) with **provenance + vintage**. Estimates labeled. **Must not** mix vintages without labeling.

## 4. Explanation & disclaimers
Each report states its source, vintage, and that estimates are modeled, not actual. No advice.

## 5. Export/download & tier rules
Download availability follows tier limits (Lease Report download; Owner Map Report 50/150/300; Professional mostly unlimited). Exports **must not** include bulk PII beyond the user's entitled scope.

## 6. Report QA checklist
☐ Canonical name ☐ Source + vintage ☐ Estimates labeled ☐ Tier-correct download ☐ No over-scope PII ☐ No advice.

## 7. Anti-patterns
Reports without provenance; mixed unlabeled vintages; downloads exceeding entitlement; PII over-scope.

## 8. Evidence notes & gaps
Report types + monthly job confirmed from screenshots + repo; EUR window confirmed "6 years".

---

## Deep context (2026-06-30) — report catalog & rules

Mineral View's reports turn RRC + analytics data into owner-readable documents. Catalog:

- **Lease Report** — lease-level production, wells, operator, and activity.
- **Well Report** — single-well production history, status, and completion/permit context.
- **Reservoir Report** — reservoir/zone-level rollup.
- **Mineral Owner Report (Monthly)** — the flagship owner deliverable; **transitioning from lease-centric to owner-centric**, aggregating production, activity, operator, and cashflow insight across **all leases tied to one owner**, with **AI-generated narratives** (LLM) on top of the analytics.

**Rules (MUST):**
- **Provenance & vintage** on every figure (P4); **estimates/forecasts labeled** as estimates (P3); **Texas-only** scope (P1).
- **No overstatement** (P2): forecasts (decline/BOE-month) are presented as scenarios with their confidence/quality caveats (`Playbook_Decline_And_Forecast.md`, `Playbook_Confidence_And_Data_Quality.md`).
- **AI narratives** must be grounded in the report's own computed numbers — narrative may **summarize** but never **invent** figures; numbers come from the analytics layer, not the LLM.
- **Reproducibility:** a report is reproducible from its source vintage; the monthly job is scheduled, monitored, and re-runnable.
