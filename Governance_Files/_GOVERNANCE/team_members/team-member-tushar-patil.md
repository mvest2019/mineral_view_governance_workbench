# Team Member Governance — Tushar Patil

> **Status:** Team profile (governed, deep) · **Role:** Backend Developer · **Department(s):** DEVELOPMENT (Backend) · SUBSCRIPTIONS_AND_PAYMENTS
> **Reports to:** Ryan Cochran · **Experience in project:** 2.7 years · **Final authority:** Ryan Cochran
> **Last Updated:** 2026-07-02 · **Review cadence:** Monthly (sections 2–5) + on role/scope change
> **Source:** Tushar Patil's submitted 2026-06 work summary + the June 2026 production-database analysis (`database-schema-reference.md`) + the governance corpus. Grounded strictly in those; fields not stated are left blank. **Applies To:** Mineral View only.
> **Companion:** `_TEAM_SUMMARY.md`, `team_members/_INDEX.md`, `Ops_Departments.md`, `database-and-schema-governance.md`, `MVIEW_Team_Member_Work_Profile_Template`.

---

## 1. Member identity
| Field | Value |
|---|---|
| **Member Name** | Tushar Patil |
| **Role / Title** | Backend Developer |
| **Department(s)** | DEVELOPMENT (Backend) · SUBSCRIPTIONS_AND_PAYMENTS |
| **Reports To** | Ryan Cochran |
| **Experience in Project** | 2.7 years |
| **Final authority (governance)** | Ryan Cochran |
| **Primary surfaces** | Subscriptions & payments · Operator Hub · maps/GIS · portal reports · data-download |

## 2. Snapshot
**Purpose at Mineral View (one line):** Backend for Operator Hub, maps/GIS, subscriptions & payments, portal reports, and platform optimization.

**Focused on right now:** User-engagement popup backend, Claude-reported issue resolution, and Community improvements.

**Top priorities:**
- User-engagement popup backend
- Resolve Claude-reported issues
- Community module improvements

## 3. Role in the platform (context)
Tushar owns the **commercial backend** (subscriptions, payments, data-download purchases) plus Operator Hub, maps/GIS features, and portal reports — the surfaces where money and access rules meet the product.

## 4. Work completed so far at Mineral View
**DB & API optimization** — database cleanup; query-performance and response-time optimization.

**Subscriptions & payments** — the Subscription & Payment system plus subscription automation/scheduler (`subscription*`, `sub_*`, `subscriptionPayment`, `braintree_payment_response`).

**Operator Hub & maps/GIS** — operator surfaces (`operator_*`) and map/GIS features.

**Data-download & purchases** — lease + well production data-download module and purchase flows (`purchase_*`, `pricing`).

**Portal & professional reports** — Dashboard, My Portfolio, Field Reports (Lease/Reservoir Report), Mineral Owner Report (`field_report`, `leasereportcontent`).

**Auth, newsletter, engagement** — authentication & user management; newsletter/engagement.

## 5. Current work (in progress)
- Backend for the user-engagement popup system (popups by visit count — `visitor_popups`).
- Resolution of Claude-AI-reported issues.
- Community module improvements.



## 6. Data & systems ownership
This maps what Tushar owns or heavily touches in the production database (June 2026 backup — `database-schema-reference.md`) and the platform, with the governed responsibility attached.

| Domain | Key tables / data | What it holds & this member's role |
|---|---|---|
| Subscriptions / billing | `subscription*`, `sub_*`, `subscriptionPayment`, `braintree_payment_response`, `subscription_checkout_logs`, `enterprise_*` | Owns tier/claim-limit logic and payment integration (Braintree). |
| Data purchases | `purchase_purchaseDataRequest` (67), `purchase_*`, `pricing`, `county_discounts`, `packages` | Per-county data-package orders and pricing. |
| Operators | `operator_directory`, `operator_data*` | Operator Hub backend. |
| Reports | `field_report`, `leasereportcontent` | Portal/professional report generation. |
| Engagement | `visitor_popups` | Visit-count popup backend. |


## 7. Governance responsibilities
Tushar is a primary contributor to, and is expected to keep current, these governance surfaces:
- `backend-api-governance.md`
- `terms-billing-and-refund-governance.md`
- `free-tier-and-upgrade-path-governance.md`
- `operator-directory-governance.md`
- `reporting-products-governance.md`

## 8. Interfaces — consumes & produces
**Consumes (inputs):**
- PostgreSQL/MongoDB
- Payment processor (Braintree)
- Scheduler infrastructure

**Produces (outputs others depend on):**
- Subscription/payment & purchase APIs
- Operator Hub + report backends
- Data-download packages

