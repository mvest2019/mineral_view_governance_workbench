# Team Member Governance — Riya Wankhade

> **Status:** Team profile (governed, deep) · **Role:** Python Developer (Web Scraping) · **Department(s):** DATA_ACQUISITION
> **Reports to:** Ryan Cochran · **Experience in project:** 2.5+ years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Riya Wankhade's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Riya Wankhade |
| **Role / Title** | Python Developer (Web Scraping) |
| **Department(s)** | DATA_ACQUISITION |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | 2.5+ years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Daily/monthly/yearly scrapers · data validation · DB integration |

## 2. Snapshot
**Purpose at Mineral View (one line):** Owns the data-acquisition layer — the scrapers and validation that feed the platform's source data.

**Focused on right now:** Scraper maintenance (adapting to source changes) and validation automation.

**Top priorities:**
- Keep daily/monthly/yearly scrapers healthy
- Automate data validation
- Improve automation reliability & alerting

## 3. Role in the platform (context)
Riya is the **front door for source data** — everything downstream (production analytics, wells, permits, surveys, locations) begins with her scrapers. Reliability and validation here determine the freshness and trustworthiness of the whole platform.

## 4. Work completed so far at Mineral View
**Scrapers (daily / monthly / yearly)** — built and maintains scheduled scraping automations that collect RRC and related source data into the warehouse (`scrapy_data/*`).

**Data processing & validation** — record validation, consistency validation, and data-integrity validation on scraped data before it lands.

**Database integration & maintenance** — loads and maintains scraped datasets; keeps the acquisition layer consistent.

**Resilience engineering** — handled website-structure changes, large data volumes, data-quality issues, and automation reliability.

## 5. Current work (in progress)
- Scraper maintenance — adapting scrapers to source website changes.
- Validation-automation improvements.

_'Done' means scrapers self-recover or alert on source changes, and validation catches bad data before it reaches analytics._

## 6. Data & systems ownership
This maps what Riya owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Scraped source data | `scrapy_data/*` — `surfacelocation` (285 MB), `bottomlocation` (337 MB), `w2_casingrecords`, `w2_acidfracture`, `w2_tubingrecords`, `w2_linearrecords`, `production_county*`, `gasmeasurement*` | Raw inbound RRC/well data before transform; Riya owns its collection + validation. |
| Scraper telemetry | `scraper_exceptions`, `scrape_session_log`, `scraper_process_log`, `scrapy_exceptions`, `invalid_data` | Health/observability of the acquisition layer. |
| Audit tables | `audit_w1permits`, `audit_w2completions`, `audit_surfacebottomlocation`, `audit_marketdata`, `audit_productpricing` | Change/version audit of scraped data. |


## 7. Governance responsibilities
Riya is a primary contributor to, and is expected to keep current, these governance surfaces:
- `rrc-data-governance.md`
- `Data_Provenance_And_Freshness.md`
- `_REPO_INVENTORY.md` (scraper repos)
- `database-and-schema-governance.md` (contributor)

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- External source websites (RRC and related) — structure and availability
- Scheduling infrastructure

**Produces (outputs others depend on):**
- Fresh, validated source data (`scrapy_data/*`) that every downstream pipeline depends on
- Scraper health telemetry + audit trail

## 9. Collaborators & dependencies
- **Works most closely with:** Nikhil & Pranav (data consumers); backend team; Ryan
- **Depends on:** External source-site structure/availability; the scraping schedule
- **People/teams who depend on this work:** All downstream data pipelines, analytics, map, and reports

## 10. Domain risks & controls
Risks specific to Riya's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Source site changes → scraper breaks silently → stale data | Telemetry + alerting on scraper failure; validation blocks bad loads; freshness/vintage tagging (P4). |
| Large-volume runs degrade reliability | Batch/chunk processing; retries; monitored sessions. |
| Bad scraped data corrupts analytics | Record/consistency/integrity validation before load; `invalid_data` quarantine. |


## 11. Skills & tools
- **Languages / frameworks:** Python
- **Tools / platforms:** Scraping/automation stack, PostgreSQL/MongoDB, Git, Windows Task Scheduler
- **Domain knowledge:** RRC and related source sites, data validation, scraping reliability, vintage

## 12. Open questions / blockers / help needed
- Confirm alerting/ownership when a source site changes and a scraper breaks.
- Confirm retention/vintage tagging convention on scraped pulls.

