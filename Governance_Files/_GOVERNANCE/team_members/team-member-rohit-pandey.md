# Team Member Governance — Rohit Pandey

> **Status:** Team profile (governed, deep) · **Role:** SEO Executive · **Department(s):** MARKETING
> **Reports to:** Ryan Cochran · **Experience in project:** — · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Rohit Pandey's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Rohit Pandey |
| **Role / Title** | SEO Executive |
| **Department(s)** | MARKETING |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | — |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | SEO blogs · keyword research · on-page SEO · glossary pages · social/YouTube · email |

## 2. Snapshot
**Purpose at Mineral View (one line):** Grows organic traffic and search visibility through SEO content, keyword research, and on-page optimization.

**Focused on right now:** Glossary pages, AI-search visibility, CTR, and off-page SEO.

**Top priorities:**
- Glossary pages (images/HTML)
- AI-search visibility & CTR
- Off-page SEO

## 3. Role in the platform (context)
Rohit drives **organic search visibility** — SEO blogs, keyword research, on-page optimization, and the glossary pages — plus social/YouTube and email channels, expanding the platform's reach to Texas mineral owners.

## 4. Work completed so far at Mineral View
**SEO** — published SEO-optimized blogs; keyword research; on-page SEO (meta, headings, internal linking); ranked multiple keywords on top SERP.

**Channels** — social media management; educational YouTube content; email marketing via Mailchimp (segmentation, setup, analytics); Bing/Yahoo visibility via Bing Webmaster Tools.

## 5. Current work (in progress)
- Oil & gas glossary pages (with supporting images/HTML).
- AI-search visibility (AI Overviews, Bing Copilot).
- CTR strategy; off-page SEO (link building, brand mentions).



## 6. Data & systems ownership
This maps what Rohit owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Content / SEO surfaces | `content_data`, `landing_pages`, `pricing_faq` | Content surfaced on the site (governed by content/publishing rules). |


## 7. Governance responsibilities
Rohit is a primary contributor to, and is expected to keep current, these governance surfaces:
- `blog-and-seo-content-governance.md`
- `faq-and-glossary-governance.md`
- `performance-and-technical-seo-governance.md`
- `publishing-workflow.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- SEO/search-console tooling; keyword data; content pipeline

**Produces (outputs others depend on):**
- SEO blogs, glossary pages, organic traffic + topical authority

## 9. Collaborators & dependencies
- **Works most closely with:** Ajay, Krishna, Shubham; Ryan
- **Depends on:** Content pipeline; search-console tooling
- **People/teams who depend on this work:** Organic traffic and topical authority

## 10. Domain risks & controls
Risks specific to Rohit's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Inaccurate glossary/blog content | Accuracy + canonical terms (P2); legal review for claims. |
| Thin/duplicate SEO pages | Unique content per page; internal linking. |
| Estimates as facts in content | Estimates labeled (P3). |


## 11. Skills & tools
- **Languages / frameworks:** —
- **Tools / platforms:** SEO tooling, Mailchimp, Bing Webmaster; ChatGPT/Gemini/Perplexity/Claude
- **Domain knowledge:** Keyword research, on-page SEO, content optimization, search visibility

## 12. Open questions / blockers / help needed
- Confirm glossary-page division of labor with content writer + Krishna.
- Confirm off-page SEO approach/approval.

## 13. Operating sources & references
- `blog-and-seo-content-governance.md`
- `faq-and-glossary-governance.md`
- `performance-and-technical-seo-governance.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`content_data`** (4 columns): `id`, `county`, `well_content`, `mineral_content`

**`landing_pages`** (8 columns): `id`, `page_slug`, `metatitle`, `metadesc`, `page_content`, `is_active`, `created_at`, `updated_at`

**`pricing_faq`** (4 columns): `id`, `question`, `answer`, `type`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Rohit | — | — |
| Domain methodology / design decisions | C | Rohit | Ryan Cochran (+ DS SME where data) | Ajay, Krishna, Shubham; Ryan |
| Governance change in this area | C | Rohit | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Rohit | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** SEO/search-console tooling; keyword data; content pipeline

**This role transforms/produces:** SEO blogs, glossary pages, organic traffic + topical authority

**Downstream (depends on this role):** Organic traffic and topical authority

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **SEO Executive** needs to be productive:

- **Stack & access:** role-specific tooling (see §11); tools — SEO tooling, Mailchimp, Bing Webmaster; ChatGPT/Gemini/Perplexity/Claude. Request least-privilege access to the systems in §6.
- **Read first:** `blog-and-seo-content-governance.md`, `faq-and-glossary-governance.md`, `performance-and-technical-seo-governance.md`, `publishing-workflow.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Ajay, Krishna, Shubham; Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Rohit Pandey's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Rohit's SEO scope against the content/SEO governance surfaces. Additive to earlier sections.

### 21.1 Channels & surfaces
On-page SEO (meta/headings/internal linking) driving top-SERP rankings; social management; educational **YouTube** content; **Mailchimp** email marketing (segmentation, setup, analytics); Bing/Yahoo visibility via Bing Webmaster Tools; oil & gas **glossary** pages (with supporting images/HTML). Uses AI tools (ChatGPT, Gemini, Perplexity, Claude) for content and workflow.

### 21.2 Governed surfaces he feeds
`seo-governance.md`, `blog-and-seo-content-governance.md`, `faq-and-glossary-governance.md`, `county-pages-governance.md` (county SEO content pairs with `Presentation_FAQs`/county pages), and `performance-and-technical-seo-governance.md` (AI-search visibility, CTR, off-page in progress).

### 21.3 Governed constraints
Published SEO/blog/glossary content must be technically accurate (oil & gas domain), avoid unconditional royalty/earnings claims, and keep Texas-scope honest (P1/P2). Glossary definitions are shared with Shubham's content and the platform glossary — keep terminology consistent with `MineralView_Glossary.md`.
