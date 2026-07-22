# Team Member Governance — Vaishnavi

> **Status:** Team profile (governed, deep) · **Role:** Backend Developer · **Department(s):** DEVELOPMENT (Backend) · PLATFORM_INFRASTRUCTURE
> **Reports to:** Ryan Cochran · **Experience in project:** 3+ years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Vaishnavi's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Vaishnavi |
| **Role / Title** | Backend Developer |
| **Department(s)** | DEVELOPMENT (Backend) · PLATFORM_INFRASTRUCTURE |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | 3+ years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Core backend APIs · owner portal · professional accounts · map APIs · notifications · Data Coverage · Cerebro · backups/infra |

## 2. Snapshot
**Purpose at Mineral View (one line):** Builds and maintains Mineral View's core backend APIs, databases, and infrastructure (incl. backups) behind the owner and professional platforms.

**Focused on right now:** Portfolio & financials API optimization, marketing-related improvements, and code-review fixes.

**Top priorities:**
- Portfolio & financials API performance
- Marketing platform improvements
- Backup/DR reliability
- Resolve code-review findings

## 3. Role in the platform (context)
Vaishnavi owns much of the **backend spine** — the APIs and database access behind claims, portfolio, financials, notifications, Data Coverage, the map, Cerebro, and the automated backups. She is a key custodian of both the live `public` schema and platform reliability/DR.

## 4. Work completed so far at Mineral View
**Core backend APIs** — scalable APIs and business logic for lease/owner management, dashboards, reporting, and notifications; secure, efficient API architectures.

**Mineral Owner Portal** — Claim Mineral Owner process, dashboard, financials API optimization, portfolio, lease-report enhancements (`membersclaimedleases`, `memberleases`, `claimed_owners`).

**Professional Account platform** — dashboard, financial reporting, portfolio, activity tracking by lease/county/operator.

**Map platform modernization** — a new TypeScript map application with all functionality + County Filters, deployed to staging and production.

**Notifications Hub** — system/my notifications, My Agents, Create Agent (`notification_*`).

**Data Coverage Platform** — mineral-owners & production-data modules with API security and access control.

**Cerebro** — full-stack internal admin/reporting (`cerebro_users`) — data-integration & reporting APIs.

**Performance/security & infrastructure** — API tuning, PostgreSQL/MongoDB cleanup, API rate limiting; an automated PostgreSQL backup with scheduled generation and Google Drive offsite upload, improving DR readiness and monitoring.

## 5. Current work (in progress)
- Marketing-related platform improvements.
- Portfolio API optimization.
- Cash-flow calculation/reporting API improvements.
- Resolving code-review findings.



## 6. Data & systems ownership
This maps what Vaishnavi owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Users / accounts / auth | `members_entity` (43, incl. PII + `password`), `member_session`, `email_verification`, `impersonation_audit`, `blocked_ips` | Backend owner of the user store; enforces auth, access control, and impersonation auditing. |
| Claims / ownership | `membersclaimedleases`, `memberleases`, `claimed_owners`, `professional_claimed_owners` | Claim/portfolio APIs and business logic. |
| Notifications | `notification_alert`, `notification_history`, `notification_templates` | Notifications Hub / agents. |
| Financials / Data Coverage | financials APIs; `countyspecific_mineralownerdata`, coverage modules | Financials optimization + access-controlled coverage. |
| Operators | `operator_directory`, `operator_data*` | Operator API surfaces. |
| Backups / archive | the whole DB incl. `Archive/*` trees | Automated PostgreSQL→Google Drive backup + DR. |


