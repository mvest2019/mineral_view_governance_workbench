# Team Member Governance — Krishna Sable

> **Status:** Team profile (governed, deep) · **Role:** Marketing / Product Development · **Department(s):** MARKETING
> **Reports to:** Ryan Cochran · **Experience in project:** — · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Krishna Sable's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Krishna Sable |
| **Role / Title** | Marketing / Product Development |
| **Department(s)** | MARKETING |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | — |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Website UI/UX · landing pages · blog & glossary · SEO/content · data collection |

## 2. Snapshot
**Purpose at Mineral View (one line):** Bridges marketing and product — data collection, website UI/UX, landing pages, map, and content/SEO.

**Focused on right now:** SEO, content marketing & publishing, and the glossary content framework.

**Top priorities:**
- Content/SEO publishing
- Glossary content framework
- Landing-page & UX contributions

## 3. Role in the platform (context)
Krishna spans **marketing and product** — contributing to website UI/UX, feature landing pages, the blog/glossary redesign, and the SEO/content engine, while also supporting mineral-owner data collection.

## 4. Work completed so far at Mineral View
**Data collection & sales support** — mineral-owner data collection & sales support (early phase).

**Website & UI/UX** — website upgrade + UI/UX improvements with feature landing pages; dashboard & portal prototype contributions; map-feature development.

**Content & SEO** — blog & glossary section redesign; SEO/content marketing & publishing (keyword research, content workflow, publishing results); a glossary content-development framework.

## 5. Current work (in progress)
- SEO, content marketing & publishing; glossary content development framework.



## 6. Data & systems ownership
This maps what Krishna owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Content / config | `content_data`, `landing_pages`, `pricing_faq`, `marketupdates` | Contributes content/config surfaced on the site (governed by content/publishing rules). |


## 7. Governance responsibilities
Krishna is a primary contributor to, and is expected to keep current, these governance surfaces:
- `blog-and-seo-content-governance.md`
- `faq-and-glossary-governance.md`
- `page-governance.md`
- `publishing-workflow.md`
- `Customer_Communication_Style_Guide.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- Product/feature context; SEO direction; design tools

**Produces (outputs others depend on):**
- Landing pages, blog/glossary content, SEO output
- Glossary content framework

## 9. Collaborators & dependencies
- **Works most closely with:** Ajay, Rohit, Shubham (content/SEO); frontend team; Ryan
- **Depends on:** Content pipeline; product/design surfaces
- **People/teams who depend on this work:** Organic growth + product communication

## 10. Domain risks & controls
Risks specific to Krishna's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Inaccurate/overstated marketing claims | Accuracy over ranking; Texas-only (P1); no overstatement (P2); legal review for claims. |
| Glossary drift across pages | Single canonical glossary reused (`faq-and-glossary-governance.md`). |
| Estimates presented as facts in content | Estimates labeled (P3). |


## 11. Skills & tools
- **Languages / frameworks:** —
- **Tools / platforms:** SEO/content tooling, web/UI design tools; AI tools
- **Domain knowledge:** Content strategy, SEO, UX, glossary, product communication

## 12. Open questions / blockers / help needed
- Confirm glossary framework ownership vs content-writer role (avoid overlap).
- Confirm landing-page approval path.

## 13. Operating sources & references
- `blog-and-seo-content-governance.md`
- `faq-and-glossary-governance.md`
- `page-governance.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`content_data`** (4 columns): `id`, `county`, `well_content`, `mineral_content`

**`landing_pages`** (8 columns): `id`, `page_slug`, `metatitle`, `metadesc`, `page_content`, `is_active`, `created_at`, `updated_at`

**`pricing_faq`** (4 columns): `id`, `question`, `answer`, `type`

**`marketupdates`** (8 columns): `id`, `symbolname`, `lastprice`, `change`, `changepercentage`, `currency`, `datetime`, `marketupdatetype`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Krishna | — | — |
| Domain methodology / design decisions | C | Krishna | Ryan Cochran (+ DS SME where data) | Ajay, Rohit, Shubham (content/SEO); frontend team; Ryan |
| Governance change in this area | C | Krishna | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Krishna | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** Product/feature context; SEO direction; design tools

**This role transforms/produces:** Landing pages, blog/glossary content, SEO output; Glossary content framework

**Downstream (depends on this role):** Organic growth + product communication

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Marketing / Product Development** needs to be productive:

- **Stack & access:** role-specific tooling (see §11); tools — SEO/content tooling, web/UI design tools; AI tools. Request least-privilege access to the systems in §6.
- **Read first:** `blog-and-seo-content-governance.md`, `faq-and-glossary-governance.md`, `page-governance.md`, `publishing-workflow.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Ajay, Rohit, Shubham (content/SEO); frontend team; Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Krishna Sable's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Krishna's marketing/product scope against the Pursuit CRM and the content surfaces. Additive to earlier sections.

### 21.1 Pursuit CRM optimization
Krishna's ongoing CRM work is on **Pursuit**: reviewing every CRM tab, improving workflows/usability, and **optimizing prompts and email-generation/receiving workflows** (with Claude + ChatGPT), building on Sachin's initial prototype and working with Prasad (frontend). This is prompt/template/UX optimization on the same system Gautammi leads and Ajay audited — coordination point: the master prompt versions and the 42-template library are shared, governed artifacts (changes are reversible DB rows; don't fork copy silently).

### 21.2 Content & site surfaces
- **Feature landing pages** (MVestimate, Lease/Well Report, Lease Activity, Monthly Report, Portfolio, Oil & Gas Activity Alerts) — content + UI/UX via **Vercel V0**, structure inspired by ahrefs. These are the `data-platform`/marketing pages the frontend team then implements and the CRM's 9-feature catalog is curated from.
- **Blog & Glossary redesign** (detail pages, author sections, schema markup) + ~40 published blogs (team of three) — feeds `blog-and-seo-content-governance.md`, `faq-and-glossary-governance.md`.
- **Glossary content framework** — foundational MD guidance docs (with Claude) that Shubham and others write against.

### 21.3 Background & governed constraints
Ex-**BOLD Precious Metals**; strong Texas mineral-ownership data understanding from the early sales-support phase. Landing-page and CRM copy must follow the compliance rules (no unconditional royalty claims; estimates labeled) in `Compliance_And_Disclaimers.md`.
