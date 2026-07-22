# Team Member Governance — Pranav Nandeshwar

> **Status:** Team profile (governed, deep) · **Role:** Data Scientist · **Department(s):** DATA_SCIENCE
> **Reports to:** Ryan Cochran (DS SME review: Christos Batsios / Gabor Korosi) · **Experience in project:** 2+ years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Pranav Nandeshwar's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Pranav Nandeshwar |
| **Role / Title** | Data Scientist |
| **Department(s)** | DATA_SCIENCE |
| **Reports To** | Ryan Cochran (DS SME review: Christos Batsios / Gabor Korosi) |
| **Experience in Project** | 2+ years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Production allocation & forecasting · MVestimate cashflow · geospatial intelligence · AI monthly reports · activity monitoring |

## 2. Snapshot
**Purpose at Mineral View (one line):** Builds the production-forecasting, allocation, cashflow, and geospatial-intelligence pipelines that power owner insights and reports.

**Focused on right now:** Owner-centric Monthly Mineral Owner Report and allocation-model enhancement.

**Top priorities:**
- Owner-centric Monthly Mineral Owner Report (transition from lease-centric)
- Allocation accuracy (well status / filing types)
- Activity monitoring + intelligent notifications
- Daily pipeline/ETL reliability

## 3. Role in the platform (context)
Pranav turns the RRC production spine into **forward-looking, owner-facing intelligence** — allocation, forecasting, cashflow, and the automated monthly report. He sits in the analytics layer between the warehouse and the serving/report surfaces, and works with Nikhil and the DS SMEs on methodology.

## 4. Work completed so far at Mineral View
**Production allocation & forecasting** — well-level allocation framework; BOE/month forecasting; automated production aggregation; decline-curve and production-trend analysis on top of `og_lease_cycle_production`.

**MVestimates cashflow** — optimized production-to-cashflow calculation pipelines; automated recurring updates.

**Linkage pipeline enhancement** — redesigned well-to-lease linkage processing; increased refresh from periodic to **multiple daily updates** for near-real-time activity.

**Geospatial intelligence** — lease/well mapping pipelines; coordinate processing/validation; nearest-lease and neighboring-activity detection; directional/distance calculations.

**Activity monitoring & notifications** — monitoring framework for W-1 permits, completions, production updates, and operator activity with automated event detection feeding `notification_*`.

**AI-powered monthly reporting** — combined production analytics with LLM-generated narratives to auto-produce owner reports (`field_report`).

## 5. Current work (in progress)
- Owner-centric Monthly Mineral Owner Report (aggregating across all leases tied to one owner).
- Allocation enhancement: well status (Producing/Shut-In/Injection) and filing well types.
- Expanded activity monitoring + intelligent, prioritized notifications.
- Daily pipeline/ETL monitoring, failure investigation, and performance.
- Geospatial improvements and decision-support frameworks.

_'Done' for the owner report means one consolidated, accurate, estimate-labeled document per owner, generated on a monitored monthly schedule._

## 6. Data & systems ownership
This maps what Pranav owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| RRC production | `og_lease_cycle_production_dec_2025` (32) | Source for allocation/forecasting; consumes at a known vintage (P4). |
| Linkage | `linkage_data_new` (83) | Well↔lease mapping that allocation depends on; contributed the multi-daily refresh. |
| Reports | `field_report` (40), `leasereportcontent` | AI monthly report outputs. |
| Notifications / events | `notification_alert`, `notification_history` | Activity-monitoring events feed these. |
| GIS / spatial | `gis_*`, coordinates in linkage | Nearest-lease / neighboring-activity detection. |


## 7. Governance responsibilities
Pranav is a primary contributor to, and is expected to keep current, these governance surfaces:
- `analytics-layer-governance.md`
- `Playbook_Decline_And_Forecast.md`
- `reporting-products-governance.md`
- `Data_Provenance_And_Freshness.md`
- `database-and-schema-governance.md` (contributor)

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- RRC production/disposition at a known vintage
- `linkage_data_new`
- DS-SME methodology review

**Produces (outputs others depend on):**
- Allocation & forecast estimates (BOE/month)
- Owner-level monthly reports
- Activity-monitoring notifications
- Cashflow inputs to MVestimate

## 9. Collaborators & dependencies
- **Works most closely with:** Nikhil Salunke; DS SMEs Christos & Gabor; backend team (reports/notifications); Ryan
- **Depends on:** RRC vintage; linkage freshness; scheduled-job infrastructure
- **People/teams who depend on this work:** Owner reports, notifications, portfolio cashflow, decision-support surfaces