## 13. Operating sources & references
- `rrc-data-governance.md`
- `Data_Provenance_And_Freshness.md`
- `database-schema-reference.md`
- `_REPO_INVENTORY.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`surfacelocation`** (16 columns): `id`, `surfaceid`, `surfacelatitude27`, `surfacelongitude27`, `bottomholelatitude27`, `bottomholelongitude27`, `well_locationid`, `surfacelatitude83`, `surfacelongitude83`, `apinumber`, `symnum`, `reliab`, `wellid`, `xnad27`, `ynad27`, `updated_date`

**`bottomlocation`** (19 columns): `id`, `bottomholeid`, `surfaceid`, `apinumber`, `stcode`, `wellnumber`, `bottomholelatitude27`, `bottomholelongitude27`, `bottomholelatitude83`, `bottomholelongitude83`, `well_locationid`, `symnum`, `reliab`, `out_fips`, `radioact`, `wellid`, `xnad27`, `ynad27`, `updated_date`

**`w2_casingrecords`** (14 columns): `id`, `tracking_no`, `fieldname`, `casingtype`, `casingsize`, `holesize`, `settingdepth`, `multistagetooldepth`, `multistageshoedepth`, `cementclass`, `cementamount`, `slurryvolume`, `cementtop`, `tocdeterminedby`

**`w2_acidfracture`** (8 columns): `id`, `tracking_no`, `ishydraulicfracturing`, `isdownholeactuationsleeve`, `actuationpressure`, `psigpriorhydrafracturing`, `psigduringhydrafracturing`, `isswr29`

**`w2_tubingrecords`** (5 columns): `id`, `tracking_no`, `size`, `depthsize`, `packerdepthtype`

**`production_county`** (9 columns): `id`, `lease_name`, `lease_number`, `county`, `district_code`, `oil_bbl`, `casinghead_mcf`, `gw_gas_mcf`, `condensate_bbl`

**`gasmeasurement_data`** (6 columns): `id`, `tracking_no`, `testdate`, `gasmeasurementmethod`, `gasproductionduringtest`, `iswellpreflowed`

**`scraper_exceptions`** (10 columns): `id`, `api_number`, `scanlog_id`, `scraper_type`, `exception_text`, `createts`, `tracking_no`, `status_number`, `district_code`, `lease_number`

**`invalid_data`** (11 columns): `id`, `api_number`, `scanlog_id`, `scraper_type`, `error_message`, `creatts`, `tracking_no`, `status_number`, `district_code`, `lease_number`, `production_id`

**`audit_w1permits`** (8 columns): `id`, `status_number`, `status`, `snapshot_url`, `time`, `scanlog_id`, `exceptions`, `api_number`

**`audit_w2completions`** (7 columns): `id`, `scanlog_id`, `tracking_no`, `start_time`, `end_time`, `pde_path`, `status`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Riya | — | — |
| Domain methodology / design decisions | C | Riya | Ryan Cochran (+ DS SME where data) | Nikhil & Pranav (data consumers); backend team; Ryan |
| Governance change in this area | C | Riya | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Riya | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** External source websites (RRC and related) — structure and availability; Scheduling infrastructure

**This role transforms/produces:** Fresh, validated source data (`scrapy_data/*`) that every downstream pipeline depends on; Scraper health telemetry + audit trail

**Downstream (depends on this role):** All downstream data pipelines, analytics, map, and reports

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Python Developer (Web Scraping)** needs to be productive:

- **Stack & access:** Python; tools — Scraping/automation stack, PostgreSQL/MongoDB, Git, Windows Task Scheduler. Request least-privilege access to the systems in §6.
- **Read first:** `rrc-data-governance.md`, `Data_Provenance_And_Freshness.md`, `_REPO_INVENTORY.md` (scraper repos), `database-and-schema-governance.md` (contributor), plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Nikhil & Pranav (data consumers); backend team; Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Riya Wankhade's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Riya's data-acquisition scope against the actual scraper-output tables in the Postgres backup and the RRC/source pipeline. Additive to earlier sections.

### 21.1 Scraper output → production tables (Postgres backup, June 2026)
Riya's scrapers are the upstream source of the `scrapy_data` and `Archive/scrapy_data` trees and several warehouse tables. Concretely:
- **Daily** — W-1 permits (`audit_w1permits`, `Archive/scrapy_data/w1*`), completion reports (`w2_*`, `w2_completions_jsondata`), well location (`surfacelocation`, `bottomlocation`, `well_location`), commodity/product pricing (`audit_productpricing`, `audit_marketdata`).
- **Monthly** — production (`production_county`, `production_county_april/nov`, `og_lease_cycle_production` working copy), wellbore, investor-presentation data.
- **Yearly** — county-wise mineral-owner rolls (`mineralowner_2025_<county>`, `mineralownerproperty_2025_<county>` — the 155+155 per-county shards Nikhil then cleans).
- **Audit/robustness** — `invalid_data`, `scrape_session_log`, `scraper_process_log`, `audit_surfacebottomlocation` capture run health, exceptions, and source-to-destination validation.

### 21.2 Resilience patterns (governed)
Source-website structure changes are the top recurring risk; Riya updates selectors/logic and re-validates. Governed controls: record, consistency, and integrity validation (missing/mandatory/duplicate checks; date/format/numeric; source-to-destination record comparison; publishing-readiness) before data is promoted. Freshness/vintage of every pull must be recorded (P4) so downstream (Nikhil/Pranav) can reason about RRC restatements.

### 21.3 Handoff
Riya's validated output is consumed by **Nikhil** (linkage, GIS, MVestimate inputs) and **Pranav** (production series, allocation). A scraper break or silent under-count propagates into the map, offset analytics, MVestimate, and alerts — so scraper monitoring is a platform-critical control, not a background task.
