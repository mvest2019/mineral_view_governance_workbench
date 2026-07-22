# Team Member Governance — Gautammi Kamath

> **Status:** Team profile (governed, deep) · **Role:** Sales Team Leader · **Department(s):** CUSTOMER_RELATIONS (Sales)
> **Reports to:** Ryan Cochran · **Experience in project:** — · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Gautammi Kamath's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Gautammi Kamath |
| **Role / Title** | Sales Team Leader |
| **Department(s)** | CUSTOMER_RELATIONS (Sales) |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | — |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Pursuit CRM · email/SMS outreach · demos · conversion messaging |

## 2. Snapshot
**Purpose at Mineral View (one line):** Leads sales outreach, CRM quality, lead research, demos, and conversion-driven messaging.

**Focused on right now:** Building a more organized, accurate, conversion-driven sales/outreach system.

**Top priorities:**
- Conversion-driven outreach system
- Claim-state-aware CRM messaging
- Trust-first unclaimed outreach

## 3. Role in the platform (context)
Gautammi leads how Mineral View **finds, understands, and converts** prospects — from CRM hygiene and segmentation to demos and conversion messaging. Her surfaces are largely external (CRM/email) but they act on the platform's claim-state and owner data, so accuracy and compliance matter.

## 4. Work completed so far at Mineral View
**CRM management & outreach** — manages/audits Pursuit CRM (segmentation, outreach readiness); audited the CRM AI email/SMS recommendation engine (claim-state gaps); validated the 12 segmented email templates.

**Deliverability & campaigns** — email deliverability/tracking/response improvement; Mailchimp campaigns & automation; HubSpot Sales email tracking.

**Research & enablement** — mineral-owner account research; product demos & sales enablement; LinkedIn & Sales Navigator research; social content support; website pop-up & conversion messaging; glossary/owner-education support; Trendelier script review; AI tooling.

## 5. Current work (in progress)
- Building a more organized, accurate, scalable, conversion-driven sales/outreach system.



## 6. Data & systems ownership
This maps what Gautammi owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Outreach-relevant app data | `members_entity` (registration/claim state), `email_subscribe_users`, `claimed_owners` | Uses (read) claim-state + contact data to drive segmented, claim-aware outreach — subject to privacy rules. |


## 7. Governance responsibilities
Gautammi is a primary contributor to, and is expected to keep current, these governance surfaces:
- `Customer_Communication_Style_Guide.md`
- `analytics-and-measurement-governance.md`
- `Compliance_And_Disclaimers.md`
- `privacy-and-data-use-governance.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- CRM data (Pursuit/HubSpot/Mailchimp)
- Claim-state signals from the platform
- Deliverability infrastructure

**Produces (outputs others depend on):**
- Segmented outreach + campaigns
- CRM audit outputs + template fixes
- Demo/sales enablement

## 9. Collaborators & dependencies
- **Works most closely with:** Marketing (Ajay, Krishna, Rohit); Ryan
- **Depends on:** CRM data; claim-state signals; deliverability tooling
- **People/teams who depend on this work:** Sales conversion + outreach outcomes; the funnel

## 10. Domain risks & controls
Risks specific to Gautammi's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Outreach not claim-state-aware (prompts a claimed user to claim) | Wire claim status into messaging; slot-fill templates; claim-count branching. |
| Email compliance / deliverability | Trust-first, permissioned outreach; deliverability strategy; honor unsubscribe (`Compliance_And_Disclaimers.md`). |
| Overstating outcomes in outreach | No return/outcome promises; estimates labeled (P2/P3). |
| PII handling in CRM | Contact data used per `privacy-and-data-use-governance.md`; never sold. |


## 11. Skills & tools
- **Languages / frameworks:** —
- **Tools / platforms:** Pursuit CRM, HubSpot, Mailchimp, LinkedIn/Sales Navigator, Outlook, n8n; ChatGPT/Claude/Gemini/Perplexity
- **Domain knowledge:** Sales funnel, CRM segmentation, claim-state awareness, outreach compliance

## 12. Open questions / blockers / help needed
- Confirm claim-state data source wired into CRM messaging.
- Confirm email-compliance review owner for outreach content.

## 13. Operating sources & references
- `Customer_Communication_Style_Guide.md`
- `Compliance_And_Disclaimers.md`
- `analytics-and-measurement-governance.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`members_entity`** (43 columns): `member_id`, `member_type`, `f_name`, `l_name`, `email_id`, `mailing_st_address`, `city`, `state_master_id`, `zip_code`, `phone_number`, `password`, `notification_phonenumber`, `notification_email`, `preference_optioncode`, `membership_planid`, `membership_expirydate`, `registration_date`, `email_verified`, `email_verification_code`, `email_verification_time`, `reset_password_token`, `reset_password_validity`, `user_name`, `tag_line`, `background_image`, `otp_verification_code`, `ispresentation`, `subscriptionid`, `subscriptionstatus`, `issubscriptionpaid`, `referal_code`, `refered_code`, `email_text`, `membership_status`, `login_type`, `login_json`, `isfirstime`, `isguide`, `isautodebit`, `userType`, `ProfileImageUrl`, `visitorid`, `startdate`

