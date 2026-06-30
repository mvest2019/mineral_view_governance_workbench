# News & Regulatory Feed Governance

> **Status:** ENHANCED (deep) · **Owner:** Content/Data · **Reviewer:** Legal (steering) · **Final approver:** Ryan · **Last Updated:** 2026-06-23
> **Review cadence:** Monthly (freshness) · **Source:** `Newsnew.xlsx` (11,638 records). **Companion:** `rrc-data-governance.md`, `content-governance.md`.

---

## 1. Purpose & scope
Govern the **RRC regulatory-activity feed** (the surface behind Activities/Materiality): sourcing, publishing, categorization, freshness, and the steering guardrail. With 11,638 records, the feed both confirms RRC as the dominant data source and creates a standing risk — regulatory facts are easy to accidentally editorialize into buy/sell/lease guidance.

## 2. Purpose & scale
Surfaces RRC regulatory activity (permits, completions, and related events) that drive the Activities and Materiality surfaces. 11,638 records confirm RRC dominance.

## 3. Source handling (MUST)
Records are RRC-derived and carry **provenance + vintage**. Failures/gaps are recorded via the scrape ledger (`rrc-data-governance.md`), never silently dropped. Derived figures are labeled estimates.

## 4. Filtering & categorization
Categorize by activity/event type (6 types) and materiality. **Must not** editorialize regulatory facts into advice or operator steering (guardrail flag, constitution P2). The feed reports **what happened**, not **what to do**.

## 5. User-facing rules
Explain the feed reports regulatory activity, not recommendations. An as-of date is shown. No steering, no "act now" framing on regulatory events.

## 6. Freshness
Update on the scrape cadence; expose the as-of date; stale feeds are a provenance defect.

## 7. QA checklist
☐ Provenance + vintage ☐ Categorized (type/materiality) ☐ No steering/advice ☐ Freshness/as-of shown ☐ Gaps handled (logged not dropped).

## 8. Anti-patterns
Editorializing regulatory events into buy/sell/lease guidance; operator steering; missing provenance; stale feed with no as-of date; dropping scrape gaps.

## 9. Evidence notes & gaps
Scale + RRC dominance confirmed from `Newsnew.xlsx`; the guardrail flag from prior review. Exact record schema is **Not confirmed from the uploaded files** verbatim.

---

## Deep context (2026-06-30) — news & regulatory content rules

The platform surfaces **industry news and regulatory updates** (and platform updates) to keep owners informed; content is prepared by the content team and must stay accurate and on-brand.

**Rules (MUST):**
- **Accuracy & sourcing:** regulatory/industry claims are sourced and dated; RRC-derived items inherit the **retroactive-restatement** caveat (`rrc-data-governance.md`) — never present a regulatory figure as more current than its source.
- **Texas scope (P1):** news framed around the platform's coverage stays Texas-scoped; broader US/industry context must not imply nationwide platform data.
- **No overstatement (P2) / no advice:** news is informational, not investment/legal advice (`Compliance_And_Disclaimers.md`); editorial separates **fact** (sourced) from **commentary**.
- **Editorial workflow:** news items pass the content QA/publish gate (`publishing-workflow.md`) and align to brand voice (`Customer_Communication_Style_Guide.md`); corrections are issued promptly and visibly.
- **Automation caveat:** where trending-content automation (e.g. Trendelier) proposes items, a **human review step** is mandatory before anything publishes.
