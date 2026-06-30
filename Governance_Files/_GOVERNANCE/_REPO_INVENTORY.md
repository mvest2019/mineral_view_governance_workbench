# Repository Inventory

> Status: NEW · Owner: Nikhil Salunke · Last Updated: 2026-06-23
> Source: provided repo zips + GitHub org `mvest2019`. Governance detail per repo in
> `repository-and-codebase-governance.md`, `frontend-governance.md`, `backend-api-governance.md`,
> `map-gis-governance.md`, `admin-and-cerebro-governance.md`.

---

## 1. Purpose

A single canonical list of every code repository provided as project input, its role, tier, and the governance file that owns its detailed rules. This is the authoritative answer to "which repos exist and what does each do."

## 2. Inventory

### Platform application repos (the production system)

| # | Repo | Branch(es) provided | Role | Detailed governance |
|---|---|---|---|---|
| 1 | `MViewPortalAPI` | master | Owner/professional portal backend API; tier/feature middleware (`featureAccess` / `SUBSCRIPTION_PLAN_MAP`), monthly report job (`sendMonthlyReportEmails.js`), cashflow/decline endpoints | `backend-api-governance.md` |
| 2 | `MviewMapAPI` | Mview_map_Production (×2 identical copies) | Map/GIS backend; PostGIS spatial functions, GeoJSON layers, tier-gated map queries | `map-gis-governance.md` |
| 3 | `PresentationSiteAPI` | Master, Mview_Prod | Presentation/site API; payments, data packages, act-as impersonation | `backend-api-governance.md` |
| 4 | `Mview-Presentation-Next` | master | Next.js public site/frontend; onboarding, NextAuth, SEO pages | `frontend-governance.md` |
| 5 | `Mview-Cerebro-web` | main | Internal Cerebro admin web | `admin-and-cerebro-governance.md` |
| 6 | `Mvestimate` / `mvestimateAPI` | Not confirmed from the uploaded files. | MVestimate API service | `mvestimate-governance.md` |

### Analytics / data-science repos (methodology)

| # | Repo | Role | Detailed governance |
|---|---|---|---|
| 7 | `Decline_curve` | Oldest lease→well allocation engine (`AllocationFinal.py`, `utils_AllocationFinal.py`); `christos.py` (DS SME Christos Batsios) | `decline-curve-methodology-governance.md` |
| 8 | `DeclineCurveManualAnalysis2025` | Streamlit manual-review tool (analyst adjusts change/min points) | `decline-curve-methodology-governance.md` |
| 9 | `DeclineCurve2026` | Current batch + review MVP: hyperbolic Arps fit, change-point segmentation, acre/well density, Mongo write-back | `decline-curve-methodology-governance.md` |
| 10 | Nikhil Salunke's "108" MVestimate repo (`108.zip`) | MVestimate valuation engine — 6 notebooks incl. `Mvestimates_cashflow_Producing.ipynb`; production/disposition ETL; map code; operator directory | `mvestimate-governance.md`, `analytics-layer-governance.md` |
| 11 | `New_Map_Final_Code` | GIS/map collection generation (Postgres → Mongo) | `map-gis-governance.md` |
| 12 | `Operator-Directory` (+ `All_Operator_Names_sanitized.xlsx`) | "Know Your Operators" backend; operator-name sanitization map | `operator-directory-governance.md` |
| 14 | `MView_X` (`MView_X-main.zip`) | ArcGIS Pro geospatial pipeline for Texas RRC well data: raw RRC spatial prep, lateral linkage, directional-survey processing (MWD/GYRO, minimum curvature), grouping/zones, supergroup Z-recalc + geodetic lines, grid creation, spatiotemporal analysis, reservoir naming. Checkpoint-driven (manual QA gates); requires `arcpy`. | `geospatial-directional-survey-pipeline-governance.md` |

### Project repo

| # | Repo | Role | Detailed governance |
|---|---|---|---|
| 13 | `governance-ui` (Governance Workbench) | Flask app (`governance_ui.py`, ~6,100 lines) + `governance.db`; the tool that operates this governance corpus | Not confirmed from the uploaded files. (Workbench-internal; document separately if it becomes a governed surface.) |

## 3. Cross-repo observations (from prior code review)

- **Tier logic lives in code** as `SUBSCRIPTION_PLAN_MAP` / `featureAccess` — this is the implementation backing `pricing-and-plan-governance.md`.
- **Data topology:** roughly 3 PostgreSQL databases + 8 MongoDB databases (the "Mongo ×8 / Postgres ×3" note). Postgres is system-of-record; Mongo is the derived serving layer.
- **Security findings F-001…F-013** originated from review of these repos (committed secrets: Braintree `MERCHENT_ID`, `Chat_GPT_KEY`, TLS keys; open CORS; act-as impersonation). See `security-governance.md`.
- `MviewMapAPI` was provided as two byte-identical zips — treated as one repo.

## 4. Evidence gaps

- Whether `Mvestimate`/`mvestimateAPI` (#6) is a distinct repo from Nikhil Salunke's "108" MVestimate notebooks (#10) is **Not confirmed from the uploaded files** — tracked in `open-questions-and-evidence-gaps.md`.
- Exact default branches, CI config, and deployment targets per repo are **Not confirmed from the uploaded files**.

## 5. Maintenance

Update this file whenever a repo is added, renamed, or retired. Review quarterly and on any repo-structure change.
