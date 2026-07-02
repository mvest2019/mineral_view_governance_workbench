# Team Member Governance — Utkarsha Chougule

> **Status:** Team profile (governed, deep) · **Role:** QA Manual Tester · **Department(s):** DEVELOPMENT (QA)
> **Reports to:** Ryan Cochran · **Experience in project:** 2+ years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Utkarsha Chougule's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Utkarsha Chougule |
| **Role / Title** | QA Manual Tester |
| **Department(s)** | DEVELOPMENT (QA) |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | 2+ years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | End-to-end / functional / regression / release testing across all modules |

## 2. Snapshot
**Purpose at Mineral View (one line):** Ensures platform quality through end-to-end functional, regression, and release testing across every module.

**Focused on right now:** Mobile-app testing, Claude change review/validation, and popup-enhancement testing.

**Top priorities:**
- Mobile-app testing
- Validate Claude-assisted fixes
- Regression/release testing

## 3. Role in the platform (context)
Utkarsha is the **quality gate** before anything reaches production. She validates the full user journey — claim, subscription, map, reports, auth, notifications — and now validates fixes surfaced by Claude-assisted analysis. No release is 'done' without her sign-off.

## 4. Work completed so far at Mineral View
**Full-platform test coverage** — dashboard & portfolio; map (lease/county/well search, filters, popups, report downloads); subscription plans (Free/Pro/Enterprise) + access control; authentication (email verification, Google sign-in); Claim Mineral Owner (search → claim → approval → portfolio); reports (lease/well/reservoir); operator module; notifications/alerts.

**Test process** — test-case design/execution; positive/negative/boundary/edge-case testing; defect management and root-cause analysis; release-readiness and post-deploy validation.

**AI-assisted testing** — used ChatGPT/Claude/Gemini to generate test cases, scenarios, and edge cases and improve coverage.

## 5. Current work (in progress)
- Mobile-application testing (web↔mobile consistency).
- Claude change review & validation — retesting fixes from Claude-assisted analysis.
- Popup-enhancement testing.
- Ongoing regression/release testing.



## 6. Data & systems ownership
This maps what Utkarsha owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Data validation (backend verification) | validates frontend data against `membersclaimedleases`, `subscription*`, `field_report`, `operator_directory` etc. | Verifies displayed data matches the database/business logic (SQL/PostgreSQL checks). |


## 7. Governance responsibilities
Utkarsha is a primary contributor to, and is expected to keep current, these governance surfaces:
- `quality-assurance-checklists.md`
- `release-and-deployment-governance.md`
- `change-management-governance.md`
- `incident-and-rollback-governance.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- Builds/releases from the dev team
- Requirements + acceptance criteria
- Claude-assisted analysis findings

**Produces (outputs others depend on):**
- Test cases, defect reports, release-readiness sign-off
- Validated confirmation that fixes work and don't regress

## 9. Collaborators & dependencies
- **Works most closely with:** Frontend & backend teams; Ryan
- **Depends on:** Dev builds; requirements; test environment
- **People/teams who depend on this work:** Every release depends on QA sign-off

## 10. Domain risks & controls
Risks specific to Utkarsha's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Regression slips to production | Full regression before release; post-deploy sanity (`release-and-deployment-governance.md`). |
| Claim/subscription edge cases (claim limits, duplicates, tier access) fail | Positive/negative/boundary testing across the claim + subscription matrix. |
| Defect tracking is informal (Excel) | Candidate for a proper tracker; ensure traceability of findings → fixes → retests. |


## 11. Skills & tools
- **Languages / frameworks:** Manual testing; SQL basics; Java basics; Selenium (learning)
- **Tools / platforms:** PostgreSQL, Postman (learning), Chrome DevTools, ChatGPT/Claude/Gemini
- **Domain knowledge:** STLC/SDLC, Agile/Scrum, claim/subscription/map/report workflows, data validation

## 12. Open questions / blockers / help needed
- Confirm defect-tracking system of record (currently Excel).
- Confirm the release-readiness checklist is the canonical gate.

## 13. Operating sources & references
- `quality-assurance-checklists.md`
- `release-and-deployment-governance.md`
- `change-management-governance.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`membersclaimedleases`** (17 columns): `id`, `member_id`, `lease_number`, `lease_name`, `district_code`, `county`, `original_decimal_interest`, `modified_decimal_interest`, `isclaimed`, `iswatchlist`, `claimed_date_and_time`, `leaseswitchtimestamp`, `ispaid`, `lease_switch_count`, `ownernumber`, `ownername`, `owneraddress`

