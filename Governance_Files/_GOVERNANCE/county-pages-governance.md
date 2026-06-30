# County Pages Governance

> **Status:** ENHANCED (deep) · **Owner:** Content/SEO/Data · **Reviewer:** Legal (PII) · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Companion:** `seo-governance.md`, `data-provenance-and-lineage-governance.md`, `privacy-and-data-use-governance.md`.

---

## 1. Purpose & scope
Govern **programmatic Texas county pages** (per-county owner/production data + SEO) — high-volume pages that carry both PII-exposure and thin-content risks.

## 2. Data rules (MUST)
County data from `Linkage_data` per-county collections + Postgres; **provenance + vintage** shown; estimates labeled. PII **must not** be bulk-exposed — the owner sitemap (`mineralownersdetailsbbycountysitemap`) is a **governed** surface, not a raw dump of names/addresses.

## 3. SEO rules
Unique title/meta per county; one H1; internal links to relevant glossary/operators; clean slug (`/county/<name>`); **avoid thin duplicate templates** — each page must carry real per-county data to justify indexing.

## 4. Texas scope
Counties are Texas-only; districts referenced correctly (1–10 incl. 7B/7C/8A).

## 5. QA checklist
☐ Real per-county data (not thin) ☐ Unique meta ☐ Provenance/vintage ☐ No bulk PII ☐ Internal links ☐ Texas-only ☐ One H1.

## 6. Anti-patterns
Thin duplicate county templates; exposing bulk owner PII; missing provenance; non-Texas counties.

## 7. Evidence notes & gaps
Per-county structure confirmed from Mongo `Linkage_data` + `mineralownersdetailsbbycountysitemap`. Exact page template **Not confirmed from the uploaded files**.

---

## Deep context (2026-06-30) — county pages as a scalable SEO + data surface

County pages are programmatic, **Texas-county-scoped** pages that capture local search intent ("mineral rights in [County]") and route owners toward search/claim. They sit at the intersection of SEO and real data.

**Rules (MUST):**
- **Texas-only (P1):** only Texas counties; never imply other states.
- **Real data, vintaged:** any production/well/operator figures shown are RRC-derived with **source + vintage** (P4) and inherit RRC's restatement caveat; **estimates labeled** (P3).
- **Uniqueness:** each county page has unique title/meta/H1/content — no thin duplicated boilerplate (programmatic ≠ duplicate); logical headings and internal links to glossary/feature pages.
- **No overstatement (P2):** describe coverage accurately for that county; don't claim data the county doesn't have.
- **Consistency:** county naming/identity matches the canonical county set used by the map/data layers; new counties follow the publish + QA gates.
