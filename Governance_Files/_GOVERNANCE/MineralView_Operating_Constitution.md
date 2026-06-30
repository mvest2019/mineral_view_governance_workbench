# Governance Constitution

> **Status:** ENHANCED (deep) · **Owner:** Ryan Cochran (final authority) · **Maintainer:** Nikhil Salunke
> **Last Updated:** 2026-06-23 · **Review cadence:** Annual + trigger-based · **Change class:** Constitutional (Ryan approval required)
> **Builds on:** existing `_GOVERNANCE` constitution, non-negotiables, and the four logs. History is append-only.

---

## 1. Purpose & authority

This constitution is the **highest internal governance authority** for the Mineral View website and platform. In the source-of-truth hierarchy it sits at **rank 2** — above all code, data, screenshots, content, and inferred recommendations, and below only binding external legal/compliance documents (the Terms & Conditions and Privacy Policy at rank 1).

Its job is to encode the small number of commitments that **must hold true across every surface and every change**, no matter who (or what AI agent) is making the change. Where any other governance file, code comment, content guide, screenshot, or AI instruction conflicts with this document, **this document wins** until it is amended through the process in §10.

Why a constitution rather than just policies: Mineral View publishes **modeled financial estimates** about **real people's mineral assets**, sourced from **public regulatory data that changes retroactively**. That combination creates standing risks — overstated value claims, stale or false-zero data, advice-like language, PII exposure, and embellished heritage — that no single team owns. The constitution makes those risks everyone's hard constraint.

## 2. Scope of constitutional authority

| In scope | Out of scope |
|---|---|
| Every public claim about data, value, accuracy, or coverage | BOLD Precious Metals (sibling Cochran business; footer cross-link only) |
| All data methodology descriptions (MVestimate, decline, allocation, EUR, acre/well) | Non-Texas data products (none exist; Texas is canonical) |
| Legal/compliance-sensitive language | Internal experiments that never reach a user or a public surface |
| Pricing and plan representations | — |
| Handling of personal data and secrets | — |
| AI-generated contributions to any surface | — |

## 3. Constitutional principles (the non-negotiables)

Each principle below is a **MUST**. Each carries its rationale, its operational rule, the evidence it rests on, and the most common violation to watch for.

### P1 — Texas is the canonical data scope
- **Rule:** Product data describes **Texas** oil-and-gas, sourced from the Texas Railroad Commission (RRC) plus Texas GIS/appraisal sources. Educational/marketing content covering the broader US is allowed **only** as education and **must not** imply nationwide data coverage.
- **Why:** The data pipeline, map, and API are Texas-only. Implying national coverage is a false capability claim.
- **Evidence:** Public map renders RRC Districts 1–10 (incl. 7B/7C/8A); API-42 (Texas) prefix; hero copy "across Texas"; Postgres `scrapy_data` is RRC.
- **Watch for:** Blog posts written for US-wide SEO that read as if the *data* is national. Fix: add a Texas-scope line; keep US framing educational.

### P2 — We provide data, not advice
- **Rule:** Mineral View provides data, reports, and modeled estimates. It does **not** provide financial, legal, tax, investment, or drilling advice. Any surface that could be read as a recommendation **must** carry a no-reliance disclaimer and **must not** instruct a user to lease, sell, sign, or transact.
- **Why:** Advice creates liability and betrays the "empowerment, not direction" brand value.
- **Evidence:** Terms disclaimers (no-advice, no-reliance, AI/chatbot, as-is); `Blog.xlsx` findings flagged "lease-vs-sell" framing and a community post ("don't sign the first lease the landman brings you") needing moderation.
- **Watch for:** "You should…", "best time to sell", tax-savings specifics, operator "better terms" steering. Fix: convert to neutral education + "verify independently; not advice."

### P3 — Estimates are clearly modeled, never actuals
- **Rule:** MVestimate (projected six-year earnings), EUR (produced + remaining reserves), decline forecasts, and acre/well percentiles are **modeled outputs**. They **must** be labeled as estimates with stated assumptions/limitations and **must not** be presented as guaranteed, audited, or actual values.
- **Why:** These are forecasts built on volatile prices and retroactive data; presenting them as fact is the single highest claim risk.
- **Evidence:** Portal label "Projected six-year earnings"; FAQ methodology (Arps decline, allocation, EUR/acre gridding); 108 cashflow notebook (price-deck × net volume, scenario outputs).
- **Watch for:** "worth exactly $X", "guaranteed", removing the scenario/range framing. Fix: keep the estimate label, the window (6 years), and the range/scenarios.

### P4 — Provenance and vintage are preserved end-to-end
- **Rule:** Every customer-facing figure **must** be traceable to its source (RRC / GIS / appraisal / model) and its vintage (pull date). The platform **must** distinguish a true zero from a not-yet-reported gap.
- **Why:** RRC rewrites history between pulls; without vintage discipline, real production silently "disappears" and crashes decline fitting.
- **Evidence:** `prod_report` flag in `og_lease_cycle_production`; `*_dec_2025` vintage snapshots; in-DB `schema_mappings` drift table; the bitemporal analysis (`vintage_date` vs `cycle_year_month`; 82% zero rows; flag Y vs N).
- **Watch for:** Rendering `flag=N` zeros as "production ended"; mixing vintages in one report without labels.