## 10. Domain risks & controls
Risks specific to Pranav's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Forecast presented as certainty | Forecasts/allocations are scenarios with confidence caveats and labeled as estimates (P3). |
| Stale numbers served after an RRC restatement | Recompute on new vintage; never serve cached figures as current (P4). |
| Allocation mis-attribution across wells/leases | Well-status/filing-type factors + validation checkpoints; DS-SME review of methodology. |
| AI narrative invents figures | Narrative summarizes computed numbers only; numbers come from the analytics layer, never the LLM. |


## 11. Skills & tools
- **Languages / frameworks:** Python, pandas, NumPy, Matplotlib
- **Tools / platforms:** MongoDB, PostgreSQL, GeoPandas, Shapely, Jupyter, VS Code, n8n, Windows Task Scheduler
- **Domain knowledge:** Time-series/forecasting, Monte Carlo, decline curves, well-lease relationships, geospatial analysis

## 12. Open questions / blockers / help needed
- Confirm precedence for conflicting operational classifications in allocation — DS SME / Ryan.
- Confirm near-real-time linkage SLA surfaced to owners.

## 13. Operating sources & references
- `analytics-layer-governance.md`
- `Playbook_Decline_And_Forecast.md`
- `reporting-products-governance.md`
- `database-schema-reference.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`og_lease_cycle_production_dec_2025`** (32 columns): `oil_gas_code`, `district_no`, `lease_no`, `cycle_year`, `cycle_month`, `cycle_year_month`, `lease_no_district_no`, `operator_no`, `field_no`, `field_type`, `gas_well_no`, `prod_report_filed_flag`, `lease_oil_prod_vol`, `lease_oil_allow`, `lease_oil_ending_bal`, `lease_gas_prod_vol`, `lease_gas_allow`, `lease_gas_lift_inj_vol`, `lease_cond_prod_vol`, `lease_cond_limit`, `lease_cond_ending_bal`, `lease_csgd_prod_vol`, `lease_csgd_limit`, `lease_csgd_gas_lift`, `lease_oil_tot_disp`, `lease_gas_tot_disp`, `lease_cond_tot_disp`, `lease_csgd_tot_disp`, `district_name`, `lease_name`, `operator_name`, `field_name`

**`linkage_data_new`** (83 columns): `mview_api`, `api14`, `tracking_no`, `tracking_date`, `lease_number`, `district_code`, `county`, `lease_name`, `field_name`, `reservoir`, `field_number`, `well_number`, `operator_number`, `operator_name`, `filing_purpose`, `filing_type`, `filing_welltype`, `recompletiondate`, `permit_type`, `permit_date`, `permit_number`, `spud_date`, `fpar_date`, `operation_date`, `lease_acres`, `elevation`, `total_tvd`, `total_md`, `test24_date`, `test24_chokesize`, `test24_oil`, `test24_gas`, `test24_water`, `test24_casing`, `oil_gravity`, `casing`, `liner`, `tubing`, `multiple_interval`, `from_md`, `to_md`, `ishydraulic_fracturing`, `remarks`, `form_path`, `directional_survey_path`, `plat_path`, `surfloc_x`, `surfloc_y`, `bhl_x`, `bhl_y`, `plugging_date`, `shut_in_date`, `playtype`, `status_number`, `status`, `isupdate`, `symnum`, `bottom_symnum`, `created_date`, `updated_date`, `surface_xnad27`, `surface_ynad27`, `bottom_xnad27`, `bottom_ynad27`, `wellboreprofiles`, `id`, `isnewinsert`, `i`, `new_api`, `dir_survey_name`, `dir_survey_pass`, `dir_survey_id`, `mwd_name`, `mwd_pass`, `mwd_id`, `gyro_name`, `gyro_pass`, `gyro_id`, `lastsyncdate`, `lastupdateddate`, `ispresent`, `submit_date`, `transformed_api`

**`field_report`** (40 columns): `id`, `field_number`, `field_name`, `oil_county_regular`, `oil_salt_dome`, `oil_field_location`, `oil_dont_permit`, `oil_schedule_remark`, `oil_comment`, `oil_rule_type`, `oil_depth`, `oil_lease_spacing`, `oil_well_spacing`, `oil_acres_perunit`, `oil_tolerance_perunit`, `oil_diagonal_code`, `oil_diagonal_max_len`, `gas_county_regular`, `gas_salt_dome`, `gas_field_location`, `gas_dont_permit`, `gas_schedule_remark`, `gas_comment`, `gas_rule_type`, `gas_depth`, `gas_lease_spacing`, `gas_well_spacing`, `gas_acres_perunit`, `gas_tolerance_perunit`, `gas_diagonal_code`, `gas_diagonal_max_len`, `api_number`, `surface_tolerance_box`, `collaborative_interval_box`, `first_last_box`, `perpendicular_leaseline_box`, `horizontal_to_vertical_dir_box`, `horizontal_to_horizontal_dir_box`, `overlap_distance_box`, `stacked_lateral_rule_box`

**`notification_alert`** (13 columns): `id`, `email_id`, `filters`, `create_ts`, `updated_date`, `operators`, `districts`, `leasenos`, `playtypes`, `countys`, `notification_type`, `frequency`, `notification_send_type`

**`notification_history`** (6 columns): `id`, `notification_alert_id`, `notification_type`, `notification_send_type`, `send_text`, `send_date`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Pranav | — | — |
| Domain methodology / design decisions | C | Pranav | Ryan Cochran (+ DS SME where data) | Nikhil Salunke; DS SMEs Christos & Gabor; backend team (reports/notifications); Ryan |
| Governance change in this area | C | Pranav | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Pranav | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** RRC production/disposition at a known vintage; `linkage_data_new`; DS-SME methodology review

**This role transforms/produces:** Allocation & forecast estimates (BOE/month); Owner-level monthly reports; Activity-monitoring notifications; Cashflow inputs to MVestimate

**Downstream (depends on this role):** Owner reports, notifications, portfolio cashflow, decision-support surfaces

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Data Scientist** needs to be productive:

- **Stack & access:** Python, pandas, NumPy, Matplotlib; tools — MongoDB, PostgreSQL, GeoPandas, Shapely, Jupyter, VS Code, n8n, Windows Task Scheduler. Request least-privilege access to the systems in §6.
- **Read first:** `analytics-layer-governance.md`, `Playbook_Decline_And_Forecast.md`, `reporting-products-governance.md`, `Data_Provenance_And_Freshness.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Nikhil Salunke; DS SMEs Christos & Gabor; backend team (reports/notifications); Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Pranav Nandeshwar's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Pranav's analytics/forecasting scope against the KB, the Mongo backup, and downstream report/portfolio surfaces. Additive to earlier sections.

