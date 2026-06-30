# Mineral View — Departments (Ops Map)

Status: ENHANCED (v0.2 — preserves v0.1; department owners still need to be assigned by Ryan)
Owner: Ryan Cochran (final authority) · Maintainer: Nikhil Salunke
Last Updated: 2026-06-23
Applies To: Mineral View only

A working map of the functional areas of Mineral View and which repositories/surfaces each owns.
Departments are a lens for routing questions, findings, and ownership. Confirm and adjust with Ryan;
today many areas roll up to Ryan directly.

## 1. Purpose & scope
Govern the functional-area map used to route findings, questions, and ownership. In scope: the
department list, what each owns, and the routing rules. Out of scope: the per-person roster (in the
Workbench's `TEAM_MEMBER_PROFILES`) and security specifics (`_SECURITY_RISK_REGISTER.md`).

## 2. Department map
### DATA_INGESTION
- **Purpose:** Pull and refresh source data (RRC production/permits, well locations, directional
  surveys, completions, pricing) into PostgreSQL/Mongo.
- **Repos/surfaces:** scrapers and ingestion jobs (not all in this batch), production-data endpoints;
  the `scrapy_data` schema + audit ledger.
- **Owner:** _(confirm)_

### ANALYTICS_AND_VALUATION
- **Purpose:** Decline curves, Mvestimate valuation, cashflow, well-probability, type curves.
- **Repos/surfaces:** Mvestimate microservice (Nikhil Salunke's "108" repo), decline-data
  collection (`Decline_curve`, `DeclineCurve2026`), portal valuation endpoints.
- **Owner:** _(confirm — Nikhil Salunke owns the MVestimate engine; DS SME reviews methodology)_

### MAP_AND_GIS
- **Purpose:** Spatial data, map layers, on-map analytics, tier-gated map features.
- **Repos/surfaces:** MviewMapAPI, `New_Map_Final_Code`, portal GeoJSON layers, ArcGIS on the site.
- **Owner:** _(confirm)_

### PORTAL_PRODUCT
- **Purpose:** The logged-in owner/pro experience — portfolios, claims, owner reports, community.
- **Repos/surfaces:** MViewPortalAPI, Mview-Presentation-Next (logged-in flows).
- **Owner:** _(confirm)_

### PUBLIC_SITE_AND_SEO
- **Purpose:** Public/marketing site, SEO landing pages and sitemaps, content (blogs, podcast,
  news), data coverage.
- **Repos/surfaces:** Mview-Presentation-Next (public), PresentationSiteAPI (SEO/landing/content).
- **Owner:** _(confirm)_

### SUBSCRIPTIONS_AND_PAYMENTS
- **Purpose:** Registration, email verification, tiers/limits, Braintree payments, enterprise plans,
  downgrades, invoices.
- **Repos/surfaces:** PresentationSiteAPI (subscription/payment/enterprise), featureAccess.
- **Owner:** _(confirm)_  ·  Policy: `Pricing_And_Tiers_Policy.md`  ·  Open: Braintree-vs-Cybersource (Q-B)

### DATA_MARKETPLACE
- **Purpose:** Purchasable datasets/packages, downloads, invoices, sample data.
- **Repos/surfaces:** PresentationSiteAPI (PurchaseData), Next data-downloads.
- **Owner:** _(confirm)_

### CUSTOMER_SUCCESS_AND_SUPPORT
- **Purpose:** Owner onboarding, support, the "act-as" support flow, the Monthly Report
  relationship, routing decisions (sell/lease/estate) to a person.
- **Repos/surfaces:** Cerebro (admin), portal, email.
- **Owner:** _(confirm)_  ·  Policy: `Customer_Communication_Style_Guide.md`

### COMMUNITY
- **Purpose:** Groups, forums, feed, followers, moderation/report-abuse.
- **Repos/surfaces:** MViewPortalAPI (Community/Discussions), Next community.
- **Owner:** _(confirm)_

### RISK_SECURITY
- **Purpose:** Secrets handling, access control, "act-as" governance, security register.
- **Repos/surfaces:** all.
- **Owner:** **Ryan Cochran** (until delegated)  ·  See `_SECURITY_RISK_REGISTER.md`

### GOVERNANCE
- **Purpose:** This governance system and its upkeep.
- **Owner:** **Ryan Cochran** (final authority)

## 3. Routing rules
- Route a finding/question to the **matching department**; until an owner is named, it rolls up to
  Ryan.
- Repo classification (the Workbench form, sourced from `C:\MineralView-Repos`) maps each repo to a
  department/category; keep the two consistent.
- Security/PII items route to RISK_SECURITY → Ryan immediately, regardless of department.

## 4. Notes
- The portal's internal departments code lists owner/operator roles for BOLD; the MView roster and
  per-person profiles are defined in the Workbench's `TEAM_MEMBER_PROFILES` and populate the Team
  tab.
- Route findings and questions to the matching department; until owners are named, they roll up to
  Ryan.

## 5. Anti-patterns
Unrouted findings; a repo classified inconsistently between the form and this map; security items
sitting in a functional department instead of escalating to Ryan.

## 6. Evidence notes & gaps (TODO)
Confirm department names and assign an owner to each; keep the roster in sync with the Workbench.
Repo→department mapping is maintained in the Repo Classification form (`repo_classification` table).

---

## 7. Current staffing (2026-06)  ← see `_TEAM_SUMMARY.md` for full contributions

| Department | People |
|---|---|
| GOVERNANCE / RISK_SECURITY | **Ryan Cochran** (final authority), **Nikhil Salunke** |
| DATA_SCIENCE | Pranav Nandeshwar · SMEs: Christos Batsios, Gabor Korosi |
| DATA_ACQUISITION | Riya Wankhade (web scraping — W-1 permits, completions, well locations, pricing) |
| DEVELOPMENT — Backend | Vaishnavi, Sanskriti Choudante, Tushar Patil (+ Nikhil Salunke) |
| DEVELOPMENT — Frontend | Aboli Mundralkar, Pragati Dhumal, Pooja Wable |
| DEVELOPMENT — QA | Utkarsha Chougule |
| PLATFORM_INFRASTRUCTURE | Vaishnavi (DB backup/infra), Nikhil Salunke |
| SUBSCRIPTIONS_AND_PAYMENTS | Tushar Patil (backend) |
| MARKETING | Ajay Landge, Rohit Pandey, Krishna Sable; Shubham Kamble (content); Tejas Zurange (video/graphic) |
| CUSTOMER_RELATIONS (Sales) | Gautammi Kamath (Sales Team Leader) |

> The per-person work-done / current-task detail lives in `_TEAM_SUMMARY.md`; keep both this map
> and that file in sync with the Workbench `TEAM_MEMBER_PROFILES` on any roster change.
