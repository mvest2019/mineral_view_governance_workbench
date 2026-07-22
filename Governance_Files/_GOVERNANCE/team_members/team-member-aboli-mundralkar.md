# Team Member Governance — Aboli Mundralkar

> **Status:** Team profile (governed, deep) · **Role:** Frontend Developer · **Department(s):** DEVELOPMENT (Frontend)
> **Reports to:** Ryan Cochran · **Experience in project:** 4.8 years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Aboli Mundralkar's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Aboli Mundralkar |
| **Role / Title** | Frontend Developer |
| **Department(s)** | DEVELOPMENT (Frontend) |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | 4.8 years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Owner portal · claim/switch owner · portfolio · map enhancements · community · mobile app |

## 2. Snapshot
**Purpose at Mineral View (one line):** Builds the owner/professional-facing UI that turns the platform's data into usable screens.

**Focused on right now:** Mineral View mobile application (Android & iOS).

**Top priorities:**
- Ship the mobile app (Android & iOS)
- Maintain claim/portfolio/map UI
- Frontend performance

## 3. Role in the platform (context)
Aboli builds the **customer-facing frontend** — the screens where owners and professionals search, claim, view portfolios, explore the map, and read reports. The frontend renders data it does not own; it must respect tier/claim rules and present figures with their source/vintage and estimate labels.

## 4. Work completed so far at Mineral View
**Owner-facing features** — Dashboard; Claim Mineral Owner; Switch Owner; My Portfolio filters/sorting; PDF download; Community feature.

**Map enhancements** — completion-status implementation and permit popup.

**Performance** — community thread-detail page and feature landing-page optimization.

## 5. Current work (in progress)
- Mineral View mobile application for Android & iOS (mirroring core web workflows).



## 6. Data & systems ownership
This maps what Aboli owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Claims / portfolio UI | `membersclaimedleases`, `memberleases`, `claimed_owners` | Renders claim/switch/portfolio flows (read via backend APIs). |
| Map UI | map layers, `w1permits` popups, completion status | Map enhancements + popups. |


## 7. Governance responsibilities
Aboli is a primary contributor to, and is expected to keep current, these governance surfaces:
- `frontend-governance.md`
- `design-ux-and-screenshot-governance.md`
- `owner-portal-governance.md`
- `accessibility-governance.md`
- `performance-and-technical-seo-governance.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- Backend APIs (claims, portfolio, map, reports, operators)
- Design system (navy/teal, Lexend)
- Data figures with source/vintage from backend

**Produces (outputs others depend on):**
- The owner/professional UI screens
- Rendered claim/portfolio/map/report experiences

## 9. Collaborators & dependencies
- **Works most closely with:** Other frontend devs (Aboli, Pragati, Pooja); backend team; QA (Utkarsha); Ryan
- **Depends on:** Backend API contracts; design specs
- **People/teams who depend on this work:** Owners and professionals using the web (and mobile) UI

## 10. Domain risks & controls
Risks specific to Aboli's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Showing a tier-restricted action to a Free user | Tier-aware rendering; server remains authoritative (P-tier). |
| Displaying a figure without source/vintage or estimate label | UI surfaces source/vintage where design allows; estimates visibly labeled (P3/P4). |
| Implying nationwide coverage | Texas-only framing (P1); no overstatement (P2). |
| Inaccessible/broken UI on release | Accessibility + performance in the QA launch/update gate. |


## 11. Skills & tools
- **Languages / frameworks:** JavaScript/TypeScript, React
- **Tools / platforms:** React ecosystem, styling/UI libraries, Git
- **Domain knowledge:** Owner-portal UX, claim/portfolio/map/report surfaces

## 12. Open questions / blockers / help needed
- Confirm web↔mobile parity scope for v1.
- Confirm design-system tokens for mobile.

## 13. Operating sources & references
- `frontend-governance.md`
- `design-ux-and-screenshot-governance.md`
- `owner-portal-governance.md`
- `accessibility-governance.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`membersclaimedleases`** (17 columns): `id`, `member_id`, `lease_number`, `lease_name`, `district_code`, `county`, `original_decimal_interest`, `modified_decimal_interest`, `isclaimed`, `iswatchlist`, `claimed_date_and_time`, `leaseswitchtimestamp`, `ispaid`, `lease_switch_count`, `ownernumber`, `ownername`, `owneraddress`