### 21.1 MongoDB collections owned / heavily touched
Pranav's forecasting, allocation, and cashflow pipelines write and read primarily in MongoDB:
- **`ProdMvestPortal.MVestimateCalculations`** — the cashflow/DCF cache his Mvestimates pipeline optimizes (production→cashflow, mean/down/high bands).
- **`ProdMvestPortal.MonthlyProductionVolumes` / `MonthlyDispositionVolumes`** — the per-lease monthly series behind allocation and decline.
- **`EF_SpAnalysis`** — `Allocation_Reserves`, `Component_Allocation`, `UniqueWellsPerLease`, `Donuts`, `Neighbours_X2` — the spacing/allocation graph his well-level allocation framework produces.
- **`Decline_data_to_web.Data_to_web`** — the web-formatted lease dossier his decline/forecast output feeds.
- **`Data_Allocation`** — allocation snapshots.
- **`Linkage_data`** (per-county-year) — his linkage pipeline raised the refresh from periodic to **multiple daily updates**, which is what keeps near-real-time well activity flowing to the map and alerts.

### 21.2 Endpoints his outputs power (from the KB)
Via `MViewPortalAPI`: `POST /MyPortfolio/calculateMvestimate`, `GET /MyPortfolio/GetMvestimate/:member_id`, `POST /dashboard/financials/cash-flow-chart/:member_id`, `POST /dashboard/financials/oil-gas-production-chart/:member_id`, and the Field-Report cashflow endpoints. His allocation/decline outputs are the numbers these endpoints serve.

### 21.3 Owner-centric report transition (governed scope)
Pranav **leads** the migration of the Monthly Report framework from **lease-centric → owner-centric** (aggregating across all leases under one mineral owner). This is the analytics counterpart to the backend/frontend owner-centric claim work (Vaishnavi/Aboli/Pragati) and must keep MVestimate labeling (P3) and provenance/vintage (P4) intact when rolling multiple leases into one owner number.

### 21.4 Tooling & automation
Python/pandas/NumPy, GeoPandas/Shapely, Monte Carlo; **n8n** and Windows Task Scheduler for orchestration; daily ETL/pipeline monitoring. New-parameter work in progress: adding well-status (Producing/Shut-In/Injection) and filing-well-type into the allocation model.
