# Mineral View — Team Summary & Contributions

> **Status:** ENHANCED (deep) · **Owner:** Ryan Cochran (final authority) · **Maintainer:** Nikhil Salunke
> **Last Updated:** 2026-06-30 · **Review cadence:** Quarterly + on any roster change
> **Source:** team-member work summaries submitted 2026-06 (16 summaries) + governance context. **Applies To:** Mineral View only.
> **Companion:** `Ops_Departments.md`, `maintenance-cadence-and-ownership.md`, `geospatial-directional-survey-pipeline-governance.md`, the Workbench `TEAM_MEMBER_PROFILES`.

---

## 1. Purpose & scope
A single, governed record of **who is on the Mineral View team, what each person has built, and what they are working on now**, so leadership, governance routing, and onboarding all draw from one consistent source. Every profile is grounded in that person's own submitted work summary; where a summary did not state a fact (e.g. tenure), it is left blank rather than invented. This file is descriptive (current state, not future commitments) and is kept in sync with the Workbench `TEAM_MEMBER_PROFILES` and `Ops_Departments.md`.

## 2. Leadership & governance authority
| Person | Role | Authority |
|---|---|---|
| **Ryan Cochran** | Owner / Founder / Product Owner | **Final authority** on all governance; approves every change and the constitution; nothing enters governance without his sign-off |
| **Nikhil Salunke** | Data Scientist / AI & Data Engineer + Governance Maintainer | Owns the governance corpus + Governance Workbench; owns the MVestimate ("108") engine and the MView_X geospatial pipeline; routes decisions to Ryan |
| **Christos Batsios** | Data-Science SME | Reviews decline / allocation / valuation methodology |
| **Gabor Korosi** | Data-Science SME | Reviews decline / allocation / valuation methodology |

## 3. Team roster (at a glance)
| # | Name | Role | Experience | Primary department |
|---|---|---|---|---|
| 1 | Nikhil Salunke | Data Scientist / AI & Data Engineer + Governance | 2.5+ yrs | DATA_SCIENCE / GOVERNANCE / PLATFORM |
| 2 | Pranav Nandeshwar | Data Scientist | 2+ yrs | DATA_SCIENCE |
| 3 | Riya Wankhade | Python Developer (Web Scraping) | 2.5+ yrs | DATA_ACQUISITION |
| 4 | Vaishnavi | Backend Developer | 3+ yrs | DEVELOPMENT (Backend) / PLATFORM_INFRASTRUCTURE |
| 5 | Sanskriti Choudante | Backend Developer | 2.5 yrs | DEVELOPMENT (Backend) |
| 6 | Tushar Patil | Backend Developer | 2.7 yrs | DEVELOPMENT (Backend) / SUBSCRIPTIONS_AND_PAYMENTS |
| 7 | Aboli Mundralkar | Frontend Developer | 4.8 yrs | DEVELOPMENT (Frontend) |
| 8 | Pragati Dhumal | Frontend Developer | 3.4 yrs | DEVELOPMENT (Frontend) |
| 9 | Pooja Wable | Frontend Developer | 3 yrs | DEVELOPMENT (Frontend) |
| 10 | Utkarsha Chougule | QA Manual Tester | 2+ yrs | DEVELOPMENT (QA) |
| 11 | Gautammi Kamath | Sales Team Leader | — | CUSTOMER_RELATIONS (Sales) |
| 12 | Krishna Sable | Marketing / Product Development | — | MARKETING |
| 13 | Ajay Landge | Business Development & Digital Marketing | — | MARKETING |
| 14 | Rohit Pandey | SEO Executive | — | MARKETING |
| 15 | Shubham Kamble | Content Writer | 2.5+ yrs | MARKETING (Content) |
| 16 | Tejas Zurange | Motion Video Editor | — | MARKETING (Graphic/Video) |

---

## 4. Member profiles (deep)

### 4.1 Nikhil Salunke — Data Scientist / AI Engineer / Data Engineer (2.5+ yrs)
Works across the **complete data lifecycle**: raw sources → extraction → cleaning → validation → engineering → advanced analytics → AI processing → database optimization → API integration → website visualization. Collaborates directly with Ryan, Christos, Gabor, and the dev teams.
- **Data pipelines & scale:** designed end-to-end pipelines turning raw oil & gas datasets into validated, production-ready data; processed multi-million-record datasets with chunk/batch/memory optimization for speed, reliability, and scalability.
- **Data quality:** built cleaning, standardization, and sanitization workflows and **data-validation frameworks** (production-calc checks, historical comparison, duplicate/missing/mismatch detection) across mineral owners, leases, wells, operators, production, disposition, linkage, and geographic datasets.
- **MView Estimate:** owns the calculation workflow (data prep, calc logic, validation, multi-dataset integration, output verification) — accurate, consistent, explainable.
- **Linkage & MongoDB:** cleaned/validated linkage relationships and structured/optimized MongoDB documents for website use.
- **AI extraction:** built AI-based extraction for **directional-survey PDFs** (unstructured → structured), reducing manual entry.
- **Geospatial & domain:** production/disposition processing; mineral-owner data management; full map/geospatial data generation; well identification/extraction logic; Operator Hub analytics; Texas statewide production analysis; nearby-well/lease algorithms; lease-polygon generation; data-allocation analytics; spatio-temporal analysis.
- **Governs:** the **MView_X** ArcGIS geospatial/directional-survey pipeline (`geospatial-directional-survey-pipeline-governance.md`), the **governance corpus + Governance Workbench**, and the MVestimate ("108") engine.
- **Current:** governance-file generation for the AI Workbench (this corpus); **Mineral Owner 2025** data cleanup; ongoing development research/analysis.

