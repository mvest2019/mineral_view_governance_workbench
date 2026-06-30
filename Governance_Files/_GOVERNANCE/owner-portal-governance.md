# Owner Portal Governance

> **Status:** ENHANCED (deep) · **Owner:** Product · **Reviewer:** Legal (claims) · **Final approver:** Ryan · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Companion:** `reporting-products-governance.md`, `mvestimate-governance.md`, `free-tier-and-upgrade-path-governance.md`, `pricing-and-plan-governance.md`, `feature-inventory-reference.md`.

---

## 1. Purpose & scope
Govern the **mineral-owner portal experience** end to end: claiming, the Owner Dossier, valuation, reports, activity, and the upgrade path. The owner audience is often non-expert and **scam-wary**, so the portal's job is to **educate and empower** — never to advise, pressure, or overstate. Every rule here serves that trust posture.

## 2. Owner workflows
Search → **claim** an owner record → **Owner Dossier** (lease/reservoir/well) → **MVestimate** + Cash Flow + reports → activity tracking → upgrade. Each step shows provenance and labels estimates.

## 3. Owner Dossier rules (MUST)
The dossier presents lease/reservoir/well structure with **provenance + vintage**. EUR = produced + remaining reserves ("next 6 years"). MVestimate is a modeled range (Down/Mean/High). All estimates labeled; **must not** be presented as audited financials.

## 4. Claim flow (confirmed copy)
Owner persona limits: Free = 1 claim, Pro = 2, Premium = 5. The claim-search modal carries the confirmed note that fixed the AND-filter "no results" confusion: *"You don't need to fill in every field. Enter any one to search, then add more only if you want to narrow your results. All fields are optional."*

## 5. Upgrade path & popups
Surface limits clearly; upgrade prompts match canonical pricing and **must not** use guaranteed-value language. Unclaimed-owner popups follow the **approved visit-wise sequence** — Visit 2 shows the full benefit showcase (Portfolio, lease cash flow, reserves, MVestimate, reservoir report, well report) — with **no escalating false urgency**, appropriate for a scam-skeptical audience.

## 6. Data education
Explain what each figure means and its source; link jargon to the glossary; empower the owner to decide (constitution P2 — no advice). Profile/settings live in the dashboard.

## 7. Good vs bad
| Good | Bad |
|---|---|
| "Your MVestimate is a modeled 6-year earnings range — here's how it's calculated." | "Your verified mineral value: $X." |
| "You've used your 1 free claim; Pro includes 2." | "Upgrade now or lose your record!" |

## 8. Portal QA checklist
☐ Provenance/vintage shown ☐ Estimates labeled ☐ Claim limits correct (1/2/5) ☐ Upgrade copy compliant ☐ Search note present ☐ Popup sequence compliant (no false urgency) ☐ Jargon glossary-linked ☐ No advice.

## 9. Anti-patterns
Dossier figures without provenance; guaranteed-value upgrade copy; escalating-urgency popups; "your record" language without a verifiable public-data basis; advice/steering.

## 10. Evidence notes & gaps
Dossier schema, claim limits, search-note copy, and the popup sequence are confirmed from screenshots + prior UX work.

---

## Deep context (2026-06-30) — owner-portal surfaces & rules

The **owner portal** is the mineral/royalty owner's home. Governed surfaces (grounded in the backend/frontend work summaries):

- **Claim Mineral Owner:** owner search → claim → verification → portfolio integration; enforces **subscription claim limits** (Free/Pro caps) and duplicate-claim rules; updates ownership visibility and claim status.
- **Dashboard & My Portfolio:** ownership records, decimal interest, lease associations; activity tracking by **lease / county / operator**; portfolio filters/sorting; **PDF download**.
- **Financials / cashflow:** financials APIs and MVestimate-based cashflow estimation (**labeled as an estimate**, P3).
- **Field reports:** Lease, Well, and Reservoir reports; the **Mineral Owner Report** is moving to **owner-centric** aggregation (consolidating production, activity, operator, and cashflow insight across all of an owner's leases).
- **Notifications & Agents:** alerts for W-1 permits, completions, production updates, and operator activity; My Agents / Create Agent.

**Rules (MUST):** show only what the owner is entitled to by tier and claim status; every figure is Texas-scoped (P1) with source + vintage (P4); estimates labeled (P3); ownership/financial data is access-controlled (no cross-owner leakage); the professional **Switch Owner / act-as-owner** path is authorization-checked and audited.
