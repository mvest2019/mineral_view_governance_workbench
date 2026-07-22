# Team Member Governance — Sanskriti Choudante

> **Status:** Team profile (governed, deep) · **Role:** Backend Developer · **Department(s):** DEVELOPMENT (Backend)
> **Reports to:** Ryan Cochran · **Experience in project:** 2.5 years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Sanskriti Choudante's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Sanskriti Choudante |
| **Role / Title** | Backend Developer |
| **Department(s)** | DEVELOPMENT (Backend) |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | 2.5 years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Mineral-data APIs · behavior analytics · professional accounts · Oil & Gas Community backend |

## 2. Snapshot
**Purpose at Mineral View (one line):** Builds backend services for mineral-data management, platform analytics, professional accounts, and the Oil & Gas Community.

**Focused on right now:** Backend services supporting analytics workflows and professional/community features.

**Top priorities:**
- Mineral-data & analytics APIs
- Professional-account workflows
- Community backend

## 3. Role in the platform (context)
Sanskriti builds backend services around **mineral data, user-behavior analytics, professional accounts, and community** — including the instrumentation that tells the team how users engage with the platform.

## 4. Work completed so far at Mineral View
**Mineral data APIs** — backend services for mineral-data management, platform analytics, and professional-account workflows.

**Behavior analytics** — user-behavior tracking (IP, page visits, engagement, most-viewed sections) and Python-based country-level traffic insights from captured IPs (`userbehavior`, `usersearchhistory`, `user_activity`).

**Professional accounts** — professionals manage owner accounts, claim owner records, and log in as a mineral owner (`professional_claimed_owners`).

**Oil & Gas Community backend** — groups, discussions, posts, comments, and expert-interaction workflows.

## 5. Current work (in progress)
- Continuing backend work on analytics and professional/community features.



## 6. Data & systems ownership
This maps what Sanskriti owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Behavior analytics | `userbehavior` (~28 MB), `usersearchhistory`, `user_activity`, `user_login_activity` | Owns the behavior instrumentation; must respect the privacy line (aggregate IP → country). |
| Professional accounts | `professional_claimed_owners`, `advisor_mineral_owner` | Professional/act-as-owner workflows (authorization-checked). |
| Community | (community tables / separate service) | Groups/discussions/posts/comments backend. |


## 7. Governance responsibilities
Sanskriti is a primary contributor to, and is expected to keep current, these governance surfaces:
- `backend-api-governance.md`
- `analytics-and-measurement-governance.md`
- `privacy-and-data-use-governance.md`
- `event-tracking-and-dashboard-governance.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- PostgreSQL/MS SQL/MongoDB
- Analytics event inputs

**Produces (outputs others depend on):**
- Mineral-data & analytics APIs
- Behavior insight (aggregated)
- Community + professional-account backends

## 9. Collaborators & dependencies
- **Works most closely with:** Vaishnavi, Tushar (backend); Ryan
- **Depends on:** PostgreSQL/MS SQL/MongoDB; analytics inputs
- **People/teams who depend on this work:** Professional accounts, community, product-analytics consumers, marketing

## 10. Domain risks & controls
Risks specific to Sanskriti's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| IP/behavior data is PII-adjacent | Retention/use per `privacy-and-data-use-governance.md`; aggregate before display; never sold. |
| Professional act-as-owner over-reach | Authorization checks + audit (`impersonation_audit`). |
| Analytics becomes a shadow source of truth | Analytics separate from system-of-record ownership data; never authoritative for ownership. |


## 11. Skills & tools
- **Languages / frameworks:** Node.js, Express, REST, JavaScript, Python
- **Tools / platforms:** PostgreSQL, MS SQL Server, MongoDB, Power BI, Looker, Excel, Git, Postman, VS Code
- **Domain knowledge:** Mineral data APIs, analytics/behavior tracking, community platform, AI-assisted development

## 12. Open questions / blockers / help needed
- Confirm privacy retention for IP + behavior analytics.
- Confirm access-control model for professional act-as-owner.
- Confirm where community tables live (this DB vs a separate service).

## 13. Operating sources & references
- `backend-api-governance.md`
- `analytics-and-measurement-governance.md`
- `privacy-and-data-use-governance.md`
- `database-schema-reference.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`userbehavior`** (10 columns): `id`, `visitorid`, `userid`, `ipaddress`, `pageurl`, `previouspageurl`, `starttime`, `endtime`, `spendingtime`, `ismobile`

