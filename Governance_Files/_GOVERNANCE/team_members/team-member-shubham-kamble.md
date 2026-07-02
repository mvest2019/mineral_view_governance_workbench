# Team Member Governance — Shubham Kamble

> **Status:** Team profile (governed, deep) · **Role:** Content Writer · **Department(s):** MARKETING (Content)
> **Reports to:** Ryan Cochran · **Experience in project:** 2.5+ years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Shubham Kamble's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Shubham Kamble |
| **Role / Title** | Content Writer |
| **Department(s)** | MARKETING (Content) |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | 2.5+ years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Blogs · website/dashboard content · glossary · video scripts · policy (Privacy/Terms) |

## 2. Snapshot
**Purpose at Mineral View (one line):** Creates accurate, accessible oil & gas content across blogs, product UI, glossary, video scripts, and policy docs.

**Focused on right now:** Comprehensive Glossary content — clear, accurate oil & gas definitions.

**Top priorities:**
- Glossary content
- Accurate, SEO-friendly product & site content
- Consistent brand voice

## 3. Role in the platform (context)
Shubham is the **voice of the platform** — translating complex oil & gas concepts into clear content across blogs, product microcopy, the glossary, video scripts, and the legal/policy pages. Accuracy and consistency here directly affect user trust and compliance.

## 4. Work completed so far at Mineral View
**Content** — SEO-friendly blogs; numerous website pages; dashboard content (feature descriptions, guidance, interface messaging); presentation-site content; tooltips/microcopy/notifications/status/instructional text; image captions; video scripts; news content.

**Policy** — drafted/refined legal & compliance content including the Privacy Policy and Terms & Conditions.

**Quality** — reviewed/edited existing content for readability, consistency, accuracy; aligned to brand voice.

## 5. Current work (in progress)
- Comprehensive Glossary content — clear, accurate oil & gas definitions optimized for understanding and search.



## 6. Data & systems ownership
This maps what Shubham owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Content / policy surfaces | `content_data`, `leasereportcontent`, `pricing_faq`, notification/microcopy text | Authors content surfaced across product + site; policy pages (Privacy/Terms). |


## 7. Governance responsibilities
Shubham is a primary contributor to, and is expected to keep current, these governance surfaces:
- `faq-and-glossary-governance.md`
- `Customer_Communication_Style_Guide.md`
- `Compliance_And_Disclaimers.md`
- `publishing-workflow.md`
- `blog-and-seo-content-governance.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- Product functionality context; SEO direction; industry research

**Produces (outputs others depend on):**
- Blogs, glossary, product microcopy, video scripts, Privacy/Terms content

## 9. Collaborators & dependencies
- **Works most closely with:** Krishna, Ajay, Rohit (content/SEO); product teams; Ryan
- **Depends on:** Product context; SEO direction; legal review for policy
- **People/teams who depend on this work:** Owners/professionals reading content; product usability; legal/policy pages

## 10. Domain risks & controls
Risks specific to Shubham's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Inaccurate technical/industry content | Canonical glossary terms; industry-accurate; Texas scope (P1). |
| Content implies advice or overstates | Informational only, no advice; no overstatement (P2/P3); disclaimers where needed. |
| Policy (Privacy/Terms) out of date or unreviewed | Legal review path for policy updates; single canonical wording. |


## 11. Skills & tools
- **Languages / frameworks:** —
- **Tools / platforms:** Content/SEO tooling; documentation tools; AI tools
- **Domain knowledge:** U.S. oil & gas industry, mineral ownership, product/UX writing, policy writing

## 12. Open questions / blockers / help needed
- Confirm legal review path for Privacy/Terms updates.
- Confirm canonical glossary ownership (single source of truth).

## 13. Operating sources & references
- `faq-and-glossary-governance.md`
- `Customer_Communication_Style_Guide.md`
- `Compliance_And_Disclaimers.md`
- `publishing-workflow.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`content_data`** (4 columns): `id`, `county`, `well_content`, `mineral_content`

**`leasereportcontent`** (4 columns): `id`, `feature_name`, `description`, `create_ts`

**`pricing_faq`** (4 columns): `id`, `question`, `answer`, `type`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Shubham | — | — |
| Domain methodology / design decisions | C | Shubham | Ryan Cochran (+ DS SME where data) | Krishna, Ajay, Rohit (content/SEO); product teams; Ryan |
| Governance change in this area | C | Shubham | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Shubham | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** Product functionality context; SEO direction; industry research

**This role transforms/produces:** Blogs, glossary, product microcopy, video scripts, Privacy/Terms content

**Downstream (depends on this role):** Owners/professionals reading content; product usability; legal/policy pages

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Content Writer** needs to be productive:

- **Stack & access:** role-specific tooling (see §11); tools — Content/SEO tooling; documentation tools; AI tools. Request least-privilege access to the systems in §6.
- **Read first:** `faq-and-glossary-governance.md`, `Customer_Communication_Style_Guide.md`, `Compliance_And_Disclaimers.md`, `publishing-workflow.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Krishna, Ajay, Rohit (content/SEO); product teams; Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Shubham Kamble's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Shubham's content scope against the platform surfaces his copy ships to. Additive to earlier sections.

### 21.1 Where his content lands
- **Dashboard & product copy** — feature descriptions, user guidance, interface messaging, tooltips/microcopy/notifications/status/instructional text (this is UX copy inside `Mview-Presentation-Next`, so wording changes are effectively product changes and should be QA-checked).
- **Presentation site** content + **blogs/news** (owners/royalty owners/operators/investors).
- **Video scripts** (promotional/educational/demo — paired with Tejas).
- **Legal/compliance** — the **Privacy Policy** and **Terms & Conditions** (governed by `privacy-and-data-use-governance.md`, `terms-billing-and-refund-governance.md`; material changes need Ryan sign-off).
- **Glossary** — comprehensive oil & gas definitions (current focus).

### 21.2 Governed constraints
Product/microcopy must not assert royalties/earnings unconditionally (use conditional language per `Compliance_And_Disclaimers.md`); any figure that is modeled must read as an estimate; Texas-scope honest. Glossary/terminology consistent with `MineralView_Glossary.md` and the platform glossary the content-publishing domain reads.