### 4.2 Pranav Nandeshwar — Data Scientist (2+ yrs)
Stack: Python, Pandas, NumPy, Matplotlib; MongoDB, PostgreSQL; time-series, feature engineering, forecasting, Monte Carlo, NLP/LLM; GeoPandas, Shapely; Jupyter, n8n, Windows Task Scheduler.
- **Forecasting & allocation:** built a well-level production-allocation framework and BOE/month forecasting models; automated production aggregation; decline-curve and production-trend analysis.
- **Cashflow:** optimized the Mvestimates production-to-cashflow calculation pipelines and automated recurring updates.
- **Linkage pipeline:** redesigned well-to-lease linkage processing and increased refresh frequency from periodic to **multiple daily updates** (near real-time well activity).
- **Geospatial intelligence:** lease/well mapping pipelines, coordinate processing/validation, nearest-lease and neighboring-activity detection, directional/distance relationship calculations.
- **Activity monitoring:** monitoring framework for W-1 permits, completions, production updates, and operator activity with automated event detection and notifications.
- **AI reporting:** AI-powered monthly reporting combining analytics with LLM-generated narratives.
- **Current:** allocation enhancement (well status — Producing/Shut-In/Injection — and filing well types); next-gen **owner-centric** Monthly Mineral Owner Report (transition from lease-centric); expanded monitoring; daily pipeline ops/ETL monitoring; geospatial improvements; decision-support frameworks.

### 4.3 Riya Wankhade — Python Developer / Web Scraping (2.5+ yrs)
Owns the **data-acquisition** layer that feeds the platform.
- **Scrapers:** built and maintains **daily, monthly, and yearly** web-scraping automations for data collection.
- **Processing & validation:** data processing/validation; database integration and maintenance; record, consistency, and data-integrity validation.
- **Resilience:** handles website-structure changes, large data volumes, data-quality issues, and automation reliability.
- **Current:** scraper maintenance (adapting to source changes); validation-automation improvements.

### 4.4 Vaishnavi — Backend Developer (3+ yrs)
Stack: Node.js, Express.js, JavaScript, REST; PostgreSQL, MongoDB, Redis; Git, PM2, IIS, Postman, Windows Server.
- **Core systems:** scalable backend APIs and business logic for lease management, mineral-owner management, dashboards, reporting, and notifications.
- **Mineral Owner Portal:** Claim Mineral Owner process, dashboard, financials API optimization, portfolio management, lease-report enhancements.
- **Professional Account platform:** dashboard, financial reporting, portfolio, activity tracking by lease / county / operator.
- **Map modernization:** a new **TypeScript** map application with all existing functionality plus County Filters, deployed to staging and production.
- **Notifications Hub:** system notifications, my notifications, my agents, create-my-agent.
- **Data Coverage Platform:** mineral-owners and production-data modules with API security/access control.
- **Cerebro:** full-stack development, data-integration and reporting APIs.
- **Performance/security & infra:** API performance, PostgreSQL/MongoDB cleanup, API rate limiting; an **automated PostgreSQL backup** solution with scheduled generation and **Google Drive offsite** upload.
- **Current:** marketing-related platform improvements; portfolio API optimization; cash-flow calculation/reporting APIs; code-review fixes.

### 4.5 Sanskriti Choudante — Backend Developer (2.5 yrs)
Stack: Node.js, Express, REST; PostgreSQL, MS SQL Server, MongoDB; JavaScript, Python; Power BI, Looker, Excel; prompt engineering / AI-assisted development.
- **Mineral data APIs:** backend services for mineral-data management, platform analytics, and professional-account workflows.
- **Behavior analytics:** user-behavior tracking (IP, page visits, engagement patterns, most-viewed sections); Python-based country-level traffic insights from captured IPs to understand geographic reach.
- **Professional accounts:** professional users managing mineral-owner accounts, claiming owner records, and logging in as a mineral owner.
- **Oil & Gas Community backend:** groups, discussions, posts, comments, and expert-interaction workflows for engagement between owners, professionals, and experts.

