# Team Member Governance — Pragati Dhumal

> **Status:** Team profile (governed, deep) · **Role:** Frontend Developer · **Department(s):** DEVELOPMENT (Frontend)
> **Reports to:** Ryan Cochran · **Experience in project:** 3.4 years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Pragati Dhumal's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Pragati Dhumal |
| **Role / Title** | Frontend Developer |
| **Department(s)** | DEVELOPMENT (Frontend) |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | 3.4 years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Claim experiences · dashboards · role-based UI · engagement popups (Next.js) |

## 2. Snapshot
**Purpose at Mineral View (one line):** Builds the owner/professional-facing UI that turns the platform's data into usable screens.

**Focused on right now:** Visit-based user-engagement popup system with interaction tracking.

**Top priorities:**
- Engagement popup system
- Claim lease/owner UX
- Reusable, SEO-friendly components

## 3. Role in the platform (context)
Pragati builds the **customer-facing frontend** — the screens where owners and professionals search, claim, view portfolios, explore the map, and read reports. The frontend renders data it does not own; it must respect tier/claim rules and present figures with their source/vintage and estimate labels.

## 4. Work completed so far at Mineral View
**Claim experience** — Claim Lease & Claim Owner experience and related UI.

**Patterns** — responsive/mobile-first, reusable components, dynamic routing, form validation, modals/popups, dashboards, role-based UI, SEO-friendly development.

## 5. Current work (in progress)
- Visit-based user-engagement popup system — targeted popups by activity/visit count, interaction tracking, engagement-effectiveness.



## 6. Data & systems ownership
This maps what Pragati owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Claims UI | `membersclaimedleases`, `claimed_owners` | Claim lease/owner UI. |
| Engagement | `visitor_popups` | Visit-count targeted popups + interaction tracking. |


## 7. Governance responsibilities
Pragati is a primary contributor to, and is expected to keep current, these governance surfaces:
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
Risks specific to Pragati's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Showing a tier-restricted action to a Free user | Tier-aware rendering; server remains authoritative (P-tier). |
| Displaying a figure without source/vintage or estimate label | UI surfaces source/vintage where design allows; estimates visibly labeled (P3/P4). |
| Implying nationwide coverage | Texas-only framing (P1); no overstatement (P2). |
| Inaccessible/broken UI on release | Accessibility + performance in the QA launch/update gate. |


## 11. Skills & tools
- **Languages / frameworks:** JavaScript/TypeScript, React, Next.js
- **Tools / platforms:** React ecosystem, styling/UI libraries, Git
- **Domain knowledge:** Owner-portal UX, claim/portfolio/map/report surfaces

## 12. Open questions / blockers / help needed
- Confirm popup frequency-capping + privacy rules for interaction tracking.
- Confirm tier-aware rendering source of truth (server).

## 13. Operating sources & references
- `frontend-governance.md`
- `design-ux-and-screenshot-governance.md`
- `owner-portal-governance.md`
- `accessibility-governance.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`membersclaimedleases`** (17 columns): `id`, `member_id`, `lease_number`, `lease_name`, `district_code`, `county`, `original_decimal_interest`, `modified_decimal_interest`, `isclaimed`, `iswatchlist`, `claimed_date_and_time`, `leaseswitchtimestamp`, `ispaid`, `lease_switch_count`, `ownernumber`, `ownername`, `owneraddress`

**`claimed_owners`** (9 columns): `id`, `member_id`, `ownernumber`, `ownername`, `owneraddress`, `isactive`, `created_ts`, `updated_ts`, `isclaimed`

**`visitor_popups`** (7 columns): `id`, `member_id`, `popup_count`, `last_session_id`, `last_visit_at`, `created_at`, `updated_at`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Pragati | — | — |
| Domain methodology / design decisions | C | Pragati | Ryan Cochran (+ DS SME where data) | Other frontend devs (Aboli, Pragati, Pooja); backend team; QA (Utkarsha); Ryan |
| Governance change in this area | C | Pragati | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Pragati | Ryan Cochran (A) | QA (Utkarsha) |

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

- **Stack & access:** JavaScript/TypeScript, React, Next.js; tools — React ecosystem, styling/UI libraries, Git. Request least-privilege access to the systems in §6.
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
- **Profile grounded in:** Pragati Dhumal's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Pragati's frontend scope against the KB and the popup/claim programs. Additive to earlier sections.

### 21.1 Repo & code surfaces
- **`Mview-Presentation-Next`** (Next.js 15 / TS). Her surfaces map to KB features: authentication (login/registration/Google OAuth), subscriptions-billing UI (Pricing, Checkout, Manage Plan, Enterprise), Professional Portal (dashboard/portfolio/lease/owner/reporting + account switching), Operator Hub (listing/detail, comparison), content/SEO pages (blogs, news, glossary, FAQ, policies, Contact, My Account), and notifications/newsletter UI.

### 21.2 Visit-based popup system (current, cross-system)
Pragati builds the **frontend of the visit-based engagement popup system** — the five-popup, visit-threshold funnel. This has three coupled owners: **Tushar** (backend, `visitor_popups`), **Pragati** (UI), and **Gautammi** (conversion copy). Governed constraints: popup copy must follow `Compliance_And_Disclaimers.md` (no asserting royalties exist without conditional language), a no-popup control cohort is preserved, and interaction tracking respects `privacy-and-data-use-governance.md`.

### 21.3 Claim migration (governed)
She is migrating claim flows from legacy **popup-based → page-based** (desktop/tablet/mobile responsive) with improved validation. Claim/owner APIs consumed from `MViewPortalAPI`; owner-scoped rendering must respect tier/access.

### 21.4 Performance
SSR, lazy loading, image optimization, Lighthouse — feeds `performance-and-technical-seo-governance.md`.
