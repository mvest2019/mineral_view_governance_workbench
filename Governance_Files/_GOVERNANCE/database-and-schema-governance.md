# Database & Schema Governance (Production PostgreSQL)

> **Status:** NEW (deep) · **Owner:** Nikhil Salunke (data) + Vaishnavi (backend/infra) · **Reviewer:** DS SME (Christos Batsios / Gabor Korosi) · **Final approver:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Quarterly + on any schema/backup change
> **Source:** the June 2026 production PostgreSQL backup (`Postgress_Production_Backup`, 526 table exports, ~29.8 GB uncompressed) analysed 2026-07-02, plus the team work summaries. Full inventory in `database-schema-reference.md`.
> **Applies To:** Mineral View only. **Companion:** `database-schema-reference.md`, `database-source-inventory.md`, `database-backup-and-archive-governance.md`, `rrc-data-governance.md`, `geospatial-directional-survey-pipeline-governance.md`, `security-governance.md`, `privacy-and-data-use-governance.md`, `Data_Provenance_And_Freshness.md`.

---

## 1. Purpose & scope
Govern the **production PostgreSQL database** that backs Mineral View — its structure, the meaning and ownership of its data domains, how the domains join, and the rules that keep it trustworthy, private, and recoverable. This file is the governance layer; `database-schema-reference.md` is the exhaustive table-by-table inventory it points to. In scope: the `public` production schema, the RRC/warehouse data (`MviewDownload`), and the archival snapshots (`Archive`). Out of scope: MongoDB (serving layer — `backend-api-governance.md`) and the analytics computation layer (`analytics-layer-governance.md`), which consume this database.

## 2. Shape of the database (at a glance)
The production database is a **~30 GB, ~526-table** store organised into three trees that mirror how the business uses data:

| Tree | Role | Size |
|---|---|---|
| `Production/public` (92 tables) | Live application: users, claims, subscriptions/billing, operators, notifications, pricing, content, ops telemetry | ~0.95 GB |
| `MviewDownload` (~28.5 GB) | Data spine / warehouse: RRC production & disposition, wellbores, W-1 permits, W-2 completions, directional surveys, mineral owners & property, well↔lease↔owner linkage | ~28.5 GB |
| `Archive` (~1.9 GB) | Historical snapshots: prior-year owners/property, GIS layers, raw scraped JSON | ~1.9 GB |

**The dominant asset is `MviewDownload/rrc_og_production` (~22 GB)** — the RRC lease-cycle production (~12 GB) and disposition (~8.7 GB) history. Treat it as the crown jewels: its loss or exposure is the single largest data risk.

## 3. Canonical keys (MUST use consistently)
Every join and every new table keys on the same identifiers — do not invent parallel keys:
- **API-14 well number** — `api14` / `api_no` / `mview_api` / `new_api`. The unique well identity across wellbores, permits, completions, surveys, and linkage. Normalize to API-14; keep the RRC restatement caveat in mind when APIs are re-issued (`new_api`).
- **Lease number + district** — `lease_number` + `district_code`/`district_no`. The RRC lease identity for production, disposition, leases, and claims.
- **Owner number** — `ownernumber`. The mineral-owner identity joining owners → property → user claims.
- **Member id** — `member_id`. The application user joining users → claimed leases/owners, subscriptions, activity.
- **`linkage_data_new`** (83 cols) is the connective tissue tying API-14 → lease/field/reservoir → operator → permit → directional survey (MWD/GYRO) → surface/bottom-hole coordinates. It is the backbone of the map, offset analytics, and reports; changes to its shape are governed.

## 4. Data domains & ownership (RACI-lite)
| Domain | Key tables | Primary owner | Governance |
|---|---|---|---|
| Users / accounts / auth | `members_entity` (43), `member_session`, `user_login_activity`, `email_verification`, `cerebro_users`, `impersonation_audit`, `blocked_ips` | Vaishnavi / Sanskriti (backend) | `security-governance.md`, `privacy-and-data-use-governance.md` |
| Claims / ownership | `membersclaimedleases`, `memberleases`, `claimed_owners`, `professional_claimed_owners`, `lease_claim_requests` | Vaishnavi (backend) + frontend | `owner-portal-governance.md`, `claim-risk-register.md` |
| Subscriptions / billing / purchases | `subscription*`, `sub_*`, `subscriptionPayment`, `braintree_payment_response`, `purchase_*`, `pricing`, `enterprise_*` | Tushar (backend) | `terms-billing-and-refund-governance.md`, `free-tier-and-upgrade-path-governance.md` |
| RRC production & disposition | `og_lease_cycle_production_dec_2025` (32), `og_lease_cycle_disposition_dec_2025` (52), `og_wellbore_ewa` (60), `well_status_history` | Nikhil / Pranav (DS) | `rrc-data-governance.md`, `analytics-layer-governance.md` |
| Wells / permits / completions / surveys | `w1permits`, `w1wells`, `w1fields`, `w2_completions*`, `directional_survey*`, `new_wellbore_master`, `field_report` | Nikhil (DS) + backend | `geospatial-directional-survey-pipeline-governance.md`, `texas-oil-and-gas-domain-governance.md` |
| Mineral owners & property | `mineralowner_2023/2024`, `mineralownerproperty_2023/2024`, `mineral_owner_2025` shards, `countyspecific_mineralownerdata` | Nikhil (DS) | `Data_Provenance_And_Freshness.md`, `claim-risk-register.md` |
| Linkage | `linkage_data_new` (83) | Nikhil / Pranav (DS) | `geospatial-directional-survey-pipeline-governance.md` |
| Scraped source data | `scrapy_data/*` (surface/bottom location, casing/acid/tubing records, gas measurement, production_county), scraper telemetry, `audit_*` | Riya (acquisition) | `rrc-data-governance.md` |
| Operators | `operator_directory`, `operator_data*`, `operatorcountypages_*` | Tushar / Vaishnavi | `operator-directory-governance.md` |
| Notifications / agents | `notification_alert`, `notification_history`, `notification_templates`, `notificationtypes` | Vaishnavi + Pranav (events) | `product-and-feature-governance.md` |
| Analytics / behavior | `userbehavior`, `usersearchhistory`, `user_activity`, `apilogs` | Sanskriti + backend | `analytics-and-measurement-governance.md`, `privacy-and-data-use-governance.md` |
| Content / config | `landing_pages`, `content_data`, `marketupdates`, `pricing_faq`, `podcast_info`, `leasereportcontent` | Marketing/Content + backend | `blog-and-seo-content-governance.md`, `page-governance.md` |
| GIS layers | `gis_rrc_wells`, `gis_surveylines_2024`, `gis_surveys`, `gis_leases_centeriod`, `gis_districts`, `gis_grids` | Nikhil (DS/GIS) | `map-gis-governance.md`, `geospatial-directional-survey-pipeline-governance.md` |

