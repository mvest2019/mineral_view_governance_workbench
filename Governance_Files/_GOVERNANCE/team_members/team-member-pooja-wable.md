# Team Member Governance — Pooja Wable

> **Status:** Team profile (governed, deep) · **Role:** Frontend Developer · **Department(s):** DEVELOPMENT (Frontend)
> **Reports to:** Ryan Cochran · **Experience in project:** 3 years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Pooja Wable's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Pooja Wable |
| **Role / Title** | Frontend Developer |
| **Department(s)** | DEVELOPMENT (Frontend) |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | 3 years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Map · operator pages · Data Coverage · data-download · field reports · claim/search |

## 2. Snapshot
**Purpose at Mineral View (one line):** Builds the owner/professional-facing UI that turns the platform's data into usable screens.

**Focused on right now:** Frontend feature development and enhancement across map/operator/reports surfaces.

**Top priorities:**
- Map & operator surfaces
- Data Coverage & data-download UI
- Field reports UI

## 3. Role in the platform (context)
Pooja builds the **customer-facing frontend** — the screens where owners and professionals search, claim, view portfolios, explore the map, and read reports. The frontend renders data it does not own; it must respect tier/claim rules and present figures with their source/vintage and estimate labels.

## 4. Work completed so far at Mineral View
**Map & operator surfaces** — interactive map features; operator listing and operator detail page.

**Data & reports** — Data Coverage module; data-download package; Field Reports (Well & Lease Report).

**Core flows** — dashboard; Claim Leases; Search Leases; landing pages; Contact Us.

## 5. Current work (in progress)
- Continuing frontend feature development/enhancement across map/operator/reports surfaces.



## 6. Data & systems ownership
This maps what Pooja owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Operator UI | `operator_directory`, `operator_data*` | Operator listing/detail pages. |
| Reports / coverage | `field_report`, coverage modules | Field reports + Data Coverage UI. |


## 7. Governance responsibilities
Pooja is a primary contributor to, and is expected to keep current, these governance surfaces:
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
Risks specific to Pooja's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

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
- Confirm operator-page data contract with backend.
- Confirm data-download package scope/limits by tier.

## 13. Operating sources & references
- `frontend-governance.md`
- `design-ux-and-screenshot-governance.md`
- `owner-portal-governance.md`
- `accessibility-governance.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`operator_directory`** (16 columns): `id`, `operator_number`, `operator_name`, `first_address_line`, `second_address_line`, `apt_suite`, `city`, `state`, `zip`, `country`, `phone_number`, `emergency`, `mail_ret_by_po`, `p5_status`, `county`, `operator_logo`

**`operator_data`** (8 columns): `county`, `operator_number`, `operator_name`, `location`, `main_url`, `detail_link`, `address`, `phone`

**`field_report`** (40 columns): `id`, `field_number`, `field_name`, `oil_county_regular`, `oil_salt_dome`, `oil_field_location`, `oil_dont_permit`, `oil_schedule_remark`, `oil_comment`, `oil_rule_type`, `oil_depth`, `oil_lease_spacing`, `oil_well_spacing`, `oil_acres_perunit`, `oil_tolerance_perunit`, `oil_diagonal_code`, `oil_diagonal_max_len`, `gas_county_regular`, `gas_salt_dome`, `gas_field_location`, `gas_dont_permit`, `gas_schedule_remark`, `gas_comment`, `gas_rule_type`, `gas_depth`, `gas_lease_spacing`, `gas_well_spacing`, `gas_acres_perunit`, `gas_tolerance_perunit`, `gas_diagonal_code`, `gas_diagonal_max_len`, `api_number`, `surface_tolerance_box`, `collaborative_interval_box`, `first_last_box`, `perpendicular_leaseline_box`, `horizontal_to_vertical_dir_box`, `horizontal_to_horizontal_dir_box`, `overlap_distance_box`, `stacked_lateral_rule_box`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Pooja | — | — |
| Domain methodology / design decisions | C | Pooja | Ryan Cochran (+ DS SME where data) | Other frontend devs (Aboli, Pragati, Pooja); backend team; QA (Utkarsha); Ryan |
| Governance change in this area | C | Pooja | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Pooja | Ryan Cochran (A) | QA (Utkarsha) |

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
- **Profile grounded in:** Pooja Wable's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Pooja's frontend scope against the KB feature map. Additive to earlier sections.

### 21.1 Repo & code surfaces
- **`Mview-Presentation-Next`** (Next.js 15 / TS). Her surfaces map to KB features: interactive **Map** (lease/ownership/boundary layers, zoom/filter/location search — over `MviewMapAPI` GeoJSON), **Operator listing + detail** (operator-intelligence, over `operator_*`), **Data Coverage** module + **Data Download** package (over the data-platform/purchase flows — paired with Tushar's backend), **landing pages** (Monthly Reports, Professionals, Knowledge Center), Dashboard (MV Estimate, Claim Leases, financials), **Search Leases** + **Claim Leases**, Field Reports (Well + Lease), and Contact Us.

### 21.2 API dependencies & governed constraints
Her map screens depend on `MviewMapAPI` (GeoJSON wire format, viewport/county loads, feature-gating 403s) and the portal/presentation APIs for reports, coverage, and downloads. Governed constraints: large-dataset rendering must stay performant (map viewport paging), Field Report figures that are modeled (MVestimate/EUR) must show as estimates (P3), and Data Coverage must not imply nationwide coverage (Texas-only, P1).

### 21.3 Data-download UX
The download package UI must reflect the correct per-county pricing/records from `pricing`/`packages` (Tushar's backend) and gate by plan; secure retrieval only (no direct object exposure).
