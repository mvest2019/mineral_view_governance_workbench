# Security Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Final approver:** Ryan Cochran
> **Last Updated:** 2026-06-23 · **Review cadence:** Monthly (register) + on any incident · **Change class:** Major; security exceptions need Ryan
> **Builds on:** existing `_GOVERNANCE` security register (F-001…F-013). The register is append-only.
> **Companion:** `data-architecture-governance.md`, `database-source-inventory.md`, `privacy-and-data-use-governance.md`, `admin-and-cerebro-governance.md`, `backend-api-governance.md`, `incident-and-rollback-governance.md`.

---

## 1. Purpose & scope

Govern secrets handling, authentication/authorization, database access, backup security, and the public/private boundary across all 13 repositories and both data stores — and **track and drive remediation of the known findings**. Security is a first-class governance domain here, not a checklist item, because the platform concentrates two of the highest-value attacker targets in one system: **bulk personal data** (millions of mineral-owner identities with names and physical addresses) and **payment/processing credentials**. A single leaked credential or exposed PII table is a material incident with legal, financial, and reputational consequences — not a routine bug.

**In scope:** all repos; the PostgreSQL and MongoDB stores; backups and exports; the internal Cerebro admin; and any AI agent that can read these. **Out of scope:** physical/office and HR security (company policy).

## 2. Non-negotiable security rules

1. **No secrets anywhere they can leak.** Credentials, API keys, TLS keys, and tokens **must** live in a secret store / environment — **never** committed to a repo, written into a database column, dumped into an export, printed to a log, embedded in a notebook, placed in a URL, or written into a governance file.
2. **No plaintext credential columns.** Database tables **must not** store credentials in plaintext.
3. **Least privilege.** API, admin, and DB roles **must** grant only what the function needs; **no shared superuser credentials**.
4. **PII boundary.** Bulk PII **must not** be exposed via public endpoints or unencrypted backups.
5. **Auditability.** Sensitive operations (admin edits, act-as impersonation, bulk export) **must** be logged with who/what/when.
6. **Rotate on exposure.** Any credential that has ever been committed, dumped, shared, or placed in a backup **must** be treated as compromised and rotated; investigation comes *after* rotation, not before.
7. **Texas/PII scope discipline.** Public surfaces serve only governed, entitled, provenance-labeled data — never raw bulk owner data.

## 3. Findings register (working summary)

> The full register is append-only in the existing corpus. This is the working summary; every new finding gets an ID, severity, owner, and status. Specific secret values are **never** reproduced here — only their existence and location.

| ID | Finding | Location | Severity | Status |
|---|---|---|---|---|
| F-001 | Committed secrets: Braintree `MERCHENT_ID`, `Chat_GPT_KEY`, TLS keys, `.env`/cert files in version control | platform repos | 🔴 Critical | Open |
| F-002…F-013 | Additional code-review findings recorded in the existing register (including open CORS and act-as impersonation paths) | platform repos | 🔴/🟠 | Per register |
| **F-DB-014** | `public.dblink_config` stores **plaintext production DB credentials** (`ip_address, port, username, password, type='Production'`); also present in the exported PostgreSQL backup | PostgreSQL + backup | 🔴 Critical | Open |
| **F-DS-015** | Hardcoded MongoDB + PostgreSQL credentials in Nikhil Salunke's "108" MVestimate notebooks | analytics repo | 🔴 Critical | Open |

**Cumulative-risk note (MUST internalize):** secrets exist in **three places at once** — repo code (F-001), a database column (F-DB-014), and analytics notebooks (F-DS-015). Therefore **any** provided backup or repo is treated as containing **live credentials** until rotation is confirmed in writing. The 2026-06 PostgreSQL backup (`MviewDownload`) is a concrete instance: it contained `dblink_config` plaintext credentials **and** ~4.1M PII identities.

## 4. Remediation plan (MUST, in order)