## 5. Provenance & vintage (MUST — ties to P4)
- The `dec_2025` suffix on the production/disposition/wellbore tables is the **RRC pull vintage**. Because RRC **restates history**, a production figure is only as current as its vintage; keep the vintage explicit and prefer separating `vintage_date` (pull) from `cycle_year_month` (production month) so a restatement never reads as a disappeared asset (bitemporal rule, `rrc-data-governance.md`).
- Every warehouse table records how it was produced (scrape → transform → load). Ad-hoc edits to warehouse data break lineage and are not permitted — recompute from source + vintage instead.
- `Archive/*` snapshots exist to preserve prior versions (owners/property 2018–2022, older GIS); they are read-only history and must not be overwritten.

## 6. Privacy & security (MUST)
- **PII lives here.** `members_entity` holds names, emails, mailing addresses, phone numbers, **`password` (hashes)**, and reset tokens; `testusers`, `email_subscribe_users`, `send_message`, `invitations` hold real contact data; billing tables hold **Braintree** references. Treat these as sensitive per `privacy-and-data-use-governance.md` and `security-governance.md`.
- **At rest:** the database and every backup artifact (including the offsite Google Drive copy) must be **encrypted and access-controlled**; no public links; no credentials in code (committed-secret findings F-001…F-013 apply).
- **Access:** least-privilege DB roles; the professional **act-as-owner / impersonation** path is authorization-checked and written to `impersonation_audit`; internal `cerebro_users` are staff-only.
- **No PII in logs/analytics:** `apilogs`, `userbehavior`, and analytics never store raw financial/ownership values or secrets; aggregate before display.
- **Never expose owner/financial data across owners** — claims and portfolio reads are scoped to the `member_id` and their claimed `ownernumber`/leases.

## 7. Backup & recovery (MUST — ties to `database-backup-and-archive-governance.md`)
- **Scope check:** the automated PostgreSQL → Google Drive backup must actually capture the **`MviewDownload` trees (~28.5 GB, incl. the ~22 GB `rrc_og_production`)**, not just the small `public` schema. A backup that omits the warehouse is a false sense of safety.
- **Schedule + retention + monitoring:** scheduled generation, a stated retention window, and failure alerting; a silently missed backup is a governance incident.
- **Test-restore:** periodically restore to prove recoverability — a backup never restored is unproven. The ~30 GB size means restore time is itself a DR parameter to measure.
- **Governance data:** include the governance corpus + Workbench `governance.db` in backup scope so the approval trail survives recovery.

## 8. Schema-change control (MUST)
- Adding/removing/renaming a table or column, changing a canonical key, or changing the RRC vintage handling is a **governed change**: backend/DS review → Ryan approval → `DECISION_LOG.md` entry. Migrations are backward-safe and the DB is backed up before they run (`release-and-deployment-governance.md`, `incident-and-rollback-governance.md`).
- New tables are added to `database-schema-reference.md` and mapped to an owner in §4 here.
- Duplicate/backup tables in production (`members_entity_backup`, `notification_templates_temp`) are tech-debt to reconcile, not new sources of truth — do not build features against them.

## 9. Known observations (for Ryan / owners)
- **Duplicated snapshots in the live schema** (`members_entity_backup`, `notification_templates_temp`, multiple `sub_subscription_plan_duration*`) — candidates for cleanup; confirm the canonical table for each.
- **Year-suffixed data tables** (`mineralowner_2023/2024`, `mineralownerproperty_2023/2024`, `og_*_dec_2025`) — confirm the promotion/rollover policy so the app always reads the intended vintage.
- **`apilogs` (~858 MB) in the live DB** — confirm retention/rotation so operational logs don't bloat the production database.
- **312 `mineral_owner_2025` shards** — confirm the merge/cleanup endpoint and the single canonical destination table.
- **MongoDB & Redis** are referenced by the backend but not in this backup — confirm their backup/DR coverage separately.

## 10. Change log
- 2026-07-02 — File created from the June 2026 production backup analysis. Full table inventory in `database-schema-reference.md`.
