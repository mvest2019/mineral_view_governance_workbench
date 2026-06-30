# Privacy & Data-Use Governance

> **Status:** ENHANCED (deep) · **Owner:** Legal/Data · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on any data-handling change · **Source:** Privacy Policy + the 2026-06 PostgreSQL PII analysis. **Companion:** `security-governance.md`, `database-source-inventory.md`, `database-backup-and-archive-governance.md`, `county-pages-governance.md`.

---

## 1. Purpose & scope
Govern the handling of personal data across the platform — mineral-owner PII, account data, contact-form data, and analytics. The platform holds PII at **exceptional scale**, which makes privacy a first-class governance domain rather than a policy footnote. The PostgreSQL dump quantifies the exposure precisely, so the rules here are concrete, not aspirational.

## 2. PII inventory (high sensitivity, confirmed)
| Data | Where | Approx scale |
|---|---|---|
| Owner names + physical addresses | `mineralowner_2023` / `mineralowner_2024` | ~4.1M identities |
| Owner→property interest (RI + value) | `mineralownerproperty_2023` / `_2024` | ~9.7M rows |
| Owner sitemap | `mineralownersdetailsbbycountysitemap` | ~1.12M (governed surface) |
| Contact data | registration (phone **required** + validated), contact form | — |
| Account data | auth/session | — |

## 3. Handling rules (MUST)
- Encrypt PII at rest; restrict access; least privilege; no shared credentials.
- **Do not** expose bulk PII via public API or unencrypted backups, or place PII backups in shared/uploads/public storage (the 2026-06 backup is the cautionary example).
- Public surfaces serve only **governed, entitled, provenance-labeled** data; the owner sitemap is a curated surface, **not** a raw dump of names/addresses.
- Honor the Privacy Policy: COPPA/18+, data-use limits, user rights.
- **No PII** in logs, URLs, query strings, analytics keys/payloads, or AI prompts/outputs.

## 4. Retention & disposal
Define retention windows for PII (including backups) and a disposal schedule. **Not confirmed from the uploaded files** — Ryan/legal to set the policy; the year-partitioned owner tables (`_2023`, `_2024`) imply a vintage/retention model that should be formalized.

## 5. Public vs private boundary
Owner records may be claimed/served within a user's entitlement and tier; raw bulk owner PII is private. (Mirrors `security-governance.md` §7.)

## 6. Data-subject requests & breach
Define DSR and breach-response runbooks (`incident-and-rollback-governance.md`). Any PII exposure escalates to **Ryan immediately** and is treated as a security incident.

## 7. QA checklist
☐ PII encrypted ☐ Access least-privilege ☐ No public bulk PII ☐ Backups controlled/encrypted ☐ No PII in logs/URLs/analytics/prompts ☐ Retention defined ☐ COPPA/18+ honored ☐ Sitemap is governed (not a raw dump).

## 8. Anti-patterns
Bulk PII via public API; PII backups in shared storage; PII in logs/URLs/analytics; missing retention; blending owner-table years; treating the sitemap as a public dump.

## 9. Evidence notes & gaps
PII scale confirmed from the PostgreSQL dump; policy stance from the Privacy Policy. **Not confirmed from the uploaded files:** retention windows and DSR/breach runbooks (to be defined by Ryan/legal).

---

## Confirmed tracking activity (from team work, 2026-06)
The platform performs **user-behavior tracking** (built into backend services by Sanskriti):
capturing user **IP addresses**, page visits, engagement patterns, frequently viewed sections, and
activity trends; IP data is processed (Python) to derive **country-level** traffic insights.

Governance implications (MUST):
- IP addresses and behavioral data are **personal data** — handling follows this policy: store with
  access control, **never** expose per-user behavior/IP publicly or place it in logs/URLs/analytics
  keys, and disclose the tracking in the Privacy Policy (cookies/analytics consent where required).
- Aggregate (e.g. country-level) reporting is preferred for any shared/internal dashboards; raw
  per-user IP/behavior stays access-controlled.
- Confirm retention for behavioral/IP data (still to be set by Ryan/legal).
