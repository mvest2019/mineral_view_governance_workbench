# Admin & Cerebro Governance (Mview-Cerebro-web)

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on permission/workflow change · **Companion:** `security-governance.md`, `privacy-and-data-use-governance.md`.

---

## 1. Purpose & scope
Govern the internal Cerebro admin web: who may use it, what it may edit, and the audit/access controls required. Because admin tooling can touch PII and production data directly, it carries the strictest access and audit rules.

## 2. Purpose & users
Internal-only operations/data-management tool. Users are **trusted internal staff only** — never public, never customer-reachable.

## 3. Data-editing rules (MUST)
Edits to production data are **logged** (who/what/when), reversible where feasible, and **must not** bypass provenance/vintage rules. Bulk edits to PII or pricing-affecting data require approval (Nikhil → Ryan for pricing/claims).

## 4. Access control (MUST)
Role-based access; least privilege; no shared admin credentials. Elevated operations (data deletion, impersonation, bulk export) require elevated rights and are logged. Admin is **never** publicly routable.

## 5. Audit & logging
All admin actions auditable. PII exports access-controlled and encrypted; **never** to shared/uploads. Impersonation (act-as) restricted, logged, time-bounded.

## 6. Admin UX rules
Confirm destructive actions (in-app modal, not browser confirm); show provenance/vintage context on data screens; surface validation errors clearly.

## 7. Internal-tool QA checklist
☐ Auth + roles enforced ☐ Actions logged ☐ Destructive actions confirmed ☐ No PII in logs ☐ Exports controlled + encrypted ☐ No public exposure ☐ Impersonation logged/time-bounded.

## 8. Anti-patterns
Shared admin logins; unlogged bulk edits/exports; public exposure of an admin route; PII export to shared storage; silent impersonation.

## 9. Evidence notes & gaps
Cerebro confirmed as the internal admin repo. **Not confirmed from the uploaded files:** specific screens, permission model, and current audit-log coverage.

---

## Deep context (2026-06-30) — Cerebro (internal admin)

**Mineral View Cerebro** is the **internal** full-stack admin/reporting tool (`Mview-Cerebro-web`), built and maintained by the backend team. It provides data-integration and reporting APIs and internal user-experience tooling used by staff — not a customer surface.

**Rules (MUST):**
- **Internal-only & access-controlled:** Cerebro is staff-only behind authentication and role checks; it is never exposed to owners/professionals; **act-as / impersonation** capabilities are authorization-checked and **audited** (impersonation was a prior security finding).
- **Sensitive data:** Cerebro can reach owner/financial/ownership data — least-privilege access, no secrets in code, and full audit logging on privileged actions (`security-governance.md`, `privacy-and-data-use-governance.md`).
- **Read-vs-write:** internal reporting reads the system of record; any write/correction path follows change management and preserves provenance/vintage.
- **Change control:** Cerebro changes follow the standard QA + deploy gates; privileged-feature changes are Ryan-aware.