## 9. Collaborators & dependencies
- **Works most closely with:** Vaishnavi, Sanskriti (backend); QA (Utkarsha); Ryan
- **Depends on:** Braintree; scheduler; PostgreSQL/MongoDB
- **People/teams who depend on this work:** Subscription/payment flows, operator surfaces, reports, data-download, mobile

## 10. Domain risks & controls
Risks specific to Tushar's area, mapped to the controls and Constitution principles (P1 Texas-only · P2 no overstatement · P3 estimates labeled · P4 provenance/vintage).

| Risk | Control (owner + governance) |
|---|---|
| Tier/claim gating bypass | Enforce feature/claim limits server-side; UI and API must agree (server authoritative). |
| Payment-secret exposure | No processor secrets in code/logs; PCI handled by Braintree. |
| Downgrade/cancel deletes owner data | Define downgrade handling for existing claims/portfolio (`terms-billing-and-refund-governance.md`). |
| Pricing shown ≠ code config | Displayed prices/claim caps match config; Ryan-approved before change. |


## 11. Skills & tools
- **Languages / frameworks:** Node.js, Express, JavaScript, REST
- **Tools / platforms:** PostgreSQL, MongoDB, Git, Postman, Windows Server, Braintree
- **Domain knowledge:** Subscriptions/payments, Operator Hub, maps/GIS, reporting APIs

## 12. Open questions / blockers / help needed
- Confirm downgrade/cancellation handling for existing claims.
- Confirm payment-secret handling (no secrets in code).

## 13. Operating sources & references
- `backend-api-governance.md`
- `terms-billing-and-refund-governance.md`
- `operator-directory-governance.md`
- `reporting-products-governance.md`

## 14. Data dictionary — owned production tables
The exact columns of the production tables this member owns or heavily touches (from the June 2026 backup — the authoritative shape of the data). Column names are verbatim from the export headers.


**`subscription`** (9 columns): `subscriptionid`, `subscriptionname`, `subscriptionamount`, `validityinmonths`, `createts`, `isactive`, `ispopular`, `offerimage`, `coupontagline`

**`subscriptionprices`** (8 columns): `subscriptionpriceid`, `subscriptionid`, `subscriptionamount`, `durationname`, `duration`, `discount`, `createts`, `updatets`

**`subscriptionPayment`** (13 columns): `id`, `subscriptionId`, `member_id`, `amount`, `createTs`, `transactionid`, `paymentnoance`, `transactionJson`, `transaction_type`, `req_json`, `paymentsubscriptionid`, `iscanceled`, `discountedamount`

**`braintree_payment_response`** (7 columns): `id`, `transaction_id`, `email_id`, `amount`, `transaction_data`, `transaction_uid`, `createts`

**`subscription_checkout_logs`** (36 columns): `id`, `checkout_uid`, `member_id`, `email`, `f_name`, `l_name`, `plan_change_type`, `subscription_plan_id`, `plan_name`, `member_type`, `braintree_plan_id`, `amount`, `old_subscription_id`, `braintree_customer_id`, `braintree_payment_token`, `braintree_transaction_id`, `braintree_subscription_id`, `first_billing_date`, `status`, `current_step`, `is_success`, `failure_stage`, `failure_reason`, `braintree_error_code`, `braintree_response`, `email_template`, `email_subject`, `email_sent`, `email_error`, `email_sent_at`, `payment_id`, `request_payload`, `response_payload`, `created_at`, `updated_at`, `completed_at`

**`purchase_purchaseDataRequest`** (67 columns): `id`, `transaction_uid`, `member_id`, `transaction_type`, `total_amount`, `currency`, `email_id`, `Is_mobile_request`, `payment_status`, `Is_data_downloaded`, `payment_response_object`, `subscriptionId`, `create_ts`, `input_county`, `input_playtype`, `input_decimalinterestmin`, `input_decimalinterestmax`, `input_membername`, `braintree_payment_status`, `update_date`, `braintree_transaction_id`, `google_drive_file_link`, `isdeletedfromgdrive`, `downloadeddate`, `file_name`, `attachment`, `data_type`, `input_leaseno`, `input_trackingno`, `input_permitno`, `input_apino`, `input_status`, `input_welltype`, `input_fillingpurpose`, `input_wellboreprofile`, `input_datestart`, `input_dateend`, `input_districtcode`, `input_operatorname`, `input_type`, `input_todepth`, `input_fromdepth`, `isprogress`, `input_formationtype`, `input_depthtvd`, `input_depthmd`, `input_leaseid`, `input_view`, `input_year`, `input_appraisedmin`, `input_appraisedmax`, `input_mineralowneraddress`, `filter_req_object`, `input_fieldname`, `input_depthmdmin`, `input_depthmdmax`, `input_depthtvdmin`, `input_depthtvdmax`, `req_status`, `ispackages`, `f_name`, `package_name`, `discount_percentage`, `original_price`, `countycount`, `directional_survey_type`, `total_count`

