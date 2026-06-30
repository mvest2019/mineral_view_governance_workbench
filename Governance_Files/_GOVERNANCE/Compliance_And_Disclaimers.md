# Legal, Compliance & Claims Governance

> **Status:** ENHANCED (deep) · **Owner:** Legal/Product · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on any legal/claim change · **Change class:** Major (legal review required)
> **Source:** Terms & Conditions, Privacy Policy. **Companion:** `claim-risk-register.md`, `privacy-and-data-use-governance.md`, `terms-billing-and-refund-governance.md`, `mvestimate-governance.md`.
> **This file does not provide legal advice; qualified legal review is required for sensitive language.**

---

## 1. Purpose & scope
Govern **legal entity naming, disclaimers, and the claim-review process** for all product/marketing copy. This is the highest-stakes governance domain: a wrong claim about value, coverage, or compliance is a legal exposure, not a copy nit. The `claim-risk-register.md` is the operational companion that classifies specific claim types.

## 2. Legal entity (MUST)
Binding legal entity: **Mineral View, LLC** — used exactly in legal contexts. Public brand: "Mineral View."

## 3. Required disclaimers
No advice (financial/legal/tax/investment/drilling), no-reliance, AI/chatbot, as-is. Every estimate-bearing or decision-adjacent surface carries the appropriate disclaimer (constitution P2, P3). Disclaimers **must not** be weakened or removed by any contributor or AI agent.

## 4. Binding terms (override marketing copy)
Billing/refund rules; arbitration under Texas law (Austin); liability cap; COPPA/18+; DMCA. Changes require legal review + Ryan. Public copy **must not** contradict the Terms.

## 5. Claim risk levels (see `claim-risk-register.md` for the full register)
| Level | Examples | Required review |
|---|---|---|
| Low | Glossary definition; neutral education | Content |
| Medium | Feature description; methodology summary | Product + DS SME |
| High | Value/accuracy/savings/coverage claim; legal statement; pricing | Legal + **Ryan** |

## 6. Prohibited claims
Guaranteed value/returns; exact/audited reserves; nationwide coverage; advice to lease/sell/sign; unverifiable performance claims; tax-savings guidance; operator steering.

## 7. Workflow
Draft → classify (`claim-risk-register.md`) → route reviewers → **Legal for High** → **Ryan approval** → publish → log in the decision log. AI may draft but **must not** finalize legal language (`ai-agent-instructions.md`).

## 8. Open conflict — payment processor (Q-B)
Code shows **Braintree** (`MERCHENT_ID`); the site/FAQ reference **Wells Fargo Cybersource**. Resolve before any billing-language change (`terms-billing-and-refund-governance.md`).

## 9. QA checklist
☐ Entity name correct ☐ Disclaimers present + not weakened ☐ Risk classified ☐ Legal-reviewed if High ☐ Ryan-approved if High ☐ No prohibited claims ☐ Processor accurate ☐ Logged.

## 10. Anti-patterns
Guaranteed-value/returns; nationwide implication; advice/steering; marketing that contradicts the Terms; weakening a disclaimer; finalizing legal text via AI.

## 11. Evidence notes & gaps
Confirmed from Terms/Privacy. **Qualified legal review by counsel is required before adoption.** Processor conflict open (Q-B).

---

## Deep context (2026-06-30) — the disclaimer perimeter

Mineral View sells **information and estimates**, not advice — the disclaimer perimeter protects owners and the company.

**Mandatory disclaimers (MUST appear where relevant):**
- **Not advice:** content/reports/estimates are **informational only**, not investment, legal, tax, or financial advice; owners should consult professionals for decisions.
- **Estimates (P3):** EUR, decline, BOE/month, cashflow, and valuations are **estimates** with uncertainty — not guaranteed outcomes; past production does not guarantee future results.
- **Data source & vintage (P4):** figures are derived from **Texas RRC** data at a stated **vintage**; RRC **restates history**, so values can change between pulls.
- **Scope (P1):** coverage is **Texas-only**; absence of data is not proof a well/lease doesn't exist.
- **No representation of completeness (P2):** the platform does not warrant that all of a user's minerals are shown.

**Rules:** disclaimers are surfaced on reports, estimate displays, county/feature pages, and marketing making any data claim; claim-making content is **legal-reviewed** before publish; disclaimers are kept consistent (single canonical wording reused, not re-invented per page).
