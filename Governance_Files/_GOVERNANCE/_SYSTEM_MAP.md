# Data Architecture Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Reviewer:** DS SME (Christos Batsios / Gabor Korosi) · **Final approver:** Ryan Cochran
> **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly + on any new backup or schema change · **Change class:** Major for schema/serving changes
> **Builds on:** existing `_GOVERNANCE` provenance/data policies. **Companion:** `database-source-inventory.md` (column-level), `data-provenance-and-lineage-governance.md`, `rrc-data-governance.md`, `database-backup-and-archive-governance.md`, `security-governance.md`, `map-gis-governance.md`.

---

## 1. Purpose & scope

This file is the **architectural contract** for Mineral View's data. It governs the structure, flow, freshness, quality, and sensitivity of every data asset that ends up in front of a user, from the raw RRC scrape through to the dollar figure on an Owner Dossier. The provenance, RRC, backup, analytics, and security files all build on the model defined here.

It exists because Mineral View's entire value proposition rests on one fragile chain: **public regulatory data that the RRC rewrites retroactively → modeled estimates about real people's assets**. If any link in that chain loses its source, its vintage, or its true-zero-vs-gap distinction, the platform will confidently display wrong numbers — false "your asset disappeared" states, overstated values, or crashed forecasts. The rules here are the discipline that keeps that from happening.

