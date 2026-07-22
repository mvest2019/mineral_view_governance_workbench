# Team Member Governance — Nikhil Salunke

> **Status:** Team profile (governed, deep) · **Role:** Data Scientist / AI Engineer / Data Engineer + Governance Maintainer · **Department(s):** DATA_SCIENCE · PLATFORM_INFRASTRUCTURE · GOVERNANCE
> **Reports to:** Ryan Cochran · **Experience in project:** 2.5+ years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Nikhil Salunke's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Nikhil Salunke |
| **Role / Title** | Data Scientist / AI Engineer / Data Engineer + Governance Maintainer / Team Coordinator |
| **Department(s)** | DATA_SCIENCE · PLATFORM_INFRASTRUCTURE · GOVERNANCE |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | 2.5+ years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | MView_X geospatial pipeline · MVestimate engine · governance corpus + Workbench · data pipelines |

## 2. Snapshot
**Purpose at Mineral View (one line):** Turns raw Texas oil & gas data into validated, production-ready datasets and analytics, and owns the governance corpus + Governance Workbench.

**Focused on right now:** Governance-file generation for the AI Workbench (this corpus) and Mineral Owner 2025 data cleanup.

**Top priorities:**
- Grounded governance corpus + Workbench
- Mineral Owner 2025 data cleanup (312-shard merge → canonical table)
- MView_X geospatial/directional-survey pipeline accuracy
- Development research & analysis

## 3. Role in the platform (context)
Nikhil works across the **entire data lifecycle** — raw sources → extraction → cleaning → validation → engineering → advanced analytics → AI processing → database optimization → API integration → website visualization. He is the bridge between the raw RRC/warehouse data and every downstream surface (map, offset analytics, reports, MVestimate), and he owns the governance layer that keeps the platform honest. He collaborates directly with Ryan, the DS SMEs (Christos Batsios, Gabor Korosi), and the backend/frontend teams.

## 4. Work completed so far at Mineral View
**End-to-end data pipelines at scale** — designed pipelines that turn raw datasets into validated, production-ready data; processed multi-million-record datasets (production, leases, ownership) with chunk/batch/memory optimization for speed, reliability, and scalability.

**Data-quality & validation frameworks** — cleaning, standardization, and sanitization plus validation frameworks — production-calc checks, historical comparison, duplicate/missing/mismatch detection — across owners, leases, wells, operators, production, disposition, linkage, and geographic data.

**MView Estimate (the '108' engine)** — owns the calculation workflow: data prep, calc logic, validation, multi-dataset integration, and output verification — producing accurate, consistent, explainable owner valuations.

**Linkage & MongoDB** — cleaned/validated the well↔lease↔owner linkage (`linkage_data_new`, 83 cols) and structured/optimized MongoDB documents for website use.

**AI-based PDF extraction** — built AI extraction for directional-survey PDFs (unstructured → structured), reducing manual entry and feeding `directional_survey*`.

**Geospatial & domain engineering** — production/disposition processing (`og_lease_cycle_*`), mineral-owner data, full map/geospatial generation (`gis_*`), well identification/extraction (`og_wellbore_ewa`, `new_wellbore_master`), Operator Hub analytics, Texas statewide production analysis, nearby-well/lease algorithms, lease-polygon generation, data-allocation analytics, and spatio-temporal analysis.

**MView_X ArcGIS pipeline** — the 9-stage geospatial/directional-survey pipeline (raw RRC spatial prep → surveys via minimum curvature → grouping/zones → geodetic lines → grid → spatiotemporal → reservoir naming) with the validated straight-line SHL→landing→BHL trajectory rule.

## 5. Current work (in progress)
- Governance-file generation for the AI Workbench (this corpus).
- Mineral Owner 2025 data cleanup — merging the 312 `mineral_owner_2025` shards into a canonical dataset.
- Ongoing development research and analysis.

