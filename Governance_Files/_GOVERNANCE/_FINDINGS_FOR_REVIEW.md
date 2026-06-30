# Mineral View — Findings For Review

Status: LIVE
Owner: Ryan Cochran (final authority)
Last Updated: 2026-06-16
Applies To: Mineral View only

Findings from the deep repo review. Each is **a candidate**, not approved truth.
Types: FACT / PATTERN / INCONSISTENCY / INFERENCE. Triage each through the workflow.

### F-001 — Secrets, keys, and certificates are committed into source control
**Type:** FACT
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** Repos contain `.env`, `production_env.txt`, `staging_env.txt`, `production-config.txt`, and TLS material (`server.crt`, `key.pem`, `csr.pem`). Exposed keys include DB connection strings, `JWT_SECRET`, Braintree `MERCHENT_ID`, `Chat_GPT_KEY`, `CLOUDINARY_API_SECRET`, `PUBLIC_API_SECRET`, and Google/MS client secrets.
**Why It Matters:** Anyone with repo access gains production credentials and a TLS private key. Highest-priority risk on the platform.
**Proposed Action:** Rotate every exposed secret, move to a secret store, `.gitignore` them, scrub history, reissue the certificate. See `_SECURITY_RISK_REGISTER.md` and `Engineering_Standards.md`.
**Confidence:** High

### F-002 — PresentationSiteAPI exists as two long-lived divergent branches
**Type:** INCONSISTENCY
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** `PresentationSiteAPI-Master` and `PresentationSiteAPI-Mview_Prod` differ; `Mview_Prod` carries extra `db/migrations` and a slightly different dependency set.
**Why It Matters:** Two divergent backends for the same site invite drift and unclear authority.
**Proposed Action:** Declare one canonical branch, document the delta, reconcile and retire the other.
**Confidence:** High

### F-003 — Subscription tier names differ between the product vision and the code
**Type:** INCONSISTENCY
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** The owner-intelligence briefing names personas "Access / Insights / Pro." The code's `SUBSCRIPTION_PLAN_MAP` defines `Anonymous / Free / Pro / Premium` (plan ids 0–4), plus a separate Enterprise plan.
**Why It Matters:** Tiers are core to revenue and to how the AI phrases answers per persona. Two vocabularies confuse customers, billing, and the corpus.
**Proposed Action:** Decide canonical customer-facing tier names and limits; align code, briefing, `Pricing_And_Tiers_Policy.md`, and `Customer_Communication_Style_Guide.md`.
**Confidence:** High

### F-004 — Tier/feature gating is implemented in more than one codebase
**Type:** PATTERN
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** A `featureAccess` / `featureAccessMiddleware` exists in both `MviewMapAPI` and `PresentationSiteAPI`, each reading plan limits from the DB.
**Why It Matters:** Inconsistent enforcement could let a tier exceed paid limits on one surface.
**Proposed Action:** Define one authoritative tier/limit model (`Pricing_And_Tiers_Policy.md`); have all surfaces read it.
**Confidence:** Medium

### F-005 — GIS / lease-well logic is duplicated across services
**Type:** PATTERN
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** Lease/well location and nearby-development logic appears in `MViewPortalAPI` (`/gis`, PostGIS), `MviewMapAPI`, and `PresentationSiteAPI` (`getLeaseWellLocations`, `getnearbydevelopment`).
**Why It Matters:** Duplicated spatial logic can drift, giving different answers on the map vs. portal vs. public pages.
**Proposed Action:** Choose a single source for map/GIS; have others call it, or document the intended split.
**Confidence:** Medium

### F-006 — Internal "act-as" impersonation exists
**Type:** FACT
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** `act-as` / `act-as-login` endpoints, `internalActAsService`, and `db/migrations/mosynonym_actas.sql` allow internal operation as another user.
**Why It Matters:** A powerful support feature and a security/privacy risk if not tightly controlled and audited.
**Proposed Action:** Restrict to named roles, require audit logging, document the policy (Non-Negotiable #7, `Engineering_Standards.md`).
**Confidence:** High

### F-007 — Wide-open CORS on the portal API
**Type:** FACT
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** `MViewPortalAPI` mounts `app.use(cors())` with no origin restriction.
**Why It Matters:** Any origin can call the API from a browser, widening the attack surface.
**Proposed Action:** Restrict CORS to known Mineral View origins.
**Confidence:** High

### F-008 — Many MongoDB databases and multiple Postgres connections in use
**Type:** FACT
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** Config references up to 8 Mongo databases (`MONGO_DB_NAME_1..8`) and three Postgres connection strings, undocumented.
**Why It Matters:** The data topology isn't documented; onboarding, backups, and the dossier build all need to know what lives where.
**Proposed Action:** Document each Mongo DB's purpose and the Postgres connection roles in `_SYSTEM_MAP.md`.
**Confidence:** Medium

### F-009 — Monthly Owner Report generation is live and scheduled
**Type:** FACT
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** `MViewPortalAPI/api/v1.0/jobs/sendMonthlyReportEmails.js` plus `RUN_EMAIL_JOB_ON_START` config indicate a scheduled monthly owner-report email.
**Why It Matters:** This is the artifact the owner-intelligence effort centers on; its path must align with the dossier + corpus so report and chatbot agree.
**Proposed Action:** Confirm this job is the canonical Monthly Owner Report source; route it through the corpus playbooks.
**Confidence:** Medium

### F-010 — SEO landing-page / sitemap generation is a core growth surface
**Type:** INFERENCE
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** Extensive `sitemapFor…` endpoints and `(Marketing-State-Pages)` / `*.xml` routes generate operator, county, owner, production, and well pages.
**Why It Matters:** Likely the primary top-of-funnel; accuracy and the no-advice guardrails must hold on these pages.
**Proposed Action:** Document the SEO strategy and ensure generated pages respect the non-negotiables.
**Confidence:** Low

### F-011 — Platform stack is consistent and modern
**Type:** FACT
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** Node/TypeScript APIs, Next.js 15 site, Angular 16 admin, PG+PostGIS / Mongo / Redis, Braintree, ArcGIS, Cloudinary, OpenAI, on Windows/IIS with PM2.
**Why It Matters:** A clear, current stack supports the owner-intelligence build and onboarding.
**Proposed Action:** Record as the canonical stack in `_SYSTEM_MAP.md` and `Engineering_Standards.md`.
**Confidence:** High

### F-012 — A dedicated Mvestimate valuation microservice exists
**Type:** FACT
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** The portal calls a separate valuation service via `baseurlforMvestimate`; valuation/cashflow endpoints front it.
**Why It Matters:** Valuation is the single most sensitive number we show (Non-Negotiable #4). One service computing it is good; its methodology must be governed.
**Proposed Action:** Treat Mvestimate as the single valuation source; document its method in the valuation playbook with SME sign-off.
**Confidence:** Medium

### F-013 — OpenAI/ChatGPT is already integrated
**Type:** FACT
**Owner Scope:** org-wide
**Status:** PENDING
**Observation:** `Chat_GPT_KEY` appears in portal and presentation API config.
**Why It Matters:** There is already an AI surface; the owner-intelligence corpus and guardrails must govern whatever it produces.
**Proposed Action:** Confirm where ChatGPT is used and bring it under the corpus + non-negotiables.
**Confidence:** Medium
