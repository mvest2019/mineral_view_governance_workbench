# Analytics-Layer Governance

> **Status:** ENHANCED (deep) · **Owner:** DS SME · **Reviewer:** Nikhil · **Final approver:** Ryan · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Source:** MongoDB backup, "108" repo, map/allocation repos · **Companion:** `data-architecture-governance.md`, `data-provenance-and-lineage-governance.md`.

---

## 1. Purpose & scope
Govern the **MongoDB-served analytics outputs** derived from Postgres — the layer that powers the map, dossier, and operator surfaces. The governing principle: analytics are derived and reproducible, never a source of truth for raw facts.

## 2. Analytics outputs
Per-county well linkage (`Linkage_data`), allocated production, acre/well "donut" percentiles, adjacency, county rollups, operator content.

## 3. Derivation rules (MUST)
Every output documents its **Postgres source + transformation** and is **reproducible** by a reviewer. Mongo is a serving layer; it never overrides Postgres on a raw fact.

## 4. Accuracy standards
Percentiles, rollups, and adjacency match the documented methodology; changes are SME-reviewed and **versioned**. Acre/well density uses the documented spatial method.

## 5. User-facing rules
Analytics are modeled/aggregated; **must** carry provenance + vintage and **must not** be presented as audited financials or advice.

## 6. QA checklist
☐ Source + transformation documented ☐ Reproducible from Postgres ☐ Keys consistent ☐ Methodology version noted ☐ Provenance shown ☐ Estimate labeled where modeled.

## 7. Anti-patterns
Mongo as source of truth; unreproducible "magic" percentiles; unversioned method changes; presenting analytics as audited values.

## 8. Evidence notes & gaps
Outputs confirmed from prior Mongo analysis + map/allocation repos. Exact collection schemas/indexes **Not confirmed from the uploaded files**.

---

## Deep context (2026-06-30) — the analytics layer vs. the serving layer

The **analytics layer** is the Python/data-science computation tier (forecasting, allocation, cashflow, decline, geospatial intelligence) that sits **between** the system of record (Postgres) and the serving layer (Mongo/API). It is owned by Data Science (Nikhil, Pranav + SMEs Christos/Gabor).

**Rules (MUST):**
- **Inputs are vintaged:** the layer consumes RRC-derived data at a known **vintage**; outputs inherit and record that vintage (P4). Because RRC rewrites history, recompute on new pulls rather than trusting cached results.
- **Estimates are labeled:** every modeled output (EUR, decline, BOE/month, cashflow, allocation) is an **estimate** (P3) carrying its confidence/quality context (`Playbook_Confidence_And_Data_Quality.md`).
- **Methodology is governed:** changes to allocation/decline/forecast/valuation methods require DS-SME review + Ryan approval and a `DECISION_LOG.md` entry. The validated **straight-line trajectory** rule and **bitemporal RRC** handling are examples of governed methodology.
- **Reproducibility:** outputs are reproducible from inputs + vintage; the layer's scheduled jobs are monitored, and failures alert rather than silently serving stale numbers.
- **Boundary:** the analytics layer **computes**; it never overrides the system of record, and the serving layer never overrides the analytics layer's labeled estimates.
