# Repository & Codebase Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Final approver:** Ryan (security/prod) · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on repo add/rename · **Companion:** `repo-inventory.md`, `backend-api-governance.md`, `frontend-governance.md`, `map-gis-governance.md`, `admin-and-cerebro-governance.md`, `security-governance.md`, `release-and-deployment-governance.md`.

---

## 1. Purpose & scope
Govern how the **13 repositories** are structured, changed, reviewed, secured, and documented — ownership, branching, naming, change control, and code-review standards. Scope: all repos in `repo-inventory.md` (platform, analytics, project). Repo-specific behavior lives in the per-surface files; this is the cross-cutting contract.

## 2. Repo inventory (authoritative list in `repo-inventory.md`)
Platform (6): `MViewPortalAPI`, `MviewMapAPI`, `PresentationSiteAPI` (Master + Mview_Prod), `Mview-Presentation-Next`, `Mview-Cerebro-web`, `Mvestimate`. Analytics (6): `Decline_curve`, `DeclineCurveManualAnalysis2025`, `DeclineCurve2026`, "108", `New_Map_Final_Code`, `Operator-Directory`. Project (1): `governance-ui`.

## 3. Architecture observations
Node/JS APIs (portal, site, map) + Python analytics (decline, MVestimate, allocation, map build) + Next.js frontend + internal admin. PostgreSQL = system of record; MongoDB = serving layer. GitHub org `mvest2019`. Topology ≈ Postgres ×3 / Mongo ×8 (G-4 to confirm exact PG count).

## 4. Branching & version handling
| Rule (MUST) | Detail |
|---|---|
| Production branches protected | `PresentationSiteAPI/Mview_Prod` is production-facing — changes need senior review; no direct commits |
| Purpose-named branches | `feature/…`, `fix/…`, `hotfix/…` |
| Dedup | `MviewMapAPI` was provided as two byte-identical zips → treated as **one** repo |
| Tag releases | version-tag production releases where supported |

## 5. Naming & structure conventions
Follow each repo's existing conventions. Secrets **must** live in env/secret store. `.env`, certs, and key files **must not** be committed (current violation F-001 — remediate per `security-governance.md`). Tier logic **must** read the single `SUBSCRIPTION_PLAN_MAP` (no copy-paste limits).

## 6. Change control matrix
| Change | Reviewer | Approver |
|---|---|---|
| Feature | peer in repo | repo owner |
| Production-branch change | senior peer | Nikhil |
| Schema/data-affecting | DS SME | Nikhil → Ryan |
| Security-sensitive | security owner | Ryan |
| Pricing/claims-affecting | product + legal | Ryan |

## 7. Documentation expectations
Every repo **should** carry a README: purpose, run steps, env-var **names** (never values), data dependencies, and deploy target. New endpoints/components **must** be documented (`backend-api-governance.md`, `frontend-governance.md`).

## 8. Code-review checklist
☐ No secrets in diff (secret-scan) ☐ Auth + per-tier role checks ☐ Error handling + server-side logging ☐ No PII in logs/URLs ☐ Tests where applicable ☐ Naming conventions ☐ Docs updated ☐ Tier reads single source ☐ No excluded-data sourcing.

## 9. Anti-patterns
Committed secrets; direct prod commits; undocumented endpoints; duplicated tier logic; PII in logs; reading non-canonical price tables; treating Mongo as source of truth.

## 10. Evidence notes & gaps
Repo roles confirmed from provided zips + code review. **Not confirmed from the uploaded files:** CI config, exact deploy targets, and default branches per repo.

---

## Addendum (2026-06-30) — checkpoint-driven data pipelines (MView_X) & repo addition

The **MView_X** ArcGIS Pro geospatial pipeline establishes a standard for our heavier data pipelines, grounded in the repo and Nikhil Salunke's work summary:

- **Checkpoint-driven, not auto-chained:** multi-stage data pipelines that affect customer-facing accuracy **must** include explicit **manual QA/QC checkpoints** and must not be run as one continuous automated script. A stage that emits an `error_log.txt` or a `MUST_CHECK` flag blocks the next stage until each item is resolved or consciously accepted.
- **Deterministic stage order:** stages run in a fixed, documented sequence (see `geospatial-directional-survey-pipeline-governance.md`); a change upstream requires re-running downstream, never patching outputs in place.
- **Config templates:** shared configuration is provided as **templates** (`config/templates/`); operators copy a template per run rather than editing a shared config in place.
- **Environment pinning:** `arcpy`/ArcGIS-Pro pipelines are explicitly not portable to plain Python; environment requirements are stated in the repo README.
- **Repo:** `MView_X` is a **project/analytics** repo (ArcGIS Pro geospatial preparation for Texas RRC well data). Added to `_REPO_INVENTORY.md`; detailed rules in `geospatial-directional-survey-pipeline-governance.md`.