**`email_subscribe_users`** (3 columns): `serial_number`, `create_ts`, `email`

**`claimed_owners`** (9 columns): `id`, `member_id`, `ownernumber`, `ownername`, `owneraddress`, `isactive`, `created_ts`, `updated_ts`, `isclaimed`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Gautammi | — | — |
| Domain methodology / design decisions | C | Gautammi | Ryan Cochran (+ DS SME where data) | Marketing (Ajay, Krishna, Rohit); Ryan |
| Governance change in this area | C | Gautammi | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Gautammi | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** CRM data (Pursuit/HubSpot/Mailchimp); Claim-state signals from the platform; Deliverability infrastructure

**This role transforms/produces:** Segmented outreach + campaigns; CRM audit outputs + template fixes; Demo/sales enablement

**Downstream (depends on this role):** Sales conversion + outreach outcomes; the funnel

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Sales Team Leader** needs to be productive:

- **Stack & access:** role-specific tooling (see §11); tools — Pursuit CRM, HubSpot, Mailchimp, LinkedIn/Sales Navigator, Outlook, n8n; ChatGPT/Claude/Gemini/Perplexity. Request least-privilege access to the systems in §6.
- **Read first:** `Customer_Communication_Style_Guide.md`, `analytics-and-measurement-governance.md`, `Compliance_And_Disclaimers.md`, `privacy-and-data-use-governance.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Marketing (Ajay, Krishna, Rohit); Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Gautammi Kamath's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Gautammi's sales-lead scope against the **Pursuit CRM** system analysis (the CRM built on the platform's production data). Additive to earlier sections.

### 21.1 Pursuit CRM — the system she leads
Pursuit ("MineralView CRM") is a Next.js 15/16 + Prisma + PostgreSQL app with a Python watcher (`run_jobs.py`) as the AI generation engine and Microsoft Graph for two-way email. It reads Mineral View's registered users **live** from production (no cached copy) and drafts persona-matched EMAIL/SMS/CALL outreach for human review. Gautammi is the business owner of this outreach system.

### 21.2 Production tables the CRM consumes (read-only)
`members_entity` (identity), `userbehavior` (browsing/temperature — Sanskriti's data), `membersclaimedleases` + `professional_claimed_owners` (claim rollup, incl. corporate-entity attribution), `subscription_checkout_logs` (paid truth — Tushar's table), `sub_subscription_plan` (persona by plan). This makes the CRM a **downstream consumer** of Tushar's billing data and Sanskriti's behavior data — schema changes upstream affect outreach correctness.

### 21.3 Governed outreach controls (compliance-critical)
- **Human-in-the-loop:** the AI only drafts; a rep approves/sends. Drip halts the moment a lead is marked QUALIFIED/CONVERTED/LOST.
- **TCPA:** channel eligibility decided at **send time**, quiet-hours in the recipient's US-Central time.
- **CAN-SPAM:** every email carries mailto-unsubscribe + physical postal address.
- **Value-honesty:** real-data-vs-estimate split enforced; example dollar figures stripped from prompts; RRC disclaimers; no fabricated numbers; claim-state-aware copy (a v13 rule bans stating a lead's browsing back to them). These mirror `Compliance_And_Disclaimers.md` and must stay in lock-step with it.
- **Template program:** ~42 curated, legal-proofed templates (Owner×Professional × onboarding/nurture/feature × temperature); the master prompt is versioned (v5→v18) as reversible DB rows.

### 21.4 Open items she owns / co-owns
"Approve & Send" currently only records intent (real dispatch reverted pending review); the 30+ persona template bodies are governed by prompt rules but not individually legal-proofed; payment/subscription data not yet wired into the prompt. See the CRM governance file for the full register.
