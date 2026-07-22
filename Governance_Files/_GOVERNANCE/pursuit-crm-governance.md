# Pursuit CRM — Governance

> **Status:** LIVE (new 2026-07-02) · **Owner:** Ryan Cochran (final authority) · **Business owner:** Gautammi Kamath (Sales Lead)
> **Maintainers/contributors:** Ajay Landge (CRM audit), Krishna Sable (prompt/UX optimization) · **Data dependencies:** Tushar Patil (billing), Sanskriti Choudante (behavior)
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly + on any prompt/template/schema change · **Applies To:** Mineral View / Pursuit only.
> **Source:** the Pursuit CRM context document + the June-2026 production-database analysis. Grounded strictly in those; nothing invented.
> **Companion:** `_TEAM_SUMMARY.md`, `Customer_Communication_Style_Guide.md`, `Compliance_And_Disclaimers.md`, `privacy-and-data-use-governance.md`, `_SECURITY_RISK_REGISTER.md`, `analytics-and-measurement-governance.md`.

---

## 1. What Pursuit is
Pursuit ("MineralView CRM") is an **AI-assisted outbound outreach CRM** for the sales/marketing team. It pulls Mineral View's registered users (leads) **live** from the production database, classifies each lead, uses Claude to draft persona-matched outreach across **EMAIL / SMS / CALL / VOICEMAIL**, and gives reps a dashboard to review, edit, approve, send, and track — with a human always in the loop.

**Stack:** Next.js 15/16 (App Router) + Prisma 7 + PostgreSQL; a Python watcher (`run_jobs.py`) as the actual AI-generation engine; Microsoft Graph for two-way email; JWT (`jose`) + bcrypt auth; deployed on Vercel (UI) with the Python runner + `mail_sync.py` on an always-on host. Repo: `github.com/mvest2019/mviewcrm` (transferred from a personal account).

## 2. Two-system architecture
- **System 1 — CRM web UI** (Vercel/Next.js): review AI drafts, edit, approve, send, change status, view profiles (Today/My Desk, Lead 360, Subscriptions, Paid Users, Conversations, Workflow Trace, Guide).
- **System 2 — background automation** (Python `run_jobs.py`): reads leads + signals, calls Claude, writes draft actions/`job_leads` back to the shared `mviewcrm` DB.

They stay decoupled and coordinate only through the shared database. **Key architectural rule:** the CRM keeps **no cached copy** of leads — identity is live-read from production on every request; the CRM persists only the workflow state it owns (`lead_state`, keyed by `member_id`).

## 3. Data boundary (read-only from production)
Pursuit connects to production through an **isolated, read-only** pool and never mutates production structure. Tables it consumes:
`members_entity` (+`_backup`), `userbehavior`, `membersclaimedleases`, `professional_claimed_owners`, `lease_claim_requests`, `subscription_checkout_logs`, `sub_subscription_plan`.
CRM-owned tables (in `mviewcrm`): `lead_state`, `actions`, `lead_status_audits`, `users`, `workflow_jobs`, `job_leads`, `prompts`, `action_templates`, `llm_call_log`, `channel_stats`, `memos`, `app_settings`.

**Shared contracts (change with coordination):**
- `subscription_checkout_logs.is_success` is the CRM's **paid-user source of truth** (because `members_entity.issubscriptionpaid` drifts stale) — owned by **Tushar**; schema/semantics changes must be coordinated.
- `userbehavior` is the CRM's browsing/temperature/pre-reg signal — owned by **Sanskriti**; its data-quality gaps (below) directly degrade lead scoring.

## 4. AI outreach engine (governed)
- **Lead classification (two levels):** persona (Owner vs Professional — decided by subscription plan, plus `member_type` and `professional_claimed_owners`); behavioral sub-persona (Inherited / Passive income / Active deal-seeker / Sophisticated portfolio; Professional split into manager vs landman).
- **Template program:** ~**42 curated, legal-proofed templates** (Owner×Professional × onboarding/nurture/feature × temperature; 35 active / 7 suppressed). The AI **picks the best-fit template by id** and the runner sends that exact body (name + topic CTA merged); it writes fresh copy only when nothing fits or for SMS/CALL.
- **Prompt versioning:** the `MASTER_OUTREACH` prompt is a **versioned DB row (v5 → v18)**, activated via `seed_prompts.ts`, always reversible. Changes are governed artifacts — never fork copy silently across runner/UI.
- **Feature catalog:** curated to the **9 legal-proofed landing-page features** (MVestimate, Lease/Well Report, Portfolio, Monthly Report, TX Map, Lease Activity, Know Your Operators, Notification Agent).

## 5. Compliance controls (must stay in lock-step with `Compliance_And_Disclaimers.md`)
- **Human-in-the-loop:** the AI only drafts; a rep approves/sends. Automation **halts** the moment a lead is marked QUALIFIED / CONVERTED / LOST.
- **TCPA:** channel eligibility decided at **send time** (not the overnight generation clock); quiet-hours in the recipient's US-Central time.
- **CAN-SPAM:** every email carries mailto-unsubscribe + physical postal address.
- **Value-honesty:** real-data-vs-estimate split enforced; example dollar figures stripped from prompts; RRC disclaimers; **no fabricated numbers**; claim-state-aware copy; a v13 rule bans stating a lead's own browsing back to them (anti-"surveillance").

## 6. Risk register (Pursuit-specific)
| Risk | Severity | Control / action | Owner |
|---|---|---|---|
| Live DB creds + `JWT_SECRET` + `CRON_SECRET` in the CRM `.env`; `AZURE_CLIENT_SECRET` leaked to a transcript | CRITICAL | Rotate all; secret store; see `_SECURITY_RISK_REGISTER.md` | CRM team → Ryan |
| "Approve & Send" records intent without always dispatching | MEDIUM | Wire real send or relabel; document dispatch paths | CRM team |
| `userbehavior` gaps (15/20 newest paid have 0 rows; dup inserts; inflated time-on-site) degrade scoring | HIGH | Idle/visibility-aware capture + server-side cap + summary view | Sanskriti |
| `emailHtml.ts` (TS) is a hand-port of the Python wrap helper, no parity check | MEDIUM | Add parity test/shared spec; update both together | CRM team |
| 30+ persona template bodies governed by prompt rules but not individually legal-proofed | MEDIUM | Compliance pass on each body | Gautammi + compliance |
| Payment/subscription data not yet wired into the prompt | LOW | Decide whether to include; keep read-only | CRM team |
| Orphan `job_leads` for deleted members | LOW | Cleanup/graceful-fallback | CRM team |

## 7. Governance routing
- **Copy/compliance** questions → Gautammi + `Compliance_And_Disclaimers.md`, terminating at Ryan.
- **Prompt/template changes** → Krishna/Gautammi (reversible DB rows), logged in `DECISION_LOG.md` when behavior changes.
- **Upstream data contracts** (`subscription_checkout_logs`, `userbehavior`) → Tushar / Sanskriti respectively.
- **Security** → `_SECURITY_RISK_REGISTER.md`, terminating at Ryan.

## 8. Maintenance
Keep this file in sync with the CRM repo's own context/changelog and with `_TEAM_SUMMARY.md`. Review monthly and on any prompt version bump, template-library change, or upstream schema change. Any change touching customer communication or data boundary requires Ryan's sign-off.