**`subscription`** (9 columns): `subscriptionid`, `subscriptionname`, `subscriptionamount`, `validityinmonths`, `createts`, `isactive`, `ispopular`, `offerimage`, `coupontagline`

**`field_report`** (40 columns): `id`, `field_number`, `field_name`, `oil_county_regular`, `oil_salt_dome`, `oil_field_location`, `oil_dont_permit`, `oil_schedule_remark`, `oil_comment`, `oil_rule_type`, `oil_depth`, `oil_lease_spacing`, `oil_well_spacing`, `oil_acres_perunit`, `oil_tolerance_perunit`, `oil_diagonal_code`, `oil_diagonal_max_len`, `gas_county_regular`, `gas_salt_dome`, `gas_field_location`, `gas_dont_permit`, `gas_schedule_remark`, `gas_comment`, `gas_rule_type`, `gas_depth`, `gas_lease_spacing`, `gas_well_spacing`, `gas_acres_perunit`, `gas_tolerance_perunit`, `gas_diagonal_code`, `gas_diagonal_max_len`, `api_number`, `surface_tolerance_box`, `collaborative_interval_box`, `first_last_box`, `perpendicular_leaseline_box`, `horizontal_to_vertical_dir_box`, `horizontal_to_horizontal_dir_box`, `overlap_distance_box`, `stacked_lateral_rule_box`

**`operator_directory`** (16 columns): `id`, `operator_number`, `operator_name`, `first_address_line`, `second_address_line`, `apt_suite`, `city`, `state`, `zip`, `country`, `phone_number`, `emergency`, `mail_ret_by_po`, `p5_status`, `county`, `operator_logo`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Utkarsha | — | — |
| Domain methodology / design decisions | C | Utkarsha | Ryan Cochran (+ DS SME where data) | Frontend & backend teams; Ryan |
| Governance change in this area | C | Utkarsha | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Utkarsha | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** Builds/releases from the dev team; Requirements + acceptance criteria; Claude-assisted analysis findings

**This role transforms/produces:** Test cases, defect reports, release-readiness sign-off; Validated confirmation that fixes work and don't regress

**Downstream (depends on this role):** Every release depends on QA sign-off

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **QA Manual Tester** needs to be productive:

- **Stack & access:** Manual testing; SQL basics; Java basics; Selenium (learning); tools — PostgreSQL, Postman (learning), Chrome DevTools, ChatGPT/Claude/Gemini. Request least-privilege access to the systems in §6.
- **Read first:** `quality-assurance-checklists.md`, `release-and-deployment-governance.md`, `change-management-governance.md`, `incident-and-rollback-governance.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Frontend & backend teams; Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Utkarsha Chougule's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Utkarsha's QA scope against the change streams she validates, including the AI-assisted loops. Additive to earlier sections.

### 21.1 Coverage mapped to systems
Her E2E/functional/regression coverage spans the KB domains: account-auth (email verify, Google sign-in), subscriptions-billing (Free/Pro/Premium/Enterprise gating + access control), gis-mapping (lease/county/well search, filters, popups, report downloads), lease-portfolio (**Claim Mineral Owner** search→claim→approval→portfolio; decimal-interest values; claim limits), field-reports (lease/well/reservoir), operator surfaces, and notifications/alerts. She uses **PostgreSQL data validation** to check frontend values against backend truth.

### 21.2 The Claude-change validation loop (governed)
Utkarsha is the **validation half of the AI-assisted QA loop**: she retests fixes that Tushar (and others) implement for Claude-flagged issues, plus regression to ensure resolved issues don't regress. Governed shape: each Claude-reported issue → fix → **Utkarsha re-validation (functional + regression + post-deploy sanity)** → release sign-off, recorded where behavior changes.

### 21.3 Mobile & popup (current)
She now tests the **mobile app** (web↔mobile parity — pairing with Aboli) and the **popup enhancement** system (navigation, responsiveness, cross-module behavior — pairing with Pragati/Tushar/Gautammi). Gating and estimate-labeling must be verified identically on mobile.

### 21.4 Release gate
QA sign-off is a governed release gate (`release-and-deployment-governance.md`, `quality-assurance-checklists.md`). Utkarsha is Consulted/Informed on every domain release in the per-member RACI tables.
