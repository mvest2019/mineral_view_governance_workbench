# Change-Management Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke / Product · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Companion:** `master-governance-architecture.md`, `release-and-deployment-governance.md`, `publishing-workflow.md`, `claim-risk-register.md`.

---

## 1. Purpose & scope
Govern how changes are **requested, classified, reviewed, approved, and recorded** across code, content, data, and governance — one consistent process so risk is always matched to review. It applies to every change that can reach a user or alter a governed artifact.

## 2. Change request (required fields)
What · why · affected files/surfaces · evidence + source rank · claim-risk level · proposed reviewers · rollback plan.

## 3. Risk classification
| Risk | Examples | Reviewers | Approver |
|---|---|---|---|
| Minor | copy/SEO non-claim; internal docs; inventory updates | peer/lead | lead |
| Major | feature; schema; claim; pricing; methodology; legal | domain + legal/SME | **Ryan** |
| Emergency | outage; security; PII exposure | on-call | Ryan (post-hoc ok) |

## 4. Rules (MUST)
- Major changes to claims/pricing/legal/methodology require **Ryan**.
- The four logs (findings, priority questions, decision log, security register) are **append-only**.
- Every code/governance change carries a changelog + version control; **Major** changes get a **decision-log** entry recording rationale and the superseded state.
- Dependent governance files are updated in the same change (no drift).

## 5. Approval matrix
Canonical matrix in `master-governance-architecture.md` §6.

## 6. Checklist
☐ Request complete ☐ Risk classified ☐ Reviewers signed ☐ Approver (if Major) ☐ Changelog ☐ Decision-log entry (Major) ☐ Dependent files updated ☐ Rollback plan.

## 7. Anti-patterns
Unclassified changes; Major changes without Ryan; editing append-only logs; missing changelog/decision-log entries; leaving dependent files stale.

## 8. Evidence notes
Synthesized from the constitution + master architecture.

---

## Deep context (2026-06-30) — how change flows (and the AI-review loop)

Every material change to the platform or governance moves through a governed path: **intake → AI/peer review → findings/questions → human review → Ryan approval → release/commit**. This mirrors the Governance Workbench flow and applies to product, data, and content.

**Tracks (MUST):**
- **Product/code change:** branch → QA gate → release-readiness → deploy → post-deploy sanity, with a rollback plan.
- **Data/methodology change:** DS-SME review (Christos/Gabor) → Ryan approval → `DECISION_LOG.md` entry → recompute.
- **Governance change:** nothing enters the Constitution without Ryan's explicit approval (the no-auto-commit guardrail).
- **AI-review loop:** issues surfaced by Claude-assisted analysis are triaged, fixed by the dev team, then **retested/validated by QA** before closure — AI flags are inputs to review, not auto-applied changes.

**Logging:** decisions are recorded in `DECISION_LOG.md`; risks in `_SECURITY_RISK_REGISTER.md` / `claim-risk-register.md`; open questions route via `PRIORITY_QUESTIONS_FOR_RYAN.md`. A change that touches pricing, claims, legal, or data accuracy is **high-sensitivity** and always reaches Ryan.
