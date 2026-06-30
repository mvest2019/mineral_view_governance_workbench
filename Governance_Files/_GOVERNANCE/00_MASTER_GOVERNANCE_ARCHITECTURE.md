# Master Governance Architecture

> **Status:** ENHANCED (deep) · **Owner:** Ryan Cochran · **Maintainer:** Nikhil Salunke
> **Last Updated:** 2026-06-23 · **Review cadence:** Annual + trigger-based · **Change class:** Constitutional-adjacent
> **Builds on:** existing `_GOVERNANCE` master architecture, non-negotiables, constitution.

---

## 1. Purpose

Define the **single governing model** that ties together every surface of Mineral View — website, portal, APIs, GIS, data stores, analytics, content/SEO, legal, and AI contributions — and the rules for how **decisions, approvals, conflicts, and changes** flow across them. The constitution states *what* must be true; this file states *how* the organization keeps it true.

## 2. The governance model

```
                         ┌──────────────────────────────┐
                         │   GOVERNANCE CONSTITUTION     │  rank 2 — non-negotiables P1–P8
                         │   + Source-of-Truth Hierarchy │
                         └───────────────┬──────────────┘
                                         │ binds every band
   ┌──────────────┬──────────────┬───────┼───────┬──────────────┬──────────────┐
   ▼              ▼              ▼       ▼       ▼              ▼              ▼
 BUSINESS/      ENGINEERING     DATA   ANALYTICS PRODUCT     CONTENT/SEO     LEGAL/TRUST
 BRAND          repos/APIs/     PG/    MVestimate features   blog/FAQ/       claims/privacy
 positioning    frontend/GIS    Mongo  decline   pricing     glossary/news   /terms
   │              │              │       │       │              │              │
   └──────────────┴──────────────┴───────┴───────┴──────────────┴──────────────┘
                                         │ all clear
                         ┌───────────────▼──────────────┐
                         │ LEGAL / COMPLIANCE  (rank 1)  │  Terms · Privacy · claims
                         └──────────────────────────────┘
```

Legal sits **above** (rank 1, the only thing that overrides the constitution) and **around** (every band must clear claim/compliance rules). The constitution is the top **internal** authority.

## 3. Relationship between surfaces

| Surface | Governs | Depends on | Detailed file |
|---|---|---|---|
| Website (`Mview-Presentation-Next`) | public copy, SEO, pages, CTAs | brand, content, legal, product | `frontend-governance.md` |
| Portal backends (`MViewPortalAPI`, `PresentationSiteAPI`) | data access, auth, tiers, payments | data layer, pricing, security | `backend-api-governance.md` |
| Map/GIS (`MviewMapAPI`, `New_Map_Final_Code`) | Texas map, county/well/operator linkage | PostGIS, Postgres GIS, Mongo linkage | `map-gis-governance.md` |
| Admin (`Mview-Cerebro-web`) | internal data editing/ops | all stores, audit/logging | `admin-and-cerebro-governance.md` |
| Analytics/methodology | MVestimate, decline, allocation, acre/well | Postgres facts, Mongo serving | `mvestimate-governance.md`, `decline-curve-methodology-governance.md` |
| Data stores | system-of-record (PG) + serving (Mongo) | RRC scrape, GIS, appraisal | `data-architecture-governance.md` |
| Content engine | blog/FAQ/glossary/news | brand voice, domain rules, SEO | `content-governance.md` |

**Pipeline direction (confirmed):** RRC scrape → PostgreSQL (`scrapy_data` + `public`) → transformation/allocation/valuation → MongoDB serving → portal & map APIs → UI.

## 4. Non-negotiable governance principles (operational restatement)
These mirror constitution P1–P8 and **must not** change without Ryan's approval + a decision-log entry: Texas-only data scope; data-not-advice; estimates-not-actuals; provenance-and-vintage preserved; legal text authoritative; PII and secrets protected; heritage truthful; AI bounded. The constitution holds the rationale and edge cases.

## 5. Canonical source-of-truth rules

| Rank | Source |
|---|---|
| 1 | Legal/compliance (Terms, Privacy) |
| 2 | Constitution, non-negotiables, master architecture |
| 3 | Production code / active branches |
| 4 | Database backups / schemas |
| 5 | Product screenshots |
| 6 | Product/feature specs |
| 7 | Published website content |
| 8 | Spreadsheets (Blog/FAQ/Glossary/News) |
| 9 | Historical / old content |
| 10 | Inferred recommendations |

Operating rules: **higher rank wins on conflict**; for **same-rank** disagreement, the **newer confirmed vintage** wins and the discrepancy is logged. **Binding exclusion:** the old-doc pricing section is never a pricing source.

## 6. Decision & approval hierarchy

| Change type | Proposer | Reviewer(s) | Final approver |
|---|---|---|---|
| Non-negotiable / constitution | any | maintainer + domain lead | **Ryan Cochran** |
| Public claim / pricing / legal copy | content/product | legal + product | **Ryan Cochran** |
| Data-methodology description | data/analytics | DS SME (Christos/Gabor) + maintainer | **Ryan Cochran** |
| Production code (feature) | engineer | peer reviewer (per repo) | repo owner |
| Production-branch change (e.g. Mview_Prod) | engineer | senior peer | Nikhil |
| Content / SEO (non-claim) | editor | SEO + content lead | content lead |
| Internal docs / inventories | any | maintainer | maintainer |

## 7. Conflict-resolution process
1. Identify the conflicting sources and their ranks.
2. Apply the hierarchy; if same-rank, apply the vintage rule.
3. If rules don't resolve it, escalate per §8.
4. Record the resolution in the decision log; if it needs a human answer, add it to `open-questions-and-evidence-gaps.md`.

**Worked example:** a screenshot shows a $49.99 Owner Pro price; an older marketing page shows $39.99. Both are below the constitution. Code `SUBSCRIPTION_PLAN_MAP` (rank 3) outranks both (ranks 5/7) → use the code value; if code and the live screenshot disagree, that's a release-blocking defect routed to Ryan (Q-A).

## 8. Escalation paths
Engineering → repo owner → Nikhil → Ryan. Content/claims → content lead → product → legal → Ryan. Data/methodology → DS SME → Nikhil → Ryan. **Security/PII → Ryan immediately** (`incident-and-rollback-governance.md`).

## 9. Documentation lifecycle
`Draft → Reviewed → Adopted → Maintained → (Trigger) Re-reviewed → Superseded/Archived`. No file is deleted; superseded files are archived with a pointer to their replacement. The four logs are **append-only**.

## 10. Maintenance rules
Every file **must** carry status, owner, maintainer, `Last Updated`, and evidence notes, and **must** be re-reviewed on cadence or on a trigger event (new backup, repo change, legal update, pricing change, incident). See `maintenance-cadence-and-ownership.md`.

## 11. Evidence notes
Pipeline and surface relationships confirmed from repo review + the Postgres dump. DS SMEs (Christos Batsios, Gabor Korosi) confirmed from repo content. Original `_GOVERNANCE` architecture wording to be reconciled (C-1).
