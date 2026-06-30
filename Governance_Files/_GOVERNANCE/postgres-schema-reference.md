# Mineral View — Postgres Production Schema

Status: DRAFT (v0.1 — derived from the June-2026 production dump)
Owner: Ryan Cochran (final authority)
Last Updated: 2026-06-23
Source: `MviewDownload` (3-part split zip, reassembled), `COPY`-style per-table dumps with headers

> Closes the System Map TODO "confirm the PostgreSQL topology." This is the **actual** production
> Postgres, mapped from the dump: 85 tables, ~4.75 GB uncompressed, ~28M+ rows, two schemas
> (`public` = app DB, `scrapy_data` = RRC scrape/audit pipeline). Column schema is complete
> because every dump file includes a header row.

---

## 🔴 Security & privacy (must read)

1. **`public.dblink_config` stores plaintext production credentials** — columns
   `id, ip_address, port, username, password, type, is_active`; the live row is
   `type='Production', port=5432`. **Credentials in clear text, now also inside this backup.**
   Escalates F-001 from "secrets in code" to "a credentials table in the DB and in exports."
   → Rotate the credentials; move secrets to a secret store / `dblink` foreign-server with a
   role, never a plaintext column; exclude this table from any export.
2. **Backup is high-volume PII.** ~4.1M owner identities (name + physical address) and ~9.7M
   owner→property interest rows (with royalty interest + value). Handle as confidential:
   encrypt at rest, restrict access, do not leave in shared/uploads locations, and define a
   retention/disposal rule. → Data Provenance + Security Register.

---

## Table inventory by domain

### A. Reference / master
| Table | Rows | Notes |
|---|---:|---|
| `counties` | 254 | id, county_name |
| `master_county` | — | county/district/FIPS map |
| `master_leases` | 496,297 | district/lease/name/county/acres |
| `master_operators` | 28,599 | operator number/name/address |
| `master_fields` | 59,031 | field number/name/reservoir |
| `playtypes` / `countyplaytypes` / `reservoir_playtypes` | — | play-type reference |
| `county_cities` / `field_rules` / `attachment_type` / `content_data` | — | reference/lookup |
| `purchase_county_years` | — | which owner table/year per county |
| `schema_mappings` | — | **in-DB governance/drift table**: `source_authority, schema_hash, drift_detected, human_reviewed, review_outcome` |

### B. Mineral owners (PII)
| Table | Rows | Notes |
|---|---:|---|
| `mineralowner_2023` | 2,889,341 | county, ownernumber, ownername, **owneraddress**, city |
| `mineralowner_2024` | 1,220,169 | same shape (PII) |
| `mineralownerproperty_2023` | 2,838,121 | owner→property: ri, value, ritype, leasename, acres |
| `mineralownerproperty_2024` | 6,903,875 | + `ri_updated` column (16 cols) |
| `mineralownerproperty_terry_2023` / `_tyler_2023` | — | per-county owner-property |
| `mineralownersdetailsbbycountysitemap` | 1,115,879 | SEO sitemap of owners |
| `countyspecific_mineralownerdata` | — | per-county owner aggregates |

### C. Wells & permits (W-1)
| Table | Rows | Notes |
|---|---:|---|
| `w1wells` | 864,983 | 34 cols: status/district/lease/operator/depth/type |
| `w1permits` | 849,825 | 28 cols: api, issued_date, `wellboreprofiles`, horizontal flags |
| `w1fields` | — | field rules/depths per permit |
| `w1permit_latitude` | — | permit status→lease link |
| `new_wellbore_master` | 179,709 | 29 cols: Api_No, Well_Type, first/last prod YM |
| `well_count` / `well_count_new` | — | per-county well/production counts (incl. mongo count) |

### D. Completions & tests (W-2)
| Table | Rows | Notes |
|---|---:|---|
| `w2_completions` | 326,844 | tracking_no, api, completion_date, iscurrent |
| `completion_form_summary` | 309,511 | 24-col completion summary |
| `w2_completionwells` | — | completion well + lat/long |
| `w2_completion_informations` | — | 38 cols: spud/first-prod dates, casing |
| `w2_completionattachment` | — | attachment links |
| `w2_formationrecords` / `w2_formationrecordchild` | — | formations, tvd/md, producing intervals |
| `w2_initialpotential_testdata` | — | IP test: oil/gas/gor/pressures |
| `w2_intervals` / `w2_permittypes` / `w2_fillinginformations` | — | intervals, permit types |
| `gastestdata` | 40,175 | gas test volumes/pressures |
| (`scrapy_data`) `w2_casingrecords`, `w2_acidfracture`, `w2_tubingrecords`, `w2_linearrecords`, `w2_remarks`, `w2_fielddata_pressurecalculations` | — | detailed completion sub-records |