_'Done' for the current governance work means every AI surface is grounded in an accurate, deep corpus and the Mineral Owner 2025 dataset is a single validated table with provenance/vintage recorded._

## 6. Data & systems ownership
This maps what Nikhil owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| RRC production & disposition | `og_lease_cycle_production_dec_2025` (32), `og_lease_cycle_disposition_dec_2025` (52), `og_wellbore_ewa` (60), `well_status_history` | The ~22 GB core; Nikhil processes/validates it and derives analytics; enforces vintage/bitemporal handling. |
| Linkage | `linkage_data_new` (83) | The well↔lease↔owner↔survey backbone; Nikhil owns its data integrity and shape. |
| Mineral owners & property | `mineralowner_2023/2024`, `mineralownerproperty_2023/2024`, `mineral_owner_2025` (312 shards) | Ownership/RI records; current cleanup work; canonical-table decisions. |
| Directional surveys / wells | `directional_survey*`, `new_wellbore_master` | AI-extracted survey data + wellbore master feeding the pipeline. |
| GIS layers | `gis_rrc_wells`, `gis_surveylines_2024`, `gis_surveys`, `gis_leases_centeriod` | Geospatial products generated by MView_X. |
| MVestimate | valuation calc (feeds owner reports/portfolio) | Owns the estimate engine and its labeling as an estimate (P3). |


## 7. Governance responsibilities
Nikhil is a primary contributor to, and is expected to keep current, these governance surfaces:
- `geospatial-directional-survey-pipeline-governance.md`
- `database-and-schema-governance.md` (co-owner)
- `rrc-data-governance.md`
- `analytics-layer-governance.md`
- `Data_Provenance_And_Freshness.md`
- `Playbook_Decline_And_Forecast.md`
- the entire governance corpus + Workbench (maintainer)

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- Raw RRC pulls (production, disposition, wellbore, permits, surveys) at a known vintage
- Scraper output from Riya (surface/bottom location, casing, production_county)
- DS-SME methodology review (Christos, Gabor)

**Produces (outputs others depend on):**
- Validated datasets + linkage powering the map, offset analytics, and reports
- MVestimate valuations
- GIS/geospatial products (MView_X)
- The governance corpus + Workbench that grounds every AI surface

## 9. Collaborators & dependencies
- **Works most closely with:** Ryan Cochran; Pranav Nandeshwar; DS SMEs Christos Batsios & Gabor Korosi; backend & frontend teams
- **Depends on:** RRC data availability/vintage; scraper freshness (Riya); ArcGIS/arcpy environment
- **People/teams who depend on this work:** Every analytics, map, report, and MVestimate surface; the whole team via the governance corpus

## 10. Domain risks & controls
Risks specific to Nikhil's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| RRC restates history → an asset looks 'lost' | Bitemporal handling: separate `vintage_date` from `cycle_year_month`; never let a restatement read as a disappeared asset (P4). Owner: Nikhil. |
| A modeled figure (EUR/cashflow) is shown as fact | Every MVestimate/derived number is labeled an estimate with confidence context (P3). |
| Synthetic well trajectory error | Straight-line SHL→landing→BHL rule (validated across tens of thousands of wells); no bend without new evidence + Ryan approval. |
| Ungrounded AI output | All AI surfaces grounded in the corpus; corpus grounded strictly in submitted material (no invention). |
| Overstated coverage | 'Not found' never implies 'doesn't exist'; Texas-only scope (P1/P2). |


## 11. Skills & tools
- **Languages / frameworks:** Python, pandas, pymongo, Flask; SQL
- **Tools / platforms:** PostgreSQL, MongoDB, OpenAI/Claude APIs, ArcGIS Pro (arcpy), Jupyter, Git (mvest2019), Windows Server
- **Domain knowledge:** RRC production data, decline/ARPS curves, directional surveys, minimum curvature, mineral-rights, bitemporal data

