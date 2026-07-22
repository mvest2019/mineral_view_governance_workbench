# Team Member Governance — Ajay Landge

> **Status:** Team profile (governed, deep) · **Role:** Business Development & Digital Marketing Executive · **Department(s):** MARKETING
> **Reports to:** Ryan Cochran · **Experience in project:** — · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Ajay Landge's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Ajay Landge |
| **Role / Title** | Business Development & Digital Marketing Executive |
| **Department(s)** | MARKETING |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | — |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | SEO/content · technical & AI-search SEO · CRM · Trendelier automation |

## 2. Snapshot
**Purpose at Mineral View (one line):** Drives SEO/content growth, technical/AI-search visibility, CRM outreach, and content automation.

**Focused on right now:** Glossary pages, AI-search visibility, CTR, off-page SEO, CRM, and the Trendelier roadmap.

**Top priorities:**
- AI-search visibility & CTR
- State-aware CRM engine
- Trendelier roadmap
- Off-page SEO

## 3. Role in the platform (context)
Ajay runs the **growth engine** — SEO/content strategy (25+ blogs), technical + AI-search visibility, CRM outreach diagnostics, and Trendelier (an agentic content-automation pipeline built with Claude). His work sits at the top of the funnel and in CRM conversion.

## 4. Work completed so far at Mineral View
**SEO & content** — end-to-end SEO content workflow feeding 25+ blogs; content audit/QA + internal-linking; top SERP rankings; on-page SEO.

**Technical SEO / AI visibility** — GEO/AI-Overviews audit, schema, Bing Webmaster + IndexNow, server-rendered H1 fix (live).

**Research & social** — Texas mineral-owner audience research (branded PDF; six search intents); YouTube strategy (Studio audit, two Shorts series).

**Sales enablement** — feature-demo & sales-demo scripts; Pursuit CRM audit (330+ contacts); CRM AI email/SMS audit; email-template fixes + token reference; email-deliverability strategy (HubSpot + Outlook).

**Trendelier** — built an agentic content-automation pipeline (Next.js + FastAPI, developed with Claude) that pulls trending content, scores virality, and generates platform-specific scripts with a human-review step.

## 5. Current work (in progress)
- Glossary pages; AI-search visibility (AI Overviews, Bing Copilot); CTR lift; off-page SEO.
- State-aware CRM recommendation engine.
- Trendelier roadmap (hosting, titles/thumbnails node, review-to-publish SOP).
- Onboarding/UX audit; trust-first outreach; consolidated CRM audit workbook.



## 6. Data & systems ownership
This maps what Ajay owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Content / SEO surfaces | `landing_pages`, `content_data`, `marketupdates` | Content the site surfaces; governed by content/publishing rules. |
| Outreach-relevant data | `members_entity` claim-state, `email_subscribe_users` | Read for state-aware CRM (privacy-governed). |


## 7. Governance responsibilities
Ajay is a primary contributor to, and is expected to keep current, these governance surfaces:
- `blog-and-seo-content-governance.md`
- `performance-and-technical-seo-governance.md`
- `publishing-workflow.md`
- `Customer_Communication_Style_Guide.md`
- `Compliance_And_Disclaimers.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- Search-console/SEO tooling; CRM data; trending-content sources (RSS/Reddit/YouTube/energy APIs)

**Produces (outputs others depend on):**
- Blogs, glossary pages, SEO/AI-visibility improvements
- CRM audit outputs; Trendelier pipeline

## 9. Collaborators & dependencies
- **Works most closely with:** Gautammi (sales), Krishna, Rohit, Shubham; Ryan
- **Depends on:** Content pipeline; CRM data; search-console tooling
- **People/teams who depend on this work:** Organic growth, outreach conversion, content automation

## 10. Domain risks & controls
Risks specific to Ajay's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Trendelier auto-publishes unreviewed content | Mandatory human-review step before publish (governed SOP). |
| AI-search content inaccurate/overstated | Accuracy + Texas scope (P1/P2); structured, sourced content. |
| CRM not claim-state-aware | Wire claim status into the recommendation engine. |


## 11. Skills & tools
- **Languages / frameworks:** —
- **Tools / platforms:** Next.js, FastAPI (Trendelier); HubSpot, Mailchimp, Outlook, Pursuit CRM, Bing Webmaster/IndexNow; Claude/ChatGPT/Gemini/Perplexity
- **Domain knowledge:** SEO/AI visibility, CRM automation, email deliverability, content strategy

## 12. Open questions / blockers / help needed
- Confirm human-review SOP is enforced before any Trendelier auto-publish.
- Confirm claim-state data source for the state-aware CRM engine.

## 13. Operating sources & references
- `blog-and-seo-content-governance.md`
- `performance-and-technical-seo-governance.md`
- `publishing-workflow.md`
- `Customer_Communication_Style_Guide.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`landing_pages`** (8 columns): `id`, `page_slug`, `metatitle`, `metadesc`, `page_content`, `is_active`, `created_at`, `updated_at`