### E. Geospatial / directional (well-trajectory source)
| Table | Rows | Notes |
|---|---:|---|
| `directional_survey` | 68,979 | survey file header: api, tracking_no, status |
| `directional_survey_child` | ~7.99M | md, inclinationangle, azimuth, tvd, x, y, calculated* |
| `directional_survey_exceptions` | — | parse exceptions |
| (`scrapy_data`) `bottomlocation` | 2,945,691 | BHL lat/long in **NAD27 + NAD83** |
| (`scrapy_data`) `surfacelocation` | 96,936 | SHL lat/long in NAD27 + NAD83 |
| (`scrapy_data`) `well_location` | — | surface/bottom filename map |

> This is the origin of the `bhl_x` (lat) / `bhl_y` (long) data used in the trajectory pipeline.

### F. Production (RRC lease-cycle)
| Table | Rows | Notes |
|---|---:|---|
| (`scrapy_data`) `og_lease_cycle_production` | 703,676 | 33 cols incl. `cycle_year_month`, `prod_report` flag |
| (`scrapy_data`) `og_lease_cycle_disposition` | 151,439 | 53 cols: disposition volumes by code |
| `og_lease_cycle_production_dec_2025` / `_disposition_dec_2025` | 5 / 5 | tiny **vintage snapshot** stubs (bitemporal pattern) |
| (`scrapy_data`) `production_county` / `_april` / `_nov` | — | per-county production (vintage variants) |
| `oil_gas_production_well_data` | — | yearly oil/gas/completion/permit rollup |

### G. Price & market
| Table | Rows | Notes |
|---|---:|---|
| `oil_gas_history_future` | 565 | **the price deck** — monthly oil/gas, **1990-01 → 2026-03** (history + forward). MVestimate multiplies net volume against this. |
| `oilgaspricing` | 324 | monthly pricing (overlaps deck) |
| `oilgashistorydata` | 11,375 | historical price pulls |
| `oilgasfuturepricingdata` | 232,316 | future-price fetch log (many daily fetches) |
| `marketupdates` | — | live ticker symbols/prices |

> **SSOT question:** four price tables with overlapping content. Confirm which is canonical for
> MVestimate (code reads `oil_gas_history_future`) and deprecate/clearly scope the rest.

### H. Pipeline & audit (`scrapy_data`)
`scrape_session_log`, `scraper_process_log`, `scraper_exceptions`, `scraper_exception_log`,
`scrapy_exceptions`, `invalid_data`, `audit_marketdata`, `audit_productpricing`,
`audit_surfacebottomlocation`, `audit_w1permits`, `audit_w2completions` — the scrape job ledger
(success/failure, snapshot URLs, timing). Useful for **Data Provenance & Freshness** (proves
how/when RRC data is pulled and where gaps occur).

### I. App / misc
| Table | Rows | Notes |
|---|---:|---|
| `dailyleases` | 12,951 | daily lease activity feed (29 cols) |
| `field_report` | 9,830 | 40-col field report |
| `dblink_config` | 1 | 🔴 **plaintext production credentials** (see Security) |

---

## How this fits the platform (confirmed from the data side)

- **Postgres is the system of record** for RRC-derived data (production, permits, completions,
  surveys, owners, prices); the **Mongo** collections (mapped separately from the June Mongo
  backup) are the **derived/serving** layer. This confirms the **Postgres → Mongo pipeline** that
  `New_Map_Final_Code` builds, previously only inferred from code.
- The **MVestimate** valuation chain is now fully grounded: production (`og_lease_cycle_*`) →
  decline fit (decline repos) → net volume × **`oil_gas_history_future`** price deck → value range.
- The **trajectory pipeline** source (`directional_survey_child`, `bottomlocation`,
  `surfacelocation`) is here in NAD27/NAD83.

## Open items / to confirm
1. Rotate `dblink_config` credentials; remove plaintext-secret column from schema and exports.
2. Define handling/retention for the PII tables; confirm legal basis (public RRC vs. compiled).
3. Resolve the **four price tables** to one canonical deck for MVestimate.
4. Confirm the role of `schema_mappings` (is the drift-detection governance loop active?).
5. Confirm whether the `_dec_2025` snapshot tables are the intended bitemporal vintage mechanism.
