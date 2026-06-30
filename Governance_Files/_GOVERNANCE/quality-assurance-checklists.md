# Quality-Assurance Checklists (Consolidated)

> **Status:** ENHANCED (deep) · **Owner:** QA / All bands · **Final approver:** Ryan (claims/pricing/legal) · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · The single place for every recurring pre-publish/pre-deploy checklist. Each checklist cross-references its governing file.

---

## 1. Purpose
A consolidated, copy-pasteable set of the platform's QA gates so reviewers can run the right checks without hunting through files. Every item traces to a governing rule; this file does not invent new rules.

## 2. New page launch (`page-governance.md`, `seo-governance.md`, `accessibility-governance.md`)
☐ Exactly one H1 ☐ Unique title/meta/canonical ☐ Logical H2/H3 ☐ One primary CTA ☐ Internal links (glossary/pillar) ☐ Accessible (labels/contrast/focus/keyboard) ☐ Performance (CWV/images/JS) ☐ Provenance + vintage on any data ☐ Estimates labeled ☐ Legal-reviewed if claims ☐ Redirect plan if replacing a URL.

## 3. Page update
☐ Change scoped ☐ Metadata refreshed ☐ Links valid ☐ Reviews done ☐ 301 redirect if URL changes ☐ Stale figures refreshed.

## 4. Blog post (`blog-and-seo-content-governance.md`, `content-governance.md`)
☐ Cluster + intent assigned ☐ Pillar link (no orphan) ☐ Title/meta/slug/canonical ☐ Internal glossary links ☐ No advice/steering ☐ Sources cited ☐ Estimates labeled + vintage ☐ Refresh date ☐ Claims routed to legal.

## 5. FAQ / glossary update (`faq-and-glossary-governance.md`)
☐ Consistent definition site-wide ☐ Matches implementation ☐ Hedged (estimate) ☐ Cross-linked ☐ Texas facts correct ☐ SME-reviewed if technical.

## 6. Product feature update (`product-and-feature-governance.md`)
☐ Canonical name ☐ Behavior-accurate ☐ Estimates labeled ☐ Tier-correct (persona × tier) ☐ Screenshots current ☐ No demo-as-real ☐ No advice.

## 7. Pricing update (`pricing-and-plan-governance.md`)
☐ Matches code `SUBSCRIPTION_PLAN_MAP` **and** screenshots ☐ Persona-correct ☐ Terms-consistent ☐ Ryan-approved ☐ No excluded-doc source ☐ No guaranteed-value language ☐ Owner-price reconciliation (Q-A) respected ☐ Decision-log entry.

## 8. Legal / policy update (`legal-compliance-and-claims-governance.md`, `terms-billing-and-refund-governance.md`)
☐ Entity name (**Mineral View, LLC**) ☐ Disclaimers present/not weakened ☐ Counsel-reviewed ☐ Processor accurate (Q-B) ☐ Logged ☐ No invented terms.

## 9. SEO review (`seo-governance.md`)
☐ Unique title/meta ☐ One H1 ☐ Clean slug ☐ Canonical ☐ Schema ☐ Indexable (private/thin excluded) ☐ No cannibalization ☐ No claim copy.

## 10. Accessibility review (`accessibility-governance.md`)
☐ Semantic ☐ Labels ☐ Focus ☐ Keyboard (no traps) ☐ Contrast ☐ Alt text ☐ Errors announced.

## 11. Technical / backend review (`backend-api-governance.md`, `security-governance.md`)
☐ No secrets in diff (secret-scan) ☐ Auth + per-tier checks ☐ CORS restricted ☐ Safe errors ☐ No PII/secrets in logs/URLs ☐ Tier reads single source ☐ ARPS-guarded analytics ☐ Provenance on served data.

## 12. Data / regulatory review (`rrc-data-governance.md`, `data-provenance-and-lineage-governance.md`)
☐ Provenance + vintage ☐ Gap vs true-zero (`prod_report`) ☐ ARPS guard ☐ Reproducible from Postgres ☐ Canonical price deck only ☐ No steering ☐ Bitemporal preserved.

## 13. Pricing/claim risk classification (`claim-risk-register.md`)
☐ Claim type identified ☐ Risk level assigned ☐ High → Legal + Ryan ☐ Safe phrasing used ☐ Disclaimer attached.

## 14. Release / deployment (`release-and-deployment-governance.md`)
☐ Pre-checks complete ☐ Reviews signed ☐ Ryan for prod/security/pricing ☐ Rollback ready ☐ Migrations reversible ☐ Monitoring set.

## 15. Final publish approval
☐ All applicable checklists passed ☐ Ryan approval if claims/pricing/legal/methodology ☐ Decision-log/changelog updated ☐ Post-launch monitoring scheduled.

## 16. Evidence notes
Every checklist item maps to a rule in the referenced governing file; this consolidation adds no new rules.

---

## Addendum (2026-06-30) — MView_X geospatial pipeline QA gates (`geospatial-directional-survey-pipeline-governance.md`)

**Directional survey compile (Stage 3.1):** ☐ No invalid measured-depth (MD) values ☐ No duplicate sequential MD/Inc/Azimuth rows ☐ No impossible inclination/azimuth ☐ `error_log.txt` reviewed.

**Problematic-survey checkpoint (Checkpoint 1):** ☐ Reviewed all `summary_statisticsX0_ALL` rows where `To_Check = 'MUST_CHECK'` ☐ Triaged high row-removal ratio / impossible angles / MD-sequence errors / very small `MD_max` / random zero MDs ☐ Each item resolved or consciously accepted before continuing.

**Trajectory build (Stage 3.4):** ☐ Minimum-curvature geometry built ☐ Synthetic trajectories are straight SHL→landing→BHL (no bend) ☐ Trajectory-similarity review (Stage 3.6) completed.

**Coordinate discipline:** ☐ Projected to the Texas statewide CRS ☐ SHL/BHL authority preserved ☐ Geodetic lines/grids/zones consistent with Stage 1 coordinates.

**Provenance:** ☐ RRC pull vintage recorded ☐ Survey source type (MWD/GYRO) recorded ☐ No output edited in place (regenerate downstream instead).