**`usersearchhistory`** (10 columns): `usersearchhistoryid`, `member_id`, `email_id`, `claimleasecount`, `watchlistcount`, `leasereportcount`, `mapfiltercount`, `activitynotificationcount`, `createts`, `wellreportcount`

**`user_activity`** (8 columns): `id`, `member_id`, `feature_name`, `sub_feature_name`, `meta_data`, `create_ts`, `end_date`, `url`

**`user_login_activity`** (3 columns): `id`, `email_id`, `createts`

**`professional_claimed_owners`** (7 columns): `id`, `professional_owner_id`, `member_id`, `owner_name`, `is_active`, `create_ts`, `activate_owner`

**`advisor_mineral_owner`** (10 columns): `id`, `advisorid`, `member_id`, `owner_name`, `owner_address`, `owner_city`, `no_of_leases`, `mvestimate`, `isactive`, `createts`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Sanskriti | — | — |
| Domain methodology / design decisions | C | Sanskriti | Ryan Cochran (+ DS SME where data) | Vaishnavi, Tushar (backend); Ryan |
| Governance change in this area | C | Sanskriti | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Sanskriti | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** PostgreSQL/MS SQL/MongoDB; Analytics event inputs

**This role transforms/produces:** Mineral-data & analytics APIs; Behavior insight (aggregated); Community + professional-account backends

**Downstream (depends on this role):** Professional accounts, community, product-analytics consumers, marketing

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

- **Stack & access:** Node.js, Express, REST, JavaScript, Python; tools — PostgreSQL, MS SQL Server, MongoDB, Power BI, Looker, Excel, Git, Postman, VS Code. Request least-privilege access to the systems in §6.
- **Read first:** `backend-api-governance.md`, `analytics-and-measurement-governance.md`, `privacy-and-data-use-governance.md`, `event-tracking-and-dashboard-governance.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Vaishnavi, Tushar (backend); Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Sanskriti Choudante's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Sanskriti's backend scope against the KB (she owns the community backend) and the Pursuit CRM (her user-behavior tracking is a primary CRM signal). Additive to earlier sections.

### 21.1 Repos & code surfaces
- **`MV-Community`** (Node/Express/**TypeScript** + Mongoose 8) — the "Oil & Gas Community" backend in her summary maps to the KB `community-platform` domain: threads/discussions, posts, comments, voting/mark-answer, groups (public/private/MVP), community profiles, feed/bookmarks, community notifications.
- **`PresentationSiteAPI` / `MViewPortalAPI`** — professional-account workflows (professional users managing/claiming owner accounts, logging in as an owner) and mineral-data APIs.

### 21.2 MongoDB collections (community)
`MViewNewCommunity` (28–30 collections): discussions/threads, posts, comments, groups, `userprofiles`, bookmarks, community notifications. Note the KB flag that ~11 of these are empty in prod and ~303 seeded/"fake" userprofiles exist — relevant to any analytics on community engagement.

### 21.3 User-behavior tracking → the CRM (important cross-system link)
Sanskriti built the **user-behavior / IP tracking** (page visits, engagement patterns, most-viewed sections) and the **Python country-level traffic insights**. This writes the `userbehavior` (and related `apilogs`) tables that the **Pursuit CRM consumes directly** — it is the source of the CRM's pre-/post-registration browsing signal, "pricing viewers," temperature, and sub-persona classification. Two governed consequences:
- **Data-quality gap** — the CRM audit found ~15 of 20 newest paid members had **zero `userbehavior` rows**, plus duplicate inserts and inflated time-on-site. Fixing tracking capture (idle/visibility-aware) + a server-side time cap + a summary/materialized view is on Sanskriti's side (see `analytics-and-measurement-governance.md` and the CRM governance file).
- **Privacy** — IP/behavior data is PII-adjacent; retention and country-derivation must follow `privacy-and-data-use-governance.md`.

### 21.4 Handoff
Community backend feeds the frontend community UI (Aboli) and portal notifications; behavior data feeds Sanskriti's analytics AND the sales/CRM stack (Gautammi/Ajay/Krishna).