## 12. Open questions / blockers / help needed
- Confirm exact CRS/EPSG and output landing (Postgres vs file GDB) for MView_X — Ryan / DS SME.
- Confirm MWD-vs-GYRO precedence when surveys disagree.
- Confirm canonical destination table for the merged Mineral Owner 2025 dataset.

## 13. Operating sources & references
- `geospatial-directional-survey-pipeline-governance.md`
- `database-and-schema-governance.md`
- `database-schema-reference.md`
- `rrc-data-governance.md`
- `Playbook_Decline_And_Forecast.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`og_lease_cycle_production_dec_2025`** (32 columns): `oil_gas_code`, `district_no`, `lease_no`, `cycle_year`, `cycle_month`, `cycle_year_month`, `lease_no_district_no`, `operator_no`, `field_no`, `field_type`, `gas_well_no`, `prod_report_filed_flag`, `lease_oil_prod_vol`, `lease_oil_allow`, `lease_oil_ending_bal`, `lease_gas_prod_vol`, `lease_gas_allow`, `lease_gas_lift_inj_vol`, `lease_cond_prod_vol`, `lease_cond_limit`, `lease_cond_ending_bal`, `lease_csgd_prod_vol`, `lease_csgd_limit`, `lease_csgd_gas_lift`, `lease_oil_tot_disp`, `lease_gas_tot_disp`, `lease_cond_tot_disp`, `lease_csgd_tot_disp`, `district_name`, `lease_name`, `operator_name`, `field_name`

**`og_lease_cycle_disposition_dec_2025`** (52 columns): `oil_gas_code`, `district_no`, `lease_no`, `cycle_year`, `cycle_month`, `operator_no`, `field_no`, `cycle_year_month`, `lease_oil_dispcd00_vol`, `lease_oil_dispcd01_vol`, `lease_oil_dispcd02_vol`, `lease_oil_dispcd03_vol`, `lease_oil_dispcd04_vol`, `lease_oil_dispcd05_vol`, `lease_oil_dispcd06_vol`, `lease_oil_dispcd07_vol`, `lease_oil_dispcd08_vol`, `lease_oil_dispcd09_vol`, `lease_oil_dispcd99_vol`, `lease_gas_dispcd01_vol`, `lease_gas_dispcd02_vol`, `lease_gas_dispcd03_vol`, `lease_gas_dispcd04_vol`, `lease_gas_dispcd05_vol`, `lease_gas_dispcd06_vol`, `lease_gas_dispcd07_vol`, `lease_gas_dispcd08_vol`, `lease_gas_dispcd09_vol`, `lease_gas_dispcd99_vol`, `lease_cond_dispcd00_vol`, `lease_cond_dispcd01_vol`, `lease_cond_dispcd02_vol`, `lease_cond_dispcd03_vol`, `lease_cond_dispcd04_vol`, `lease_cond_dispcd05_vol`, `lease_cond_dispcd06_vol`, `lease_cond_dispcd07_vol`, `lease_cond_dispcd08_vol`, `lease_cond_dispcd99_vol`, `lease_csgd_dispcde01_vol`, `lease_csgd_dispcde02_vol`, `lease_csgd_dispcde03_vol`, `lease_csgd_dispcde04_vol`, `lease_csgd_dispcde05_vol`, `lease_csgd_dispcde06_vol`, `lease_csgd_dispcde07_vol`, `lease_csgd_dispcde08_vol`, `lease_csgd_dispcde99_vol`, `district_name`, `lease_name`, `operator_name`, `field_name`

**`og_wellbore_ewa`** (60 columns): `district_code`, `county_code`, `api_no`, `county_name`, `oil_gas_code`, `lease_name`, `field_number`, `field_name`, `lease_number`, `well_no_display`, `oil_unit_number`, `operator_name`, `operator_number`, `wb_water_land_code`, `multi_comp_flag`, `api_depth`, `wb_shut_in_date`, `wb_14b2_flag`, `well_type_name`, `wl_shut_in_date`, `plug_date`, `plug_lease_name`, `plug_operator_name`, `recent_permit`, `recent_permit_lease_name`, `recent_permit_operator_no`, `on_schedule`, `og_wellbore_ewa_id`, `w2_g1_filled_date`, `w2_g1_date`, `completion_date`, `w3_file_date`, `created_by`, `created_dt`, `modified_by`, `modified_dt`, `well_no`, `p5_renewal_month`, `p5_renewal_year`, `p5_org_status`, `curr_inact_yrs`, `curr_inact_mos`, `wl_14b2_ext_status`, `wl_14b2_mech_integ`, `wl_14b2_plg_ord_sf`, `wl_14b2_pollution`, `wl_14b2_fldops_hold`, `wl_14b2_h15_prob`, `wl_14b2_h15_delq`, `wl_14b2_oper_delq`, `wl_14b2_dist_sfp`, `wl_14b2_dist_sf_clnup`, `wl_14b2_dist_st_plg`, `wl_14b2_good_faith`, `wl_14b2_well_other`, `surf_eqp_viol`, `w3x_viol`, `h15_status_code`, `orig_completion_dt`, `new_api`

**`well_status_history`** (61 columns): `district_code`, `county_code`, `api_no`, `county_name`, `oil_gas_code`, `lease_name`, `field_number`, `field_name`, `lease_number`, `well_no_display`, `oil_unit_number`, `operator_name`, `operator_number`, `wb_water_land_code`, `multi_comp_flag`, `api_depth`, `wb_shut_in_date`, `wb_14b2_flag`, `well_type_name`, `wl_shut_in_date`, `plug_date`, `plug_lease_name`, `plug_operator_name`, `recent_permit`, `recent_permit_lease_name`, `recent_permit_operator_no`, `on_schedule`, `og_wellbore_ewa_id`, `w2_g1_filled_date`, `w2_g1_date`, `completion_date`, `w3_file_date`, `created_by`, `created_dt`, `modified_by`, `modified_dt`, `well_no`, `p5_renewal_month`, `p5_renewal_year`, `p5_org_status`, `curr_inact_yrs`, `curr_inact_mos`, `wl_14b2_ext_status`, `wl_14b2_mech_integ`, `wl_14b2_plg_ord_sf`, `wl_14b2_pollution`, `wl_14b2_fldops_hold`, `wl_14b2_h15_prob`, `wl_14b2_h15_delq`, `wl_14b2_oper_delq`, `wl_14b2_dist_sfp`, `wl_14b2_dist_sf_clnup`, `wl_14b2_dist_st_plg`, `wl_14b2_good_faith`, `wl_14b2_well_other`, `surf_eqp_viol`, `w3x_viol`, `h15_status_code`, `orig_completion_dt`, `file_name`, `create_ts`

**`linkage_data_new`** (83 columns): `mview_api`, `api14`, `tracking_no`, `tracking_date`, `lease_number`, `district_code`, `county`, `lease_name`, `field_name`, `reservoir`, `field_number`, `well_number`, `operator_number`, `operator_name`, `filing_purpose`, `filing_type`, `filing_welltype`, `recompletiondate`, `permit_type`, `permit_date`, `permit_number`, `spud_date`, `fpar_date`, `operation_date`, `lease_acres`, `elevation`, `total_tvd`, `total_md`, `test24_date`, `test24_chokesize`, `test24_oil`, `test24_gas`, `test24_water`, `test24_casing`, `oil_gravity`, `casing`, `liner`, `tubing`, `multiple_interval`, `from_md`, `to_md`, `ishydraulic_fracturing`, `remarks`, `form_path`, `directional_survey_path`, `plat_path`, `surfloc_x`, `surfloc_y`, `bhl_x`, `bhl_y`, `plugging_date`, `shut_in_date`, `playtype`, `status_number`, `status`, `isupdate`, `symnum`, `bottom_symnum`, `created_date`, `updated_date`, `surface_xnad27`, `surface_ynad27`, `bottom_xnad27`, `bottom_ynad27`, `wellboreprofiles`, `id`, `isnewinsert`, `i`, `new_api`, `dir_survey_name`, `dir_survey_pass`, `dir_survey_id`, `mwd_name`, `mwd_pass`, `mwd_id`, `gyro_name`, `gyro_pass`, `gyro_id`, `lastsyncdate`, `lastupdateddate`, `ispresent`, `submit_date`, `transformed_api`

**`mineralowner_2024`** (8 columns): `county`, `ownernumber`, `ownername`, `owneraddress`, `id2`, `id`, `ownercountyname`, `ownercity`

**`mineralownerproperty_2024`** (16 columns): `mineralownerid`, `propertydescription`, `districtcode`, `leasenumber`, `ri`, `value`, `ritype`, `leasename`, `leasedata`, `mineralownerid2`, `ownernumber`, `id`, `mineralaccountnumber`, `mineralaccountsequence`, `leaseacres`, `ri_updated`

**`directional_survey`** (8 columns): `id`, `filename`, `apinumber`, `tracking_no`, `status`, `new_api`, `updated_date`, `file_type`

**`directional_survey_child`** (11 columns): `id`, `directionalsurvey_id`, `md`, `inclinationangle`, `azimuth`, `tvd`, `calculatedtvd`, `x`, `y`, `calculatedx`, `calculatedy`

**`new_wellbore_master`** (29 columns): `district_code`, `Api_No`, `county`, `Well_Type`, `lease_name`, `field_number`, `field_name`, `lease_number`, `well_number`, `operator_name`, `operator_number`, `LAST_PROD_YM`, `FIRST_PROD_DATE`, `filing_welltype`, `recompletiondate`, `wellboreprofiles`, `latest_spud_date`, `ALLOWABLE_FLAG`, `DRILLER_FLAG`, `id`, `exist_flag`, `api14`, `latitude`, `longitude`, `bhl_x`, `bhl_y`, `lease_acres`, `to_md`, `updated_date`

**`gis_rrc_wells`** (8 columns): `gid`, `idx`, `api`, `api10`, `stcode`, `api_status`, `shape_leng`, `geom`

**`gis_surveys`** (6 columns): `gid`, `level1_sur`, `abstract_l`, `shape_leng`, `shape_area`, `geom`

**`gis_surveylines_2024`** (4 columns): `gid`, `ltype`, `shape_leng`, `geom`

**`gis_leases_centeriod`** (9 columns): `gid`, `lease_numb`, `dlease_id`, `long`, `lat`, `lease`, `district`, `orig_fid`, `geom`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Nikhil | — | — |
| Domain methodology / design decisions | C | Nikhil | Ryan Cochran (+ DS SME where data) | Ryan Cochran; Pranav Nandeshwar; DS SMEs Christos Batsios & Gabor Korosi; backend & frontend teams |
| Governance change in this area | C | Nikhil | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Nikhil | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** Raw RRC pulls (production, disposition, wellbore, permits, surveys) at a known vintage; Scraper output from Riya (surface/bottom location, casing, production_county); DS-SME methodology review (Christos, Gabor)

**This role transforms/produces:** Validated datasets + linkage powering the map, offset analytics, and reports; MVestimate valuations; GIS/geospatial products (MView_X); The governance corpus + Workbench that grounds every AI surface

**Downstream (depends on this role):** Every analytics, map, report, and MVestimate surface; the whole team via the governance corpus

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Data Scientist / AI Engineer / Data Engineer + Governance Maintainer** needs to be productive:

- **Stack & access:** Python, pandas, pymongo, Flask; SQL; tools — PostgreSQL, MongoDB, OpenAI/Claude APIs, ArcGIS Pro (arcpy), Jupyter, Git (mvest2019), Windows Server. Request least-privilege access to the systems in §6.
- **Read first:** `geospatial-directional-survey-pipeline-governance.md`, `database-and-schema-governance.md` (co-owner), `rrc-data-governance.md`, `analytics-layer-governance.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Ryan Cochran; Pranav Nandeshwar; DS SMEs Christos Batsios & Gabor Korosi; backend & frontend teams; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Nikhil Salunke's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