### 4.6 Tushar Patil — Backend Developer (2.7 yrs)
- **Optimization:** database cleanup; API optimization (query performance, response times).
- **Features:** Operator Hub; Maps/GIS features; **Subscription & Payment** system plus subscription automation/scheduler; authentication & user management; newsletter/engagement; data-download module (lease + well production data).
- **Portal:** Dashboard module, My Portfolio, Field Reports (Lease Report, Reservoir Report).
- **Professional Portal:** Mineral Owner Report.
- **Current:** backend for the user-engagement popup system (popups by visit count); resolution of Claude-AI-reported issues; Community module improvements.

### 4.7 Aboli Mundralkar — Frontend Developer (4.8 yrs)
- **Features:** Dashboard; Claim Mineral Owner; Switch Owner; My Portfolio filters/sorting; PDF download; Map enhancements (completion-status implementation, permit popup); Community feature.
- **Performance:** community thread-detail page optimization; feature landing-page optimization.
- **Current:** **Mineral View mobile application** for Android & iOS.

### 4.8 Pragati Dhumal — Frontend Developer (3.4 yrs)
Stack: React.js, Next.js; responsive/mobile-first design, reusable components, dynamic routing, form validation, modal/popup development, dashboards/analytics interfaces, role-based UI, SEO-friendly development.
- **Features:** Claim Lease & Claim Owner experience and related UI.
- **Current:** a visit-based user-engagement system that dynamically displays targeted popups based on activity and visit count, with interaction tracking and engagement-effectiveness work.

### 4.9 Pooja Wable — Frontend Developer (3 yrs)
- **Features:** interactive map features; operator listing and operator detail page; Data Coverage module; data-download package; landing pages; dashboard; Claim Leases; Search Leases; Field Reports (Well Report & Lease Report); Contact Us.

### 4.10 Utkarsha Chougule — QA Manual Tester (2+ yrs)
Methods: functional, E2E, regression, smoke/sanity, UI/UX, cross-browser/responsive, UAT; STLC/SDLC, Agile/Scrum; SQL/PostgreSQL data validation; AI-assisted test design (ChatGPT, Claude, Gemini).
- **Coverage:** dashboard & portfolio, map (lease/county/well search, filters, popups, report downloads), subscription plans (Free/Pro/Enterprise) and access control, authentication (email verification, Google sign-in), **Claim Mineral Owner** workflows (search → claim → approval → portfolio), reports (lease/well/reservoir), operator module, notifications/alerts.
- **Process:** test-case design/execution, defect management and root-cause analysis, release-readiness and post-deploy validation.
- **Current:** mobile-application testing; **Claude change review & validation** (retesting fixes from Claude-assisted analysis); popup-enhancement testing; ongoing regression/release testing.

### 4.11 Gautammi Kamath — Sales Team Leader
- **CRM & outreach:** manages and audits **Pursuit CRM** (segmentation, outreach readiness); audited the CRM AI **email/SMS recommendation** engine (claim-state awareness gaps) and validated the 12 segmented email templates.
- **Deliverability & campaigns:** email deliverability/tracking/response improvement; Mailchimp campaigns & automation; HubSpot Sales email tracking.
- **Research & enablement:** mineral-owner account research; product demos & sales enablement; LinkedIn & Sales Navigator research; YouTube/LinkedIn/social content support; website pop-up & conversion messaging; glossary/owner-education support; Trendelier script review; AI tooling (ChatGPT, Claude, Gemini, Perplexity, n8n).
- **Current:** building a more organized, accurate, conversion-driven sales/outreach system.

### 4.12 Krishna Sable — Marketing / Product Development
- **Phased contribution:** mineral-owner data collection & sales support; website upgrade and UI/UX improvements with **feature landing pages**; dashboard & portal prototype contributions; map-feature development; **blog & glossary section redesign**; SEO, content marketing & publishing (keyword research, content workflow, publishing results); a **glossary content-development framework**.

### 4.13 Ajay Landge — Business Development & Digital Marketing Executive
- **SEO & content:** drove the end-to-end SEO content workflow (keyword research, intent mapping) feeding **25+ published blogs**; content audit/QA and internal-linking; top SERP rankings; on-page SEO.
- **Technical SEO / AI visibility:** GEO/AI-Overviews audit, schema review, Bing Webmaster + IndexNow, server-rendered H1 fix (live in production).
- **Research & social:** Texas mineral-owner audience research (branded PDF; six search intents → video concepts); social and **YouTube** strategy (Studio audit, two Shorts series).
- **Sales enablement:** feature-demo and full sales-demo scripts; **Pursuit CRM** audit (330+ contacts); CRM AI email/SMS audit; email-template fixes + token reference; email-deliverability strategy (HubSpot + Outlook tracking; earlier Mailchimp campaigns).
- **Automation:** built **Trendelier**, an agentic content-automation pipeline (Next.js + FastAPI, developed with Claude) that pulls trending content (RSS/Reddit/YouTube/energy APIs), scores virality, and generates platform-specific scripts with a human-review step.
- **Current:** glossary pages; AI-search visibility; CTR lift; off-page SEO; state-aware CRM engine; Trendelier roadmap; onboarding/UX audit; trust-first outreach.