**`pricing`** (23 columns): `id`, `county`, `mineraldata_records`, `mineraldata_price`, `well_info_records`, `well_info_price`, `file_download_records`, `file_download_price`, `directional_survey_records`, `directional_survey_price`, `formation_tops_records`, `formation_tops_price`, `lease_produced_records`, `lease_produced_price`, `lease_reserves_records`, `lease_reserves_price`, `well_produced_records`, `well_produced_price`, `well_reserves_records`, `well_reserves_price`, `createts`, `pdf_file_records`, `digitized_file_records`

**`county_discounts`** (7 columns): `id`, `data_type`, `fivecountydiscount`, `tencountydiscount`, `allcounty_discount`, `datatype_image`, `data_type_info`

**`packages`** (9 columns): `id`, `package_name`, `playtypename`, `playtypeid`, `county`, `cost`, `package_map_image`, `package_discount`, `package_county`

**`operator_directory`** (16 columns): `id`, `operator_number`, `operator_name`, `first_address_line`, `second_address_line`, `apt_suite`, `city`, `state`, `zip`, `country`, `phone_number`, `emergency`, `mail_ret_by_po`, `p5_status`, `county`, `operator_logo`

**`field_report`** (40 columns): `id`, `field_number`, `field_name`, `oil_county_regular`, `oil_salt_dome`, `oil_field_location`, `oil_dont_permit`, `oil_schedule_remark`, `oil_comment`, `oil_rule_type`, `oil_depth`, `oil_lease_spacing`, `oil_well_spacing`, `oil_acres_perunit`, `oil_tolerance_perunit`, `oil_diagonal_code`, `oil_diagonal_max_len`, `gas_county_regular`, `gas_salt_dome`, `gas_field_location`, `gas_dont_permit`, `gas_schedule_remark`, `gas_comment`, `gas_rule_type`, `gas_depth`, `gas_lease_spacing`, `gas_well_spacing`, `gas_acres_perunit`, `gas_tolerance_perunit`, `gas_diagonal_code`, `gas_diagonal_max_len`, `api_number`, `surface_tolerance_box`, `collaborative_interval_box`, `first_last_box`, `perpendicular_leaseline_box`, `horizontal_to_vertical_dir_box`, `horizontal_to_horizontal_dir_box`, `overlap_distance_box`, `stacked_lateral_rule_box`

**`leasereportcontent`** (4 columns): `id`, `feature_name`, `description`, `create_ts`

**`visitor_popups`** (7 columns): `id`, `member_id`, `popup_count`, `last_session_id`, `last_visit_at`, `created_at`, `updated_at`

**`enterprise_payment_checkout_track`** (29 columns): `id`, `inquiry_id`, `work_email`, `full_name`, `payment_status`, `payment_amount`, `braintree_transaction_id`, `braintree_status`, `payment_response`, `payment_error`, `payment_done_at`, `account_status`, `is_new_account`, `account_error`, `account_done_at`, `email_status`, `email_type`, `email_to`, `email_subject`, `email_html`, `email_template_name`, `email_error`, `email_sent_at`, `error_occurred`, `error_step`, `error_message`, `error_stack`, `created_at`, `updated_at`

## 15. RACI & decision rights
| Decision | Role of this member | Responsible | Accountable | Consulted/Informed |
|---|---|---|---|---|
| Day-to-day execution in this domain | **R** | Tushar | — | — |
| Domain methodology / design decisions | C | Tushar | Ryan Cochran (+ DS SME where data) | Vaishnavi, Sanskriti (backend); QA (Utkarsha); Ryan |
| Governance change in this area | C | Tushar | **Ryan Cochran (A)** | DS SME / leads |
| Release / publish affecting this domain | R | Tushar | Ryan Cochran (A) | QA (Utkarsha) |

## 16. Cross-team data flow
**Upstream (feeds this role):** PostgreSQL/MongoDB; Payment processor (Braintree); Scheduler infrastructure

**This role transforms/produces:** Subscription/payment & purchase APIs; Operator Hub + report backends; Data-download packages

**Downstream (depends on this role):** Subscription/payment flows, operator surfaces, reports, data-download, mobile

A break or error at this step propagates downstream, so the controls in §10 exist to stop bad data/output before it moves on.

## 17. Constitution alignment
How this role upholds the Mineral View Constitution (every surface it touches must satisfy these):