## 7. Governance responsibilities
Vaishnavi is a primary contributor to, and is expected to keep current, these governance surfaces:
- `backend-api-governance.md`
- `database-backup-and-archive-governance.md`
- `database-and-schema-governance.md` (co-owner)
- `owner-portal-governance.md`
- `security-governance.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- PostgreSQL/MongoDB/Redis
- Data pipelines feeding the APIs (DS)
- Design specs from frontend

**Produces (outputs others depend on):**
- The backend APIs powering owner portal, professional accounts, map, notifications, Data Coverage, Cerebro
- The automated backup/DR system

## 9. Collaborators & dependencies
- **Works most closely with:** Sanskriti, Tushar (backend); frontend team; Nikhil/Pranav (data); Ryan
- **Depends on:** PostgreSQL/MongoDB/Redis; data pipelines; Windows Server / PM2 / IIS
- **People/teams who depend on this work:** Owner portal, professional accounts, map, notifications, reports, Data Coverage, mobile

## 10. Domain risks & controls
Risks specific to Vaishnavi's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| PII/password exposure | Encryption at rest, access-controlled backups (incl. offsite), no secrets in code (F-001…F-013), hashed passwords (`security-governance.md`). |
| Backup omits the ~28.5 GB warehouse | Verify backup scope includes `MviewDownload`; test-restore (`database-backup-and-archive-governance.md`). |
| Cross-owner data leakage | Tier/claim-scoped reads; act-as-owner authorization-checked + audited (`impersonation_audit`). |
| Unthrottled data-coverage endpoints | API rate limiting + access control. |


## 11. Skills & tools
- **Languages / frameworks:** Node.js, Express.js, JavaScript, REST
- **Tools / platforms:** PostgreSQL, MongoDB, Redis, Git, PM2, IIS, Postman, Windows Server, Google Drive (backups)
- **Domain knowledge:** Lease/owner data models, GIS/mapping APIs, financials, backups & DR

## 12. Open questions / blockers / help needed
- Confirm backup retention window + restore-drill cadence (ties to DR governance).
- Confirm rate-limit thresholds per public/Data-Coverage endpoint.
- Confirm MongoDB/Redis DR coverage (not in the SQL backup).

## 13. Operating sources & references
- `backend-api-governance.md`
- `database-backup-and-archive-governance.md`
- `database-and-schema-governance.md`
- `owner-portal-governance.md`
- `security-governance.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`members_entity`** (43 columns): `member_id`, `member_type`, `f_name`, `l_name`, `email_id`, `mailing_st_address`, `city`, `state_master_id`, `zip_code`, `phone_number`, `password`, `notification_phonenumber`, `notification_email`, `preference_optioncode`, `membership_planid`, `membership_expirydate`, `registration_date`, `email_verified`, `email_verification_code`, `email_verification_time`, `reset_password_token`, `reset_password_validity`, `user_name`, `tag_line`, `background_image`, `otp_verification_code`, `ispresentation`, `subscriptionid`, `subscriptionstatus`, `issubscriptionpaid`, `referal_code`, `refered_code`, `email_text`, `membership_status`, `login_type`, `login_json`, `isfirstime`, `isguide`, `isautodebit`, `userType`, `ProfileImageUrl`, `visitorid`, `startdate`

**`member_session`** (6 columns): `id`, `member_id`, `email_id`, `unic_id`, `isexpired`, `create_ts`

**`email_verification`** (11 columns): `id`, `email`, `verification_code`, `generated_at`, `expires_at`, `is_verified`, `verified_at`, `attempts`, `created_at`, `updated_at`, `username`

**`impersonation_audit`** (7 columns): `id`, `actor_member_id`, `actor_email`, `target_member_id`, `target_member_type`, `ip_address`, `acted_at`

**`blocked_ips`** (3 columns): `id`, `ipaddress`, `added_on`

**`membersclaimedleases`** (17 columns): `id`, `member_id`, `lease_number`, `lease_name`, `district_code`, `county`, `original_decimal_interest`, `modified_decimal_interest`, `isclaimed`, `iswatchlist`, `claimed_date_and_time`, `leaseswitchtimestamp`, `ispaid`, `lease_switch_count`, `ownernumber`, `ownername`, `owneraddress`

**`memberleases`** (24 columns): `id`, `district_code`, `lease_number`, `lease_name`, `member_id`, `member_name`, `member_email_id`, `isclaimed`, `claimdatetime`, `decimal_interest`, `mvestimate_old`, `current_year_tax_value`, `leaseinfo_lease_id`, `group_name`, `onwatchlist`, `original_interest`, `yesterdaysmvestimate`, `mvestimateupdatedatetime`, `oilsoldper`, `gassoldper`, `pv10`, `mvestimate`, `county`, `iswatchlist`

**`claimed_owners`** (9 columns): `id`, `member_id`, `ownernumber`, `ownername`, `owneraddress`, `isactive`, `created_ts`, `updated_ts`, `isclaimed`

**`professional_claimed_owners`** (7 columns): `id`, `professional_owner_id`, `member_id`, `owner_name`, `is_active`, `create_ts`, `activate_owner`