### P5 — Legal text and the legal entity name are authoritative
- **Rule:** The binding legal entity is **Mineral View, LLC**. Terms, Privacy Policy, arbitration (Texas law / Austin), liability cap, COPPA/18+, and DMCA override all other copy. Public copy **must not** contradict the Terms.
- **Why:** Marketing drift away from the Terms creates enforceable inconsistencies.
- **Evidence:** Terms & Conditions + Privacy Policy.
- **Watch for:** Refund/guarantee language not in the Terms; payment-processor claims (Braintree-in-code vs Cybersource-on-site conflict, Q-B).

### P6 — Customer data and secrets are protected
- **Rule:** Personal data (owner names/addresses, contact, account data) **must** be handled per the Privacy Policy. Credentials, API keys, TLS keys, and tokens **must never** appear in code, exports, public surfaces, or governance files.
- **Why:** The platform holds ~4.1M owner identities and ~9.7M property rows; exposure is a serious privacy and security event.
- **Evidence:** Postgres mineral-owner tables (PII at scale); findings F-001…F-013 (committed secrets), F-DB-014 (`dblink_config` plaintext credentials), F-DS-015 (108-notebook secrets).
- **Watch for:** PII in logs/URLs, bulk PII via public API, backups with credentials placed in shared storage.

### P7 — Heritage claims stay truthful
- **Rule:** The brand heritage (family-owned, the Cochran family, 75+ years in Texas oil & gas, 6th-generation Texans, founder Ryan Cochran) **must** be used accurately and **must not** be embellished. The three values are **Transparency, Empowerment, Legacy**.
- **Why:** Heritage is a core trust asset; inflation undermines it.
- **Evidence:** "Our Story."
- **Watch for:** Implying the software/data is 75 years old, or inflating generations/years.

### P8 — AI contributions are assistive and bounded
- **Rule:** AI agents may draft, analyze, and propose, but **must not**: invent facts, present assumptions as facts, alter the excluded old-doc pricing content, expose secrets/PII, weaken disclaimers, or finalize legal/compliance language without human review.
- **Why:** AI confidently fills gaps; in this domain a confident wrong number is a claim risk.
- **Evidence:** `ai-agent-instructions.md`.
- **Watch for:** Plausible-but-unsourced figures; softened hedging; "cleaned up" disclaimers.

## 4. Rules for changing governance files
- Governance changes **must** cite evidence and route through `change-management-governance.md`.
- Constitutional changes require **Ryan's explicit approval** and a decision-log entry (§10).
- The four logs (findings, priority questions, decision log, security register) are **append-only**; entries are superseded, never deleted.
- A file may be reorganized but its content and history **must** be preserved under the new path.

## 5. Rules for changing public website content
- Any change touching a **claim, statistic, methodology description, legal statement, or pricing figure** runs the full review chain (`master-governance-architecture.md` §6) and ends at Ryan.
- Non-claim copy/SEO edits follow `content-governance.md` and need content-lead sign-off only.
- Every published change updates page metadata and is recorded per `publishing-workflow.md`.

## 6. Rules for changing product claims
A "product claim" is any statement about what the platform measures, predicts, or guarantees. Changes **must** be backed by code/data evidence, carry appropriate hedging, and pass `legal-compliance-and-claims-governance.md` review. Prohibited: "guaranteed value", "exact/audited reserves", "nationwide", advice to transact.

## 7. Rules for changing data-methodology descriptions
Descriptions of MVestimate, decline, allocation, acre/well, or EUR **must** match the actual implementation in the analytics repos and be reviewed by a DS SME (Christos Batsios / Gabor Korosi). If implementation and description diverge, the **description is corrected or the divergence logged** — the description **must not** overstate precision.

## 8. Rules for legal/compliance-sensitive language
Disclaimers, arbitration, refund, privacy, COPPA, DMCA, and claims **must** be reviewed by qualified legal counsel before publishing. Governance files and AI agents **must not** provide legal advice or invent legal terms. When uncertain, mark `Requires legal review`.

## 9. Rules for AI-generated contributions
Binding summary (full detail in `ai-agent-instructions.md`): canonical sources only; never invent; write `Not confirmed from the uploaded files.` when evidence is missing; never modify excluded pricing content; never expose secrets/PII; preserve brand voice; defer legal/methodology finalization to humans.

## 10. Amendment process
1. Propose the amendment with rationale and evidence.
2. Maintainer + relevant domain lead review.
3. **Ryan Cochran approves** (required for any constitutional change).
4. Record in the decision log with date, rationale, and the superseded text.
5. Update dependent governance files and this document's `Last Updated` line.

## 11. Enforcement & precedence quick-reference
| Situation | Resolution |
|---|---|
| Screenshot contradicts Terms | Terms win (rank 1); log the conflict |
| Code contradicts this constitution | Constitution wins; fix code or log exception |
| Two same-rank sources disagree | Newer confirmed vintage wins; log as confirmation question |
| AI proposes an unsourced fact | Reject; require `Not confirmed from the uploaded files.` |

## 12. Evidence notes & gaps
Principles P1–P8 are grounded in confirmed inputs (Terms/Privacy, "Our Story", product screenshots, code, Postgres schema, methodology repos). The **exact original constitutional wording** from `_GOVERNANCE.zip` was not re-read in the v2.0 build session and **must be reconciled** against this enhanced version before adoption (tracked as C-1 in `open-questions-and-evidence-gaps.md`).
