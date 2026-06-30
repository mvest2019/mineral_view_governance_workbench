# Backend API Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Final approver:** Ryan (security) · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on endpoint/auth change · **Covers:** `MViewPortalAPI`, `MviewMapAPI`, `PresentationSiteAPI` · **Companion:** `security-governance.md`, `map-gis-governance.md`, `pricing-and-plan-governance.md`.

---

## 1. Purpose & scope
Govern API **responsibilities, access control, tier enforcement, error handling, logging, configuration, and security** for the platform backends. These APIs are the gate between the public and millions of PII rows plus payment flows, so the rules lean hard on authz and the public/private boundary.

## 2. Responsibility boundaries
| API | Owns | Must not |
|---|---|---|
| `MViewPortalAPI` | Owner/professional data access; tier gating (`featureAccess`/`SUBSCRIPTION_PLAN_MAP`); monthly report job (`sendMonthlyReportEmails.js`); cashflow/decline endpoints | Serve bulk PII; duplicate tier logic |
| `MviewMapAPI` | Spatial queries; GeoJSON layers; tier-gated map data | Return non-Texas data |
| `PresentationSiteAPI` | Payments; data packages; act-as impersonation; site data | Allow unlogged impersonation |

## 3. Tier enforcement (MUST)
Access checks **must** read the single `SUBSCRIPTION_PLAN_MAP`/`featureAccess` source and enforce **persona × tier** limits matching `pricing-and-plan-governance.md`. Hardcoding duplicate limits is prohibited — it causes the page/code drift that this governance forbids.

## 4. Auth & authorization
- Authenticate + authorize per persona/tier on every protected endpoint.
- **act-as impersonation** restricted to authorized internal users; **logged**; **time-bounded**.
- **CORS** restricted to known origins (open CORS is a finding).
- Admin endpoints never publicly routable.

## 5. Data access rules
Respect the public/private boundary (`security-governance.md`): never expose bulk PII or credentials. Serve estimates with provenance + vintage. Read raw facts from Postgres; serve analytics from Mongo; never let Mongo override a Postgres fact.

## 6. Error handling & logging
Return **safe** errors (no stack traces/secrets/PII to clients); log server-side; **never log PII or secrets or put them in URLs**. Guard analytics endpoints against empty series (ARPS guard) so a sparse lease doesn't 500.

## 7. Configuration & secrets
All secrets via env/secret store. **Must not** read credentials from `dblink_config` plaintext or hardcoded values (F-DB-014, F-DS-015). Config differs per environment; staging must not point at prod PII without controls.

## 8. Backend QA checklist
☐ Auth + tier checks ☐ CORS restricted ☐ No secrets/PII in responses, logs, or URLs ☐ Safe errors ☐ Tier reads single source ☐ Provenance on served data ☐ ARPS-guarded analytics ☐ Rate limiting where applicable ☐ Impersonation logged.

## 9. Anti-patterns
Duplicated tier limits; PII in logs; open CORS; unlogged impersonation; serving Mongo as source of truth; leaking stack traces; reading `dblink_config`.

## 10. Evidence notes & gaps
`featureAccess`/`SUBSCRIPTION_PLAN_MAP`, `sendMonthlyReportEmails.js`, act-as, open CORS confirmed from repo review. **Not confirmed from the uploaded files:** rate-limit configuration, full endpoint inventory (see optional `api-endpoint-inventory.md`).

---

## Deep context (2026-06-30) — stack, API domains, and contracts

**Stack.** Node.js + Express + REST; **PostgreSQL** (system of record), **MongoDB** (serving layer), **Redis** (cache); deployed via PM2 / IIS on Windows Server. Python services support analytics/reporting and data engineering. GitHub org `mvest2019`.

**API domains.** Lease management; mineral-owner management and **Claim Owner / Claim Lease**; dashboards & **My Portfolio**; **financials / cashflow**; field & owner **reporting**; **notifications / agents**; **Operator Hub**; **Data Coverage** (mineral-owners + production data); **subscriptions & payments** and the subscription **scheduler/automation**; authentication & user management; newsletter/engagement; data-download (lease + well production); the **Community** backend; and **Cerebro** (internal) reporting/integration APIs.

**Contracts & rules (MUST).**
- **Source of truth:** Postgres is authoritative; Mongo is derived and never overrides a Postgres value. Served figures carry source + vintage (P4); estimates are flagged (P3).
- **Access control:** enforce tier/feature gates server-side (`SUBSCRIPTION_PLAN_MAP` / `featureAccess`) and **claim limits**; the professional **act-as-owner** path must be authorization-checked (see `security-governance.md` — act-as impersonation was a finding).
- **Security:** no secrets in code (committed keys were findings F-001…F-013); least-privilege CORS; **API rate limiting** on public/data-coverage endpoints; input validation on all write paths.
- **Performance:** index and tune hot queries; use Redis for repeat reads; profile Postgres/Mongo and keep response times within target. Large datasets (millions of rows) use pagination/aggregation, not full scans.
- **Reliability:** scheduled jobs (monthly reports, subscription automation, scrapers) are monitored; failures alert and are retried/recovered, not silently dropped.
