# Release & Deployment Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Final approver:** Ryan (prod/security) · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on process change · **Companion:** `change-management-governance.md`, `incident-and-rollback-governance.md`, `quality-assurance-checklists.md`.

---

## 1. Purpose & scope
Govern how changes reach production **safely** across the platform repos — workflow, pre-checks, environments, QA gates, rollback, and monitoring.

## 2. Release workflow
Plan → feature branch → peer review → QA gates → merge → deploy → post-release monitoring. Production branches (e.g., `PresentationSiteAPI/Mview_Prod`) require **senior review** and **must not** receive direct commits.

## 3. Deployment pre-checks (MUST)
☐ Secret-scan passes (no secrets in build) ☐ Env/secret store configured (nothing committed) ☐ Migrations reviewed + reversible/snapshotted ☐ Tier logic reads single source ☐ Backup/rollback path ready ☐ PII boundary intact ☐ Provenance/vintage rules unaffected.

## 4. Environments
Separate dev/staging/prod via env config. **Do not** point staging at production credentials or real PII without controls. Config values come from the secret store, never the repo.

## 5. QA gates
Security (no secrets/PII), functional (auth/tier), data (provenance/vintage, ARPS guard), and — for frontend — SEO + accessibility + performance. Consolidated in `quality-assurance-checklists.md`.

## 6. Rollback (MUST)
Every release has a rollback plan; data migrations are reversible or snapshotted; non-compliant claims are reverted immediately on detection.

## 7. Post-release monitoring
Watch error rates, auth failures, map/API latency, Core Web Vitals (frontend), and **data freshness** for a defined window. Escalate per `incident-and-rollback-governance.md`.

## 8. Deployment QA checklist
☐ Pre-checks complete ☐ Reviews signed ☐ Ryan for prod/security/pricing ☐ Rollback ready ☐ Monitoring set ☐ Release tagged/logged.

## 9. Evidence notes & gaps
Branch model confirmed (Master/Mview_Prod). **Not confirmed from the uploaded files:** CI/CD tooling, environment topology, and current monitoring stack.

---

## Deep context (2026-06-30) — environments, gates, and deploy flow

**Environments.** Code runs on **Windows Server** via **PM2** (Node) and **IIS**; there are **staging** and **production** environments (the TypeScript map app was hosted/deployed across both). GitHub org `mvest2019`.

**Deploy flow (MUST):**
1. Change is scoped and built on a branch; secrets stay out of code (committed-secret findings F-001…F-013).
2. **QA gate** — functional + regression + smoke/sanity on staging (owned by QA, Utkarsha); subscription/claim/map/report/auth paths validated.
3. **Release-readiness** check (the QA launch/update checklist) before promotion.
4. **Promote to production**, then **post-deploy sanity** on prod.
5. **Rollback plan** ready for every release (`incident-and-rollback-governance.md`); a release without a rollback path is not ready.

**Rules:** scheduled jobs (monthly reports, subscription automation, scrapers, backups) are verified after deploy; DB migrations are backward-safe and backed up first; user-facing pricing/claim/feature changes are **Ryan-approved** before they ship.
