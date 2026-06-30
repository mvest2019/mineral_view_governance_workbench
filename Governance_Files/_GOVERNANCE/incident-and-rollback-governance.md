# Incident & Rollback Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + after each incident · **Companion:** `security-governance.md`, `release-and-deployment-governance.md`, `privacy-and-data-use-governance.md`.

---

## 1. Purpose & scope
Govern response to website, API, data, content, and compliance incidents — fast containment, clear escalation, and a learning loop. Given the platform's PII scale and the live-credential findings, a security/PII incident is the highest-severity case and has the strictest first action.

## 2. Incident categories & first action
| Category | Examples | First action |
|---|---|---|
| Security / PII | secret exposure, PII leak, breach | **Escalate to Ryan immediately; rotate credentials first, investigate second** |
| Data | bad vintage flips, false zeros, broken lineage | freeze affected serving; restore correct vintage |
| API / website | outage, auth failure, latency | contain; roll back the release |
| SEO / content | wrong claim published, deindexing | unpublish/revert the claim immediately |
| Compliance | non-compliant claim/legal text live | revert immediately; legal review |

## 3. Response workflow
Detect → classify → contain → fix → verify → post-incident review. Security/PII adds a **same-day register entry** and treats any exposure as compromise (rotate, then investigate).

## 4. Rollback rules (MUST)
Every release has a rollback plan; data migrations are reversible or snapshotted; a non-compliant claim is reverted **on detection**, not at the next release.

## 5. Post-incident review template
What happened · impact · root cause · fix · prevention · owner · date. File it; feed prevention back into the relevant governance file and checklist.

## 6. Checklist
☐ Classified ☐ Contained ☐ Fixed + verified ☐ Escalated if security/PII ☐ Register/decision-log updated ☐ Post-incident review filed ☐ Prevention fed back.

## 7. Anti-patterns
Investigating before rotating on exposure; leaving a bad claim live until the next release; no post-incident review; not feeding prevention back into governance.

## 8. Evidence notes
Security categories grounded in findings F-001…F-015 (incl. the `dblink_config` and 108-notebook credential findings).

---

## Deep context (2026-06-30) — incident response & rollback

**Detection.** Monitored signals: failed scheduled jobs (monthly reports, subscription automation, scrapers, **backups**), API error/latency spikes, data-pipeline failures/inconsistencies, and QA/customer-reported defects. A silent missed backup or a silently stale pipeline is itself an incident.

**Response (MUST):**
1. **Contain** — disable the failing feature/flag or pause the job rather than serving wrong data; serving wrong owner/financial numbers is worse than a temporary outage.
2. **Roll back** — redeploy the last good build (PM2/IIS); for data, restore from the latest verified **Postgres backup** (offsite Google Drive copy) and recompute the analytics layer from a known vintage.
3. **Communicate** — notify owners/affected users per policy if customer-facing data was wrong.
4. **Root-cause & log** — record in `DECISION_LOG.md`; add a finding to the risk register; add/adjust a QA check so it can't recur.

**Rules:** every release ships with a rollback path; DB migrations are reversible and backed up first; data corrections that alter customer-facing figures are treated as governed changes (provenance/vintage preserved), not silent edits.