**`content_data`** (4 columns): `id`, `county`, `well_content`, `mineral_content`

**`marketupdates`** (8 columns): `id`, `symbolname`, `lastprice`, `change`, `changepercentage`, `currency`, `datetime`, `marketupdatetype`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Ajay | — | — |
| Domain methodology / design decisions | C | Ajay | Ryan Cochran (+ DS SME where data) | Gautammi (sales), Krishna, Rohit, Shubham; Ryan |
| Governance change in this area | C | Ajay | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Ajay | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** Search-console/SEO tooling; CRM data; trending-content sources (RSS/Reddit/YouTube/energy APIs)

**This role transforms/produces:** Blogs, glossary pages, SEO/AI-visibility improvements; CRM audit outputs; Trendelier pipeline

**Downstream (depends on this role):** Organic growth, outreach conversion, content automation

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Business Development & Digital Marketing Executive** needs to be productive:

- **Stack & access:** role-specific tooling (see §11); tools — Next.js, FastAPI (Trendelier); HubSpot, Mailchimp, Outlook, Pursuit CRM, Bing Webmaster/IndexNow; Claude/ChatGPT/Gemini/Perplexity. Request least-privilege access to the systems in §6.
- **Read first:** `blog-and-seo-content-governance.md`, `performance-and-technical-seo-governance.md`, `publishing-workflow.md`, `Customer_Communication_Style_Guide.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Gautammi (sales), Krishna, Rohit, Shubham; Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Ajay Landge's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Ajay's BizDev/marketing scope against Trendelier and the Pursuit CRM. Additive to earlier sections.

### 21.1 Trendelier — the agentic pipeline he built
A **Next.js + FastAPI** agentic content-automation pipeline (built with Claude): pulls trending content from RSS/Reddit/YouTube/energy APIs, scores virality, and generates platform-specific scripts via LLM with a **human-review step** before publishing. It feeds YouTube/LinkedIn/social content (Tejas/Gautammi review its script outputs). Governed like any AI-generation surface: human review before publish, brand/compliance rules applied, provenance of source content recorded.

### 21.2 Pursuit CRM audit contributions
Ajay **audited the CRM's AI email/SMS recommendation engine** and found it lacked claim-state awareness — recommending wiring claimed-lease status into the prompt, slot-fill templating, and claim-count branching. He reviewed/corrected the 12 segmented templates (token-naming collisions → a canonical token-method reference) and drove email-deliverability strategy (HubSpot + Outlook tracking; earlier Mailchimp). Much of this is now implemented in Pursuit's persona/claim-aware prompt engineering (v5→v18) — his audit is the origin of that design.

### 21.3 SEO / AI-visibility surfaces
End-to-end SEO content workflow feeding 25+ blogs; technical SEO (GEO/AI-Overviews audit, schema, Bing Webmaster + IndexNow, **server-rendered H1 fix live in prod**); YouTube Studio audit + two Shorts series; audience research (branded PDF, six search intents). Feeds `seo-governance.md`, `performance-and-technical-seo-governance.md`, `blog-and-seo-content-governance.md`.

### 21.4 Governed constraints
All AI-assisted content (Trendelier, CRM copy) must clear the human-review + compliance gate; SEO claims about the product must not overstate coverage (P1/P2).