**`memberleases`** (24 columns): `id`, `district_code`, `lease_number`, `lease_name`, `member_id`, `member_name`, `member_email_id`, `isclaimed`, `claimdatetime`, `decimal_interest`, `mvestimate_old`, `current_year_tax_value`, `leaseinfo_lease_id`, `group_name`, `onwatchlist`, `original_interest`, `yesterdaysmvestimate`, `mvestimateupdatedatetime`, `oilsoldper`, `gassoldper`, `pv10`, `mvestimate`, `county`, `iswatchlist`

**`claimed_owners`** (9 columns): `id`, `member_id`, `ownernumber`, `ownername`, `owneraddress`, `isactive`, `created_ts`, `updated_ts`, `isclaimed`

**`w1permits`** (28 columns): `id`, `api`, `status_number`, `issued_date`, `status`, `filed`, `wellboreprofiles`, `filing_purpose`, `swr`, `horizontal_wellbore`, `stacked_lateral_parent_well_dp`, `perpendiculars`, `distanceone`, `directionone`, `distancetwo`, `directiontwo`, `spud_date`, `drilling_completed_date`, `surface_casing_date`, `completed_date`, `validated_date`, `status_suffix`, `submit_date`, `isscrape`, `new_api`, `updated_date`, `firstactivity_date`, `old_api`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Aboli | — | — |
| Domain methodology / design decisions | C | Aboli | Ryan Cochran (+ DS SME where data) | Other frontend devs (Aboli, Pragati, Pooja); backend team; QA (Utkarsha); Ryan |
| Governance change in this area | C | Aboli | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Aboli | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** Backend APIs (claims, portfolio, map, reports, operators); Design system (navy/teal, Lexend); Data figures with source/vintage from backend

**This role transforms/produces:** The owner/professional UI screens; Rendered claim/portfolio/map/report experiences

**Downstream (depends on this role):** Owners and professionals using the web (and mobile) UI

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Frontend Developer** needs to be productive:

- **Stack & access:** JavaScript/TypeScript, React; tools — React ecosystem, styling/UI libraries, Git. Request least-privilege access to the systems in §6.
- **Read first:** `frontend-governance.md`, `design-ux-and-screenshot-governance.md`, `owner-portal-governance.md`, `accessibility-governance.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Other frontend devs (Aboli, Pragati, Pooja); backend team; QA (Utkarsha); Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Aboli Mundralkar's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Aboli's frontend scope against the KB frontend repo and the owner-centric + mobile programs. Additive to earlier sections.

### 21.1 Repo & code surfaces
- **`Mview-Presentation-Next`** (Next.js 15 / TypeScript, branch `Dev_New_V1`) — the single FE repo. Aboli is the most senior FE (4.8 yrs) and the only **Angular + React** developer, which matters for any legacy-Angular surfaces still in play.
- Feature surfaces she built map to KB features: Dashboard (`app/portal/page.tsx` MVestimate/cashflow widgets), Claim Mineral Owner + **Switch Owner** (owner-centric flow), My Portfolio filters/sort, PDF report generation (4 formats), Map (completion-status, permit popup), and the Community UI (over `MV-Community`).

### 21.2 API dependencies
Her screens consume `MViewPortalAPI` (portfolio, claims, dashboard, field reports), `MviewMapAPI` (map/GeoJSON, feature-gating 403s), `MV-Community` (threads/groups), and `PresentationSiteAPI` (auth/content). Response-shape changes in those services are her primary integration risk.

### 21.3 Mobile application (current, governed)
Aboli **leads the Android/iOS app** — porting existing web features to mobile while adapting UI/UX to platform standards. Governed implications: feature-gating and claim limits must be enforced the same server-side way on mobile (no client-trust), estimate labeling (P3) and disclaimers must render on mobile, and QA (Utkarsha) covers web↔mobile parity.

### 21.4 Owner-centric migration (shared)
The Claim/Switch-Owner UI is the frontend of the platform-wide lease→owner shift (Pranav on reporting, Vaishnavi/Tushar on backend). Owner-scoped views must never leak another owner's leases (tier/access rule).