### 4.14 Rohit Pandey — SEO Executive
- **SEO:** published SEO-optimized blogs driving organic traffic; keyword research and on-page SEO (meta, headings, internal linking); ranked multiple keywords on top SERP positions.
- **Channels:** social media management; educational **YouTube** content; email marketing via Mailchimp (segmentation, setup, analytics); Bing/Yahoo visibility via Bing Webmaster Tools.
- **Current:** oil & gas **glossary pages** (with supporting images/HTML); AI-search visibility (AI Overviews, Bing Copilot); CTR strategy; off-page SEO (link building, brand mentions).

### 4.15 Shubham Kamble — Content Writer (2.5+ yrs)
- **Content:** SEO-friendly blogs for owners/royalty owners/operators/investors; numerous website pages; **dashboard** content (feature descriptions, guidance, interface messaging); presentation-site content; concise tooltips/microcopy/notifications/status/instructional text; image captions; **video scripts** (promotional/educational/demo); news content.
- **Policy:** drafted/refined legal & compliance content including the **Privacy Policy** and **Terms & Conditions**.
- **Current:** comprehensive **Glossary** content — clear, accurate oil & gas definitions optimized for understanding and search.

### 4.16 Tejas Zurange — Motion Video Editor
- **Video:** produces educational video content for US landowners/mineral-rights holders, combining motion graphics, editing, and storytelling to make industry concepts accessible across YouTube and other platforms; produced a library of videos.
- **Current:** expanding the YouTube channel's short-form (Shorts) content library.

---

## 5. Department rollup (who sits where)
| Department | Members |
|---|---|
| DATA_SCIENCE | Nikhil Salunke, Pranav Nandeshwar (+ SMEs Christos Batsios, Gabor Korosi) |
| DATA_ACQUISITION | Riya Wankhade |
| DEVELOPMENT — Backend | Vaishnavi, Sanskriti Choudante, Tushar Patil (+ Nikhil Salunke) |
| DEVELOPMENT — Frontend | Aboli Mundralkar, Pragati Dhumal, Pooja Wable |
| DEVELOPMENT — QA | Utkarsha Chougule |
| PLATFORM_INFRASTRUCTURE | Vaishnavi (backup/infra), Nikhil Salunke |
| SUBSCRIPTIONS_AND_PAYMENTS | Tushar Patil (backend) |
| MARKETING | Krishna Sable, Ajay Landge, Rohit Pandey, Shubham Kamble (content), Tejas Zurange (video) |
| CUSTOMER_RELATIONS (Sales) | Gautammi Kamath (lead) |
| GOVERNANCE / RISK_SECURITY | Ryan Cochran (final), Nikhil Salunke |

## 6. Governance-routing implications
- **Methodology questions** (decline, allocation, valuation, forecasting) route through **Nikhil / Pranav** and the **DS SMEs (Christos, Gabor)**, then Ryan.
- **Geospatial/RRC/survey** questions route to **Nikhil** (MView_X) and **Pranav** (linkage/geospatial), with **Riya** for source-scraper freshness.
- **Backend/platform** questions route to **Vaishnavi / Sanskriti / Tushar**; **subscriptions/payments** to **Tushar**; **infra/backups** to **Vaishnavi**.
- **Frontend/UX** questions route to **Aboli / Pragati / Pooja**; **QA/release** sign-off involves **Utkarsha**.
- **Content/SEO/marketing** routes to **Krishna / Ajay / Rohit / Shubham / Tejas**; **sales/CRM/outreach** to **Gautammi**.
- All routes terminate at **Ryan** for any governance change.

## 7. Maintenance
- Keep this file in sync with the Workbench `TEAM_MEMBER_PROFILES` and `Ops_Departments.md`.
- Update on any roster change (joiner/leaver/role change) and at quarterly review.
- Each member keeps an individual Work Profile feeding their entry here.

## 8. Evidence notes & gaps
Each profile is grounded in the member's own 2026-06 work summary. **Tenure** is shown only where the summary stated it (Gautammi, Krishna, Ajay, Rohit, Tejas did not state tenure → blank). "Current" items are taken from each summary's work-in-progress section. Leadership/SME roles (Ryan, Christos, Gabor) are from governance context, not a submitted summary.