**`notification_alert`** (13 columns): `id`, `email_id`, `filters`, `create_ts`, `updated_date`, `operators`, `districts`, `leasenos`, `playtypes`, `countys`, `notification_type`, `frequency`, `notification_send_type`

**`notification_history`** (6 columns): `id`, `notification_alert_id`, `notification_type`, `notification_send_type`, `send_text`, `send_date`

**`notification_templates`** (4 columns): `id`, `notification_type`, `html_template`, `subject`

**`operator_directory`** (16 columns): `id`, `operator_number`, `operator_name`, `first_address_line`, `second_address_line`, `apt_suite`, `city`, `state`, `zip`, `country`, `phone_number`, `emergency`, `mail_ret_by_po`, `p5_status`, `county`, `operator_logo`

**`operator_data`** (8 columns): `county`, `operator_number`, `operator_name`, `location`, `main_url`, `detail_link`, `address`, `phone`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Vaishnavi | — | — |
| Domain methodology / design decisions | C | Vaishnavi | Ryan Cochran (+ DS SME where data) | Sanskriti, Tushar (backend); frontend team; Nikhil/Pranav (data); Ryan |
| Governance change in this area | C | Vaishnavi | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Vaishnavi | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** PostgreSQL/MongoDB/Redis; Data pipelines feeding the APIs (DS); Design specs from frontend

**This role transforms/produces:** The backend APIs powering owner portal, professional accounts, map, notifications, Data Coverage, Cerebro; The automated backup/DR system

**Downstream (depends on this role):** Owner portal, professional accounts, map, notifications, reports, Data Coverage, mobile

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Backend Developer** needs to be productive:

- **Stack & access:** Node.js, Express.js, JavaScript, REST; tools — PostgreSQL, MongoDB, Redis, Git, PM2, IIS, Postman, Windows Server, Google Drive (backups). Request least-privilege access to the systems in §6.
- **Read first:** `backend-api-governance.md`, `database-backup-and-archive-governance.md`, `database-and-schema-governance.md` (co-owner), `owner-portal-governance.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Sanskriti, Tushar (backend); frontend team; Nikhil/Pranav (data); Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Vaishnavi's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Vaishnavi's backend/infra scope against the KB repos and the fact that **she authored the very PostgreSQL backup pipeline** that produced the June-2026 archive analyzed across this corpus. Additive to earlier sections.

### 21.1 Repos & code surfaces (from the KB)
- **`MViewPortalAPI`** (Node/Express/JS, port 3010) — owner portal, claims, portfolio, financials, notifications, Data Coverage endpoints.
- **`MviewMapAPI`** (Node/Express/**TypeScript**, port 3006) — the **TypeScript map modernization** in her summary is this repo (County Filters, staging+prod deploy).
- **Cerebro** (`MviewCerebroAPI` + `Mview-Cerebro-web`) — her full-stack Cerebro admin/reporting work.
- Infra: Windows Server + PM2 + IIS (PM2 commands from an Administrator prompt — an established platform constraint).

### 21.2 The backup pipeline (now a governed, analyzed artifact)
Vaishnavi's **automated PostgreSQL → Google Drive** backup is the pipeline that produced the 3-database, 526-table, ~32 GB archive documented in `database-schema-reference.md`. That makes her the owner of two newly-important governance facts:
- **Scope check** — the archive includes `Production`, `Archive`, and the ~29 GB `MviewDownload` warehouse; DR must verify all three plus a **test-restore** cadence (`database-backup-and-archive-governance.md`).
- **Coverage gap** — the SQL backup does **not** cover MongoDB or Redis; their DR is an open item (§12).

### 21.3 Newly-surfaced security ownership
Backups carry the platform's largest PII/secret concentration: `members_entity.password`, `cerebro_users` (plaintext), `dblink_config` (plaintext DB creds), payment JSON. Vaishnavi co-owns ensuring backups are encrypted at rest and access-controlled offsite (see `_SECURITY_RISK_REGISTER.md`, SEC-002/SEC-003).

### 21.4 Cross-owner isolation
Claims/portfolio APIs must scope every read to the authenticated member/claim; the `impersonation_audit` table (act-as-owner) is the audit control she owns. This is the server-authoritative enforcement point behind the Constitution's tier/access rule.
