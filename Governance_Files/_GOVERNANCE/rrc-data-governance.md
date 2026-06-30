# RRC Data Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Reviewer:** DS SME (Christos Batsios / Gabor Korosi) · **Final approver:** Ryan Cochran
> **Last Updated:** 2026-06-23 · **Review cadence:** Monthly (freshness) + quarterly · **Companion:** `data-architecture-governance.md`, `database-source-inventory.md`, `data-provenance-and-lineage-governance.md`, `news-and-regulatory-feed-governance.md`.

---

## 1. Purpose & scope
Govern ingestion and use of **Texas Railroad Commission (RRC)** data — the platform's dominant source and the input that everything downstream (decline, EUR, MVestimate, map, reports, news) depends on. The defining RRC challenge is **retroactive rewriting**: the RRC restates historical production between monthly pulls, so the platform **must** treat production as bitemporal or it will display false zeros ("your asset disappeared"), crash decline fitting on empty series, and erode the trust the brand is built on.

**In scope:** the RRC scrape pipeline, the production/disposition/permit/completion tables it populates, the zero/gap/vintage rules, and the user-facing constraints on RRC-derived figures. **Out of scope:** the decline math (`decline-curve-methodology-governance.md`) and the news feed's editorial rules (`news-and-regulatory-feed-governance.md`).

## 2. Source scope (what RRC supplies)
| RRC dataset | Platform tables |
|---|---|
| W-1 permits / wells | `w1permits`, `w1wells`, `w1fields`, `new_wellbore_master` |
| W-2 completions / tests | `w2_completions`, `completion_form_summary`, `w2_formationrecords`, `w2_initialpotential_testdata`, `gastestdata`, W-2 sub-records |
| Lease-cycle production | `og_lease_cycle_production` (~704K; `prod_report`, `cycle_year_month`) |
| Lease-cycle disposition | `og_lease_cycle_disposition` (~151K; 53 disposition-code columns) |
| Locations | `bottomlocation`, `surfacelocation` (NAD27 + NAD83) |
| Pricing | `oil_gas_history_future` (canonical deck) + price-fetch tables |
| Regulatory activity | the news feed (`Newsnew.xlsx`, 11,638 records) |

Dominance is confirmed: the News feed (11,638 RRC-activity records) plus the entire `scrapy_data` schema.

## 3. Scrape governance
The pipeline writes to `scrapy_data` with an **audit ledger** (`scrape_session_log`, `scraper_process_log`, `scraper_exceptions`, `scraper_exception_log`, `scrapy_exceptions`). Invalid records land in `invalid_data` with reasons. **MUST:** failures and gaps are **recorded**, never silently zeroed or dropped; the ledger is the freshness and provenance evidence for the whole platform.

## 4. Zero, gap & vintage rules (MUST)
The single most important RRC rule set:

| Condition | Meaning | UI rule |
|---|---|---|
| `prod_report = N` + zero volume | **Gap** — no report filed yet | **Do not** render as "production ended"; treat as not-yet-reported |
| `prod_report = Y` + zero volume | Genuine corrected-to-zero report | May render, **with** vintage |
| Two vintages disagree for a month | RRC rewrote history between pulls | Keep **both** (bitemporal); the newer **confirmed** vintage governs display |

Additional rules:
- `cycle_year_month` (the production month) and `vintage_date`/pull date (the data vintage) are **different axes** and **must not** be conflated.
- Decline/ARPS fitting **must** guard against empty/short series so a sparse or newly-gapped lease does not crash ("index -1 out of bounds").

**Worked evidence (`Historical_Production_Change.xlsx`):** 82% of rows showed zero production; of those, **7,776 were `flag=N` gaps** and **3,068 were genuine `flag=Y` zeros**. Lease **03_28091 ("Zion Grotto")** showed ~83,600 BOE producing in the May-2026 pull and ~7,500 BOE mostly-zero in the June-2026 pull; the bitemporal store holds both vintages (17 months × 2 vintages) so the earlier real production is not destroyed by the rewrite.

## 5. District & geography
RRC Districts 1–10 (including 7B, 7C, 8A); API-42 (Texas) prefix; stripper-well thresholds; 3 Texas basins. Scope is **Texas-only** (constitution P1).

## 6. User-facing rules
RRC-derived figures **must** carry provenance + vintage and be labeled as estimates where modeled. Regulatory-activity content **must not** become operator-steering or advice (guardrail flag, constitution P2) — present facts, not recommendations.

## 7. QA checklist
☐ Gap vs true-zero classified (`prod_report`) ☐ Vintage preserved (bitemporal) ☐ `cycle_year_month` ≠ vintage conflation avoided ☐ ARPS-guarded on empty series ☐ District/API valid ☐ Provenance + vintage shown ☐ No steering language ☐ Failures logged in the ledger, not zeroed.

## 8. Anti-patterns
Treating all zeros alike; overwriting prior vintages on a rewrite; crashing decline on empty series; conflating production month with vintage; steering from regulatory content; dropping scrape failures silently.

## 9. Evidence notes & gaps
Confirmed from `Historical_Production_Change.xlsx`, the PostgreSQL `og_lease_cycle_*` tables + `prod_report` flag, the `scrapy_data` audit ledger, and the News feed. **Not confirmed from the uploaded files:** whether the `og_lease_cycle_*_dec_2025` snapshots are the production bitemporal mechanism (G-3) and the exact scrape cadence.

---

## Addendum (2026-06-30) — RRC raw spatial data preparation (MView_X Stage 1)

Grounded in the `MView_X` repo and Nikhil Salunke's work summary. RRC ingestion now has a documented **spatial preparation** stage that turns raw RRC downloads into standardized geodatabase layers before any map/offset use:

- **Inputs:** county-level RRC **shapefile** downloads + **statewide API DBF** files.
- **Normalization:** build **normalized API-42 identifiers** so every record keys consistently across production, permits, surveys, and spatial layers.
- **Filtering:** keep only valid point records.
- **Projection:** project **surface-hole (SHL)** and **bottom-hole (BHL)** points to the **Texas statewide projected coordinate system**; calculate point coordinates.
- **Well-line layer:** build an operational well-line layer by **dissolving duplicated line segments**.

**MUST:** SHL/BHL coordinates produced here are authoritative for the geospatial pipeline; downstream stages and the serving map must not silently re-project or override them. Full stage-by-stage rules live in `geospatial-directional-survey-pipeline-governance.md`.