- **P1 — Texas-only scope:** anything this role ships or surfaces is scoped to Texas/RRC reality; never implies nationwide data.
- **P2 — No overstatement:** capability/coverage/accuracy claims in this domain are honest; "not found" never means "doesn't exist."
- **P3 — Estimates labeled:** any modeled/estimated figure that flows through this role (EUR, cashflow, allocation, valuation) is labeled an estimate with its confidence context.
- **P4 — Provenance & vintage:** data this role handles carries its source + RRC pull vintage; RRC restatement is respected (no silently-stale figures).
- **Tier & access:** feature/claim access matches the user's plan and is enforced server-side; owner/financial data is access-controlled and never leaks across owners.

## 18. Onboarding & handover notes
What a successor stepping into **Backend Developer** needs to be productive:

- **Stack & access:** Node.js, Express, JavaScript, REST; tools — PostgreSQL, MongoDB, Git, Postman, Windows Server, Braintree. Request least-privilege access to the systems in §6.
- **Read first:** `backend-api-governance.md`, `terms-billing-and-refund-governance.md`, `free-tier-and-upgrade-path-governance.md`, `operator-directory-governance.md`, plus `_TEAM_SUMMARY.md` and `database-and-schema-governance.md`.
- **Know the data:** the owned tables/columns in §14 and the canonical keys (API-14, lease+district, ownernumber, member_id).
- **Watch out for:** the risks in §10 and the open questions in §12.
- **Who to ask:** Vaishnavi, Sanskriti (backend); QA (Utkarsha); Ryan; final sign-off from Ryan Cochran.

## 19. Review & audit cadence
What to check, and how often, to keep this domain healthy:

- **Monthly:** refresh sections 2–5 of this profile; review the domain's data freshness/vintage and any open items.
- **Per release:** QA sign-off on changes in this domain (regression + post-deploy sanity).
- **Quarterly:** full review of this profile, the owned governance files (§7), and the risk register (§10) with Ryan.
- **On change:** any role/scope/ownership change is reflected here + in `_TEAM_SUMMARY.md` + `Ops_Departments.md`, with a `DECISION_LOG.md` entry when governance is affected.

## 20. Metadata & governance note
- **Profile grounded in:** Tushar Patil's submitted 2026-06 work summary + the June 2026 production-database analysis + the governance corpus.
- This is a **descriptive** record of current state, not a commitment. Role/scope/ownership changes are governed: update this file, `_TEAM_SUMMARY.md`, and `Ops_Departments.md` in sync. Final approval on any governed change: **Ryan Cochran**.
- **Review:** sections 2–5 refreshed monthly; the whole profile at quarterly review or on any role change.

## 21. Platform & systems grounding (2026-07 deep pass)

Grounds Tushar's commercial-backend scope against the KB repos, the payment tables, and two cross-system links (the CRM's paid-truth source and the Claude-reported-issue loop). Additive to earlier sections.

### 21.1 Repos & code surfaces (from the KB)
- **`PresentationSiteAPI`** — subscriptions-billing (Braintree token+checkout, manage/cancel/downgrade, enterprise), auth, newsletter.
- **`MviewMapAPI`** — subscription **feature-gating** middleware (`checkFeatureAccess` against `sub_*` counters; 403 `{feature_access}`), plus map/GIS backend.
- **`MViewPortalAPI`** — data-download module, Field/Reservoir/Owner reports, Operator Hub surfaces.
- Schedulers — auto-downgrade, expiry→Free, enterprise-downgrade jobs.

### 21.2 The paid-truth link to Pursuit CRM (important)
Tushar owns **`subscription_checkout_logs`** (36 cols: attempt-by-attempt Braintree status, `is_success`, `failure_reason`, `braintree_transaction_id`, email-sent status). The Pursuit CRM audit found `members_entity.issubscriptionpaid` **drifts stale**, so the CRM switched its paid-user source of truth to `subscription_checkout_logs.is_success = true`. That makes this table a shared contract between billing and sales/CRM — schema or semantics changes here must be coordinated with Gautammi's team (see the CRM governance file).

### 21.3 The "Claude-reported issue" loop
Tushar's current work resolving Claude-flagged issues in the **Presentation** and **Community** APIs is one side of a live AI-assisted QA loop; **Utkarsha** validates the fixes. This loop should be governed like any change stream: reproduce → fix → QA re-validate → release, with a `DECISION_LOG.md` entry where behavior changes.

### 21.4 Gating integrity (governed)
Free = one active lease visible; Pro = 2 owners + all leases; Premium = 5 owners + all leases; Enterprise bypasses limits. These caps must match `Pricing_And_Tiers_Policy.md` and be enforced **server-side** (UI is not authoritative). Displayed price/claim caps must equal code config and are Ryan-approved before change.
