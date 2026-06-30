# Data Provenance & Lineage Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Reviewer:** DS SME · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Review cadence:** Monthly (freshness) + quarterly · **Builds on:** existing provenance policy · **Companion:** `data-architecture-governance.md`, `rrc-data-governance.md`, `database-source-inventory.md`.

---

## 1. Purpose & scope
Ensure every customer-facing figure is **traceable to its source and vintage**, and every transformation from raw RRC to served value is documented and reproducible. This file operationalizes constitution P4. Scope: the lineage from RRC/GIS/appraisal → Postgres → transformation → Mongo → API → UI.

## 2. Provenance standard (MUST)
Each served data point carries three attributes: **source** (RRC / GIS / appraisal / model), **vintage** (pull date), and **transformation class** (raw / allocated / modeled). Estimates are additionally labeled as estimates (constitution P3).

## 3. Source tracking
| Source | Where it lives |
|---|---|
| RRC scrape | `scrapy_data` (`og_lease_cycle_*`, W-1/W-2, audit ledger) |
| GIS | `bottomlocation`/`surfacelocation`/`directional_survey_child`; map build via `New_Map_Final_Code` |
| Appraisal / owners | mineral-owner tables |
| Model | MVestimate (108), decline (DeclineCurve2026), allocation (Decline_curve) |

## 4. Lineage documentation (MUST)
Every Mongo analytics collection documents its Postgres source + transformation and is **reproducible** by a reviewer. The in-DB `schema_mappings` table (`source_authority`, `schema_hash`, `drift_detected`, `human_reviewed`, `review_outcome`) **should** be used to track RRC schema drift; confirm whether the loop is active (G-5).

## 5. Vintage & freshness rules
Preserve `vintage_date` (pull date) vs `cycle_year_month` (the production month). A `prod_report = N` zero is a **gap**, not a true zero. Retroactive RRC rewrites **must not** flip historical months to zero on the UI (the "asset value disappeared" failure).

## 6. User-facing provenance
Public surfaces **should** state "Source: Texas RRC" + an as-of date and label estimates. **Must not** present modeled values as actuals or mix vintages without a label.

## 7. Audit trail & evidence
The scrape ledger (`scrape_session_log`, `scraper_process_log`, `*_exceptions`) is the freshness/audit evidence. Data-quality evidence (zero classification, ARPS guard, coordinate sanity) is retained.

## 8. QA checklist
☐ Source labeled ☐ Vintage tracked ☐ Transformation class labeled ☐ Estimate hedged ☐ Gap vs true-zero correct ☐ Mongo reproducible from Postgres ☐ Drift tracked.

## 9. Anti-patterns
Unlabeled figures; mixed vintages; rendering `flag=N` as ended production; magic numbers in Mongo not reproducible from Postgres.

## 10. Evidence notes & gaps
Confirmed from Postgres schema (`prod_report`, `schema_mappings`, snapshot tables) and the bitemporal RRC analysis. **Not confirmed from the uploaded files:** whether the `schema_mappings` drift loop is active (G-5).

---

## Addendum (2026-06-30) — geospatial & directional-survey provenance (MView_X)

Spatial products inherit provenance from the **MView_X** pipeline (`geospatial-directional-survey-pipeline-governance.md`):

- **Source attributes:** each spatial output carries its **RRC pull vintage** (source download date), **survey source type** (MWD vs GYRO), and the **pipeline stage** that produced it.
- **Transformation class:** SHL/BHL points are *raw-projected*; trajectories/geodetic lines/grids/zones/supergroups are *derived*; reservoir names are *modeled/named*. Label accordingly when surfaced.
- **Freshness rule:** because RRC retroactively rewrites history, a spatial product is only as fresh as its **RRC vintage** — never imply a recency the underlying pull does not support.
- **Reproducibility:** outputs are reproducible by re-running the fixed stage order from the same RRC vintage and survey inputs; ad-hoc edits to outputs break lineage and are not permitted.
