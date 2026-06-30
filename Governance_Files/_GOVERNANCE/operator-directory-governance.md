# Operator Directory Governance ("Know Your Operators")

> **Status:** ENHANCED (deep) · **Owner:** DS SME/Product · **Reviewer:** Legal (steering) · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Source:** `Operator-Directory`, `All_Operator_Names_sanitized.xlsx`, `master_operators` (Postgres).

---

## 1. Purpose & scope
Govern the operator directory: data sourcing, name sanitization, benchmarking, and — critically — the **content guardrail** that keeps operator content factual rather than advice/steering.

## 2. Data sources
`master_operators` (28,599 rows) + the sanitized name map. Operator activity from RRC feeds; benchmarking from production/performance data.

## 3. Sanitization rules (MUST)
Operator names use the **sanitized mapping** (`All_Operator_Names_sanitized.xlsx`) for display consistency (RRC operator names are messy/duplicated). Document the mapping source and version.

## 4. Content guardrail (MUST)
Operator content (directory, benchmarking, "top producers") **must not** steer users toward leasing/selling with a specific operator or imply "better terms" — that crosses into advice (constitution P2). The phrase *"top producers… who might offer better lease terms"* was flagged in prior review as a steering risk and **must not** ship. Present **facts**, not recommendations.

## 5. User-facing rules
Show provenance + vintage; benchmarking is **comparative data, not an endorsement**.

## 6. QA checklist
☐ Sanitized names ☐ Provenance + vintage ☐ No steering/endorsement ☐ Benchmarking labeled comparative ☐ Mapping version noted.

## 7. Anti-patterns
"Better lease terms" steering; presenting benchmarking as an endorsement; raw unsanitized operator names; missing provenance.

## 8. Evidence notes & gaps
Confirmed from `Operator-Directory`, the sanitized xlsx, and `master_operators`. The steering-risk phrasing is a confirmed prior finding.

---

## Deep context (2026-06-30) — operator surfaces ("Know Your Operators")

Operator surfaces help owners and professionals understand **who operates their assets**. Governed components:

- **Operator listing:** searchable/filterable directory of operators (backed by the `Operator-Directory` repo and an operator-name **sanitization map** — `All_Operator_Names_sanitized.xlsx`).
- **Operator detail page:** operator profile with associated wells/leases, production, and activity.
- **Operator Hub analytics:** operator summaries, performance insight, and production analysis.

**Rules (MUST):** operator names are presented through the **sanitized canonical mapping** (raw RRC operator strings vary and must be normalized before display); figures are Texas-scoped (P1) with source + vintage (P4); operator-level production/activity is RRC-derived and inherits RRC's retroactive-restatement caveat (`rrc-data-governance.md`) — never imply real-time operator data the RRC pull does not support. Activity tracking by operator (permits/completions/production) feeds notifications and must use the same canonical operator identity.
