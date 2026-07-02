# Team Member Governance — Tejas Zurange

> **Status:** Team profile (governed, deep) · **Role:** Motion Video Editor · **Department(s):** MARKETING (Graphic/Video)
> **Reports to:** Ryan Cochran · **Experience in project:** — · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Tejas Zurange's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Tejas Zurange |
| **Role / Title** | Motion Video Editor |
| **Department(s)** | MARKETING (Graphic/Video) |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | — |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | YouTube educational video · motion graphics · Shorts |

## 2. Snapshot
**Purpose at Mineral View (one line):** Produces educational video content that makes oil & gas concepts accessible to Texas mineral owners.

**Focused on right now:** Expanding the YouTube channel's short-form (Shorts) content library.

**Top priorities:**
- Short-form video library
- Motion-graphics educational content
- Audience-focused storytelling

## 3. Role in the platform (context)
Tejas turns industry concepts into **accessible video** — motion graphics and storytelling for Texas landowners/mineral-rights holders on YouTube and other channels, extending the education-first brand.

## 4. Work completed so far at Mineral View
**Educational video** — produced a library of educational videos combining motion graphics, editing, and storytelling for US landowners/mineral-rights holders across YouTube and other platforms.

## 5. Current work (in progress)
- Expanding the Mineral View YouTube channel's short-form (Shorts) content library.



## 6. Data & systems ownership
This maps what Tejas owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

_No production-database tables are owned directly by this role; work is on content/marketing/sales surfaces (see §6–7)._

## 7. Governance responsibilities
Tejas is a primary contributor to, and is expected to keep current, these governance surfaces:
- `media-and-assets-governance.md`
- `mineral-owner-education-governance.md`
- `Customer_Communication_Style_Guide.md`
- `publishing-workflow.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- Scripts (content team); brand assets

**Produces (outputs others depend on):**
- Educational videos + Shorts; brand video assets

## 9. Collaborators & dependencies
- **Works most closely with:** Ajay, Rohit (YouTube/social); content team; Ryan
- **Depends on:** Scripts; brand-asset source of truth
- **People/teams who depend on this work:** YouTube audience; brand visibility

## 10. Domain risks & controls
Risks specific to Tejas's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Video makes an inaccurate/overstated claim | Script-accuracy review before publish; Texas scope (P1/P2); no advice. |
| Unlicensed media / brand inconsistency | Licensed media only; brand-asset source of truth (`media-and-assets-governance.md`). |


## 11. Skills & tools
- **Languages / frameworks:** —
- **Tools / platforms:** Motion-graphics / video-editing tooling
- **Domain knowledge:** U.S. oil & gas industry, mineral ownership, video storytelling

## 12. Open questions / blockers / help needed
- Confirm script-accuracy review before publishing videos.
- Confirm brand-asset source of truth for video.

## 13. Operating sources & references
- `media-and-assets-governance.md`
- `mineral-owner-education-governance.md`
- `Customer_Communication_Style_Guide.md`

## 14. Data dictionary — owned production tables
_This role operates on content/media/video surfaces rather than owning production-database tables; see §6–7 for the systems it touches._

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Tejas | — | — |
| Domain methodology / design decisions | C | Tejas | Ryan Cochran (+ DS SME where data) | Ajay, Rohit (YouTube/social); content team; Ryan |
| Governance change in this area | C | Tejas | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Tejas | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** Scripts (content team); brand assets

**This role transforms/produces:** Educational videos + Shorts; brand video assets

**Downstream (depends on this role):** YouTube audience; brand visibility

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Motion Video Editor** needs to be productive:

- **Stack & access:** role-specific tooling (see §11); tools — Motion-graphics / video-editing tooling. Request least-privilege access to the systems in §6.
- **Read first:** `media-and-assets-governance.md`, `mineral-owner-education-governance.md`, `Customer_Communication_Style_Guide.md`, `publishing-workflow.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Ajay, Rohit (YouTube/social); content team; Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Tejas Zurange's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Tejas's video scope against the content/brand governance. Additive to earlier sections.

### 21.1 Output & tooling
Produces educational + promotional video for US landowners/mineral owners: motion graphics + editing (**Adobe After Effects, Premiere Pro**) plus **AI video generation** (Runway Gen-3, Kling 1.6, Sora, Pika 2.0) for cinematic b-roll, and **dashboard screen-recording** walkthroughs. Has produced ~40 YouTube videos (topics span royalty checks, permits/completions, operator strength, MVestimate explainers, lease/division-order guidance). Optimizes titles/descriptions/tags for YouTube SEO. Current: expanding the short-form (Shorts) library.

### 21.2 Governed constraints (brand + compliance + IP)
- **Compliance:** video claims about royalties/earnings/valuations must follow `Compliance_And_Disclaimers.md` (conditional language; MVestimate is an estimate) and stay Texas-honest (P1/P2). Screen recordings must not expose another owner's data or PII.
- **IP / assets:** AI-generated and stock assets must be license-clean; brand voice/visual consistency per `media-and-assets-governance.md` and `design-ux-and-screenshot-governance.md`.
- **Sourcing:** where a video cites a number (permits, production), it should trace to a real platform/RRC figure (provenance), not an invented one.

### 21.3 Cross-team
Scripts come from Shubham and (via Trendelier) Ajay/Gautammi; screen-recordings track the live product (Aboli/Pragati/Pooja surfaces) — so video must be refreshed when those UIs change.