This section grounds Nikhil's scope against the live-verified platform knowledge base (`mview` + `mview-cerebro` KB), the Mongo + Postgres June-2026 backups, and the Pursuit CRM analysis. It is additive to §6/§14; nothing here is invented.

### 21.1 Repos & code surfaces
Nikhil is not a per-repo feature owner but the **data + governance layer beneath all five MView repos** (`MViewPortalAPI`, `MviewMapAPI`, `MV-Community`, `PresentationSiteAPI`, `Mview-Presentation-Next`) and the two Cerebro repos. His outputs (validated datasets, linkage, MVestimate docs, GIS products) are what those repos read. He also **authors and maintains the platform knowledge base itself** — the `mview`/`mview-cerebro` KB is the "AI Workbench governance" corpus described in his work summary; this governance corpus is the operating-company companion to it.

### 21.2 MongoDB collections owned / heavily touched
Beyond the Postgres tables in §14, Nikhil's work lands in and validates these MongoDB stores (`108.181.152.168:27017`):
- **`ProdMvestPortal`** — `MVestimateCalculations` (the DCF cache; `_id` = lease id, `mvestimates[]`, `total_cashflow_{mean,down,high}_sum`, and the known `yestarday_…` typo), `MonthlyProductionVolumes`, `MonthlyDispositionVolumes`, `TexasProduction`.
- **`GeoMapPortal`** — `WellGeoData`, `LeaseRadiusData`, `WellGeoData_Final` (map-ready geospatial products from MView_X).
- **`EF_SpAnalysis`** — spacing/allocation graph (`Neighbours_X2`/`_NAMES`, `UniqueWellsPerLease`, `Allocation_Reserves`, `Component_Allocation`, `Donuts`).
- **`Linkage_data`** — per-county-year linkage collections (e.g. `MIDLAND_2026`) that mirror the `linkage_data_new` shape.
- **`MineralOwnersInfoDB`** — `Mineral_Owners_Data` (per-lease) + `Mineral_Owners_Details` (aggregated) — the current 2025 cleanup target.
- **`Decline_data_to_web`** / **`Data_Allocation`** — web-formatted decline + allocation snapshots consumed by portfolio/report endpoints.

### 21.3 Governance-maintainer duties (expanded)
As governance maintainer Nikhil owns the accuracy of the KB and this corpus. Two concrete, newly-surfaced obligations:
- **Secret hygiene in the KB.** The KB `constitution.md` currently embeds live MongoDB/PostgreSQL connection strings, the platform JWT secret, and the Braintree merchant id — while itself declaring a `no-secrets-in-vcs` invariant. Nikhil owns raising this to Ryan/security and scrubbing the corpus to reference secrets by name only (see `_SECURITY_RISK_REGISTER.md`, risk SEC-001).
- **PG re-validation.** The KB's last live pass (2026-06-30) verified MongoDB only; the `table:`/function docs still need a PostgreSQL-prod connection to reconfirm columns. Nikhil owns closing that gap.

### 21.4 Cross-system dependency notes
Nikhil's MVestimate output is consumed directly by the portal (`MViewPortalAPI` `MyPortfolio`/`dashboard`/`FieldReport` services) and, indirectly, by the **Pursuit CRM's** feature framing (valuation is one of the 9 legal-proofed features). Any change to MVestimate labeling or bands therefore ripples into owner reports, portfolio, AND outbound outreach copy — so estimate-labeling (P3) is enforced at the source here.