**In scope:** ingestion (the RRC scrape), the canonical PostgreSQL schema (85 tables, two schemas, ~28M+ rows), the transformation/allocation/valuation layer (`Decline_curve`, `DeclineCurve2026`, Nikhil Salunke's "108" MVestimate repo, `New_Map_Final_Code`, `Operator-Directory`), the MongoDB serving layer, and the rules that keep customer-facing figures provenance-true and vintage-correct.

**Out of scope:** the per-column table listing (that lives in `database-source-inventory.md`), backup mechanics (`database-backup-and-archive-governance.md`), and the decline/valuation math itself (`decline-curve-methodology-governance.md`, `mvestimate-governance.md`).

## 2. Canonical architecture (confirmed from code + the 2026-06 PostgreSQL dump)

```
Texas RRC  (W-1 permits · W-2 completions · lease-cycle production/disposition · pricing · regulatory activity)
     │   scrape jobs  →  audit ledger (scrapy_data.scrape_session_log / scraper_process_log / *_exceptions / invalid_data)
     ▼
PostgreSQL  ─────────────────────────────────────────────────────────────────  [SYSTEM OF RECORD]
   • schema `scrapy_data`  = raw scrape + audit (production/disposition, W-2 sub-records, locations, audit logs)
   • schema `public`       = application data, reference/master, owners (PII), prices, GIS, app tables
     │   transformation · lease→well allocation · decline fit · valuation · GIS build
     │   (Decline_curve · DeclineCurve2026 · "108" MVestimate [owner: Nikhil] · New_Map_Final_Code · Operator-Directory)
     ▼
MongoDB  ────────────────────────────────────────────────────────────────────  [SERVING LAYER]
   • Linkage_data (per-county collections, all Texas) · production · wells · allocation · linkage · operator
   • acre-well percentiles · adjacency · county rollups · operator content
     │
     ▼
Portal / Map / Site APIs  (MViewPortalAPI · MviewMapAPI · PresentationSiteAPI)
     ▼
Website / Portal UI
```

**Source-of-truth rule (MUST):** PostgreSQL is authoritative for raw RRC/GIS/appraisal **facts**. MongoDB is a **derived serving layer** — it **must not** be treated as a source of truth for raw facts, and **every** analytics value in Mongo **must** be reproducible from PostgreSQL plus the documented methodology. If Mongo and Postgres disagree on a raw fact, **Postgres wins** and the Mongo build is corrected and re-run.

## 3. PostgreSQL governance, by domain

The exact column lists live in `database-source-inventory.md`. The architectural governance rules per domain:

### 3.1 Reference / master
Tables: `counties`, `master_county`, `master_leases`, `master_operators`, `master_fields`, the play-type and city references, and the in-DB governance table `schema_mappings`.
- These are the canonical join keys for the whole platform. Changes to key columns (lease number, operator number, field number, district, county) are **Major** changes — they ripple into every downstream serving collection.
- `master_operators` is the canonical operator list; display names come through the sanitized operator-name mapping (`operator-directory-governance.md`), never raw.
- `schema_mappings` is an **existing in-DB drift mechanism** (`source_authority`, `schema_hash`, `drift_detected`, `human_reviewed`, `review_outcome`); use it to record RRC schema drift rather than building a parallel mechanism.

### 3.2 Mineral owners (PII) — highest sensitivity
Tables: `mineralowner_2023` (~2.89M), `mineralowner_2024` (~1.22M), `mineralownerproperty_2023` (~2.84M), `mineralownerproperty_2024` (~6.90M), `mineralownersdetailsbbycountysitemap` (~1.12M), `countyspecific_mineralownerdata`, `purchase_county_years`.
- These hold **names + physical addresses + royalty interest (`ri`) + value** — the platform's primary privacy exposure. Handling is governed by `privacy-and-data-use-governance.md`.
- **MUST NOT** be bulk-exposed through any public API. A user may access their **entitled** owner record within tier limits only.
- The **year-partitioned** design (`_2023`, `_2024`) is a vintage mechanism; serving **must** read the intended year and not silently blend vintages.
- `purchase_county_years` maps which owner table/year applies per county — this is the routing layer and **must** stay correct or county pages will read the wrong vintage.

### 3.3 Wells & permits (W-1)
Tables: `w1wells` (~865K), `w1permits` (~850K), `w1fields`, `w1permit_latitude`, `new_wellbore_master` (~180K), `well_count`, `well_count_new`.
- W-1 is the **permit/well master**; `new_wellbore_master` carries first/last production year-month — used for activity and decline windows.
- Horizontal-wellbore and stacked-lateral flags in `w1permits` feed lateral-aware logic (acre/well 8,000-ft lateral reference).
- `well_count`/`well_count_new` carry per-county rollups including a `mongomonthlyproductioncount` — a **derived** counter that **must** reconcile with the Mongo serving layer.

### 3.4 Completions & tests (W-2)
Tables: `w2_completions` (~327K), `completion_form_summary` (~310K), `w2_completionwells`, `w2_completion_informations`, `w2_formationrecords`/`_child`, `w2_initialpotential_testdata`, `w2_intervals`, `w2_permittypes`, `w2_fillinginformations`, `gastestdata` (~40K), and the `scrapy_data` sub-records (`w2_casingrecords`, `w2_acidfracture`, `w2_tubingrecords`, `w2_linearrecords`, `w2_remarks`, `w2_fielddata_pressurecalculations`).
- These supply **formation tops**, completion dates, initial-potential tests, and reservoir detail behind the Well/Reservoir reports.
- `iscurrent` / `new_api` columns track completion revisions — serving **must** prefer the current completion and preserve the API renumber history.

### 3.5 Geospatial / directional
Tables: `directional_survey` (~69K), `directional_survey_child` (~7.99M), `directional_survey_exceptions`, `bottomlocation` (~2.95M), `surfacelocation` (~97K), `well_location`.
- `directional_survey_child` is the **trajectory point cloud** (md, inclination, azimuth, tvd, x/y, calculated x/y) — the source for well-path rendering.
- `bottomlocation`/`surfacelocation` carry coordinates in **both NAD27 and NAD83**; serving **must** select the correct datum consistently.
- **Schema quirk (MUST remember):** in the platform's storage, `bhl_x` holds **latitude** and `bhl_y` holds **longitude** — the opposite of the usual GIS convention. Mishandling this silently mislocates wells. See `map-gis-governance.md`.
- All served coordinates **must** validate within Texas bounds before rendering.

### 3.6 Production (RRC lease-cycle)
Tables: `scrapy_data.og_lease_cycle_production` (~704K; 33 cols incl. `cycle_year_month`, `prod_report`), `scrapy_data.og_lease_cycle_disposition` (~151K; 53 cols of disposition volumes by code), the `public.og_lease_cycle_*_dec_2025` snapshots (5 rows each), `production_county`/`_april`/`_nov`, `oil_gas_production_well_data`.
- This is the **production heart** that feeds decline, EUR, and MVestimate.
- The `prod_report` flag is load-bearing: **`flag = N` + zero = a gap (no report filed)**, not a true zero; **`flag = Y` + zero = a genuine corrected-to-zero**. The UI **must not** render a gap as "production ended."
- `cycle_year_month` is the **production month**; the pull/`vintage_date` is the **data vintage** — they are different axes and **must not** be conflated.
- The `_dec_2025` snapshots and the `production_county_{april,nov}` variants are **vintage snapshots**; whether they are the production bitemporal mechanism is an open confirmation (G-3).

### 3.7 Price & market
Tables: `oil_gas_history_future` (565; 1990→2026 monthly oil+gas — **the canonical deck**), `oilgaspricing` (324), `oilgashistorydata` (~11K), `oilgasfuturepricingdata` (~232K daily-fetch log), `marketupdates` (live ticker).
- **SSOT rule (MUST):** MVestimate reads **`oil_gas_history_future` only**. The other three price tables **must not** feed valuation; they are scoped to their own purposes (raw fetch log, history, legacy pricing) or deprecated.
- The deck has both history **and** forward months (hence "history_future"); the canonical deck **must** have no month gaps across the active horizon.

### 3.8 Pipeline & audit (`scrapy_data`)
Tables: `scrape_session_log`, `scraper_process_log`, `scraper_exceptions`, `scraper_exception_log`, `scrapy_exceptions`, `invalid_data`, and the `audit_*` tables.
- This ledger is the **freshness and provenance evidence** for the whole platform: it records what was pulled, when, with what success, and where it failed. Failures and gaps **must** be recorded here, never silently zeroed.

### 3.9 App / misc — including the security finding
Tables: `dailyleases` (~13K), `field_report` (~10K), `field_rules`, `content_data`, and **`dblink_config`**.
- 🔴 **`dblink_config` stores plaintext production credentials** (`ip_address, port, username, password, type='Production'`). It **must** be removed from the schema (replaced by a role/secret store) and **excluded from every export** (F-DB-014, `security-governance.md`).

## 4. MongoDB governance

| Area | Rule (MUST) | Rationale |
|---|---|---|
| Derivation | Every collection documents its PostgreSQL source + transformation | Reproducibility / audit |
| County linkage | `Linkage_data` per-county collections stay key-consistent with Postgres well/lease/operator IDs | Map + dossier integrity |
| Reproducibility | A reviewer can regenerate any Mongo analytics value from Postgres + methodology | No "magic numbers" |
| No raw-fact authority | Mongo never overrides Postgres on a raw fact | Single source of truth |
| Counter reconciliation | Derived counters (e.g. `well_count.mongomonthlyproductioncount`) reconcile with Mongo | Detect drift |

## 5. Data freshness & vintage rules
- The scrape ledger is the **freshness evidence**; customer-facing data **should** expose, or be governed by, an "as-of" vintage.
- Retroactive RRC rewrites are **expected**; bitemporal handling (`vintage_date` vs `cycle_year_month`) **must** be preserved so historical months don't falsely flip to zero. Worked evidence: `Historical_Production_Change.xlsx` — 82% zero rows, of which **7,776 were `flag=N` gaps** and **3,068 were genuine `flag=Y` zeros**; lease **03_28091 ("Zion Grotto")** went from ~83,600 BOE (May-2026 pull) to ~7,500 BOE mostly-zero (June-2026 pull), and the bitemporal store keeps both vintages so history is not destroyed.

## 6. Data quality checks (MUST run before serving)
1. **Zero classification** — every zero-production row classified true-zero (`flag=Y`, zero volume) vs gap (`flag=N`).
2. **ARPS guard** — decline fitting guards against empty/short series (no "index -1 out of bounds").
3. **Coordinate sanity** — lat/long within Texas; `bhl_x`/`bhl_y` orientation and NAD27/83 datum handled.
4. **Key integrity** — lease/well/operator/field keys join cleanly across Postgres and Mongo.
5. **Price continuity** — the canonical deck has no month gaps across the active horizon.
6. **Vintage labeling** — no report mixes vintages without a label.
7. **Counter reconciliation** — derived counts match between Postgres rollups and Mongo.

## 7. Sensitive data handling
| Class | Rule |
|---|---|
| PII (owner names/addresses/interest) | Encrypt at rest; restrict access; never bulk-expose; define retention (`privacy-and-data-use-governance.md`) |
| Credentials | Never in code, exports, or governance files; `dblink_config` excluded from exports (`security-governance.md`) |
| Public RRC facts | May be served **with** provenance + vintage; estimates labeled |

## 8. Backup & archive
Governed by `database-backup-and-archive-governance.md`. Key rule: backups containing PII or `dblink_config` **must** be encrypted and access-controlled and **must not** be placed in shared/uploads or public storage. (The 2026-06 PostgreSQL backup contained both — the exact pattern to avoid.)

## 9. Ownership & review
| Area | Owner | Reviewer | Final |
|---|---|---|---|
| PostgreSQL schema & ETL | Nikhil Salunke | DS SME | Ryan |
| MongoDB analytics | DS SME | Nikhil Salunke | Ryan |
| Provenance & freshness | Nikhil Salunke | DS SME | Ryan |
| Price-deck SSOT | Nikhil Salunke | DS SME | Ryan |

## 10. Anti-patterns
Treating Mongo as source of truth; reading a non-canonical price table into MVestimate; rendering `flag=N` zeros as ended production; mixing vintages unlabeled; exporting `dblink_config`; bulk-exposing PII; assuming `bhl_x` is longitude; blending owner-table years; building a parallel drift mechanism instead of using `schema_mappings`.

## 11. Evidence notes & gaps
Architecture, the 85-table schema, and the column-level detail are confirmed from the 2026-06 dump; the Postgres→Mongo pipeline is now grounded (previously code-only inference). **Not confirmed from the uploaded files:** the exact "Postgres ×3" database count/roles (G-4), whether `*_dec_2025` is the production bitemporal mechanism (G-3), Mongo index/shard details, and whether the `schema_mappings` drift loop is actively run (G-5).