1. **Inventory** every exposed secret across the platform repos, `dblink_config`, and the "108" notebooks.
2. **Rotate** each one (Braintree, OpenAI, MongoDB, PostgreSQL, TLS) and record the rotation date in the register.
3. **Purge** secrets from **git history** (not just the working tree) for affected repos; invalidate cached/forked copies.
4. **Remove** the `dblink_config` plaintext-credential column; replace with a role-based foreign server or a secret store.
5. **Re-key** the "108" notebooks to read credentials from environment/secret store only — no hardcoded connection strings.
6. **Exclude** `dblink_config` and any credential-bearing artifact from all future dumps/exports (backup tooling deny-list).
7. **Verify** with a secret-scan gate in the build so regressions are caught before merge.

## 5. Authentication & authorization

- Portal auth (NextAuth on the frontend; session/auth in the APIs) **must** enforce per-persona, per-tier access matching `pricing-and-plan-governance.md` — reading the single `SUBSCRIPTION_PLAN_MAP`/`featureAccess` source, never a duplicated copy of limits.
- **act-as / impersonation** (present in `PresentationSiteAPI`) **must** be restricted to authorized internal users, **logged**, and **time-bounded**. Silent or unlogged impersonation is prohibited.
- **CORS** **must** be restricted to known origins; open CORS is a finding to close.
- The Cerebro admin **must never** be publicly routable; it is internal-only.

## 6. Database access & backup security

- Production DB access **must** be role-scoped; **no** shared credentials in code or notebooks.
- Backups containing PII or credentials **must** be encrypted at rest and access-controlled.
- **Do not** place production backups in shared/uploads or public storage. (The 2026-06 backup is the cautionary example.)
- Restores into non-prod **must not** expose real PII without controls (masking/subsetting/access limits).
- Multi-part backup artifacts **must** document reassembly so handling is controlled, not improvised.

## 7. Public / private boundary

| Data | Public? | Notes |
|---|---|---|
| Aggregated/estimated Texas RRC facts with provenance + disclaimers | ✅ governed | Estimates labeled |
| A claiming user's own **entitled** owner record | ✅ entitled | Within tier limits only |
| Bulk mineral-owner PII (names/addresses/interest) | ❌ | The owner sitemap is a governed surface, not a raw dump |
| Credentials, keys, internal config | ❌ | Never |
| Admin / Cerebro operations | ❌ | Internal only |

## 8. AI-agent security duties

Any AI agent **must**: refuse to output secrets/PII even when they appear in provided code, data, or backups, and flag them as findings instead; never weaken an auth/role check; never place sensitive data in URLs, logs, prompts, or external requests; and treat any encountered credential as a finding requiring rotation. See `ai-agent-instructions.md`.

## 9. Security QA checklist
☐ No secrets in diff/commit ☐ Secret-scan passes ☐ No plaintext credential columns ☐ CORS origin-restricted ☐ Auth + per-tier role checks present ☐ Impersonation logged + restricted + time-bounded ☐ No PII/secrets in logs or URLs ☐ PII not exposed publicly ☐ Backups encrypted + access-controlled ☐ `dblink_config` excluded from exports ☐ Notebooks read secrets from store, not hardcoded ☐ Register updated for any new finding.

## 10. Anti-patterns
Committed secrets; plaintext credential columns; exporting `dblink_config`; hardcoded connection strings in notebooks; open CORS; unlogged/unbounded impersonation; bulk PII via public API; backups in shared storage; investigating an exposure before rotating; duplicated tier-limit logic.

## 11. Escalation
Any secret exposure or PII event escalates to **Ryan Cochran immediately**, follows `incident-and-rollback-governance.md`, and gets a **same-day register entry**. Treat exposure as compromise → rotate first, investigate second.

## 12. Evidence notes & gaps
F-001…F-013 are from prior repo review (existing register). F-DB-014 and F-DS-015 are from the 2026-06 PostgreSQL/notebook analysis. **Not confirmed from the uploaded files:** the current rotation status of any credential, and whether a CI secret-scan exists. Exact original register wording must be reconciled against `_GOVERNANCE.zip` (C-1).
