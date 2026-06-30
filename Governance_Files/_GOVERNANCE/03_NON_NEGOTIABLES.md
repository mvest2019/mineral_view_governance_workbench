# Mineral View — Non-Negotiables

> Status: ENHANCED · Owner: Ryan Cochran · Maintainer: Nikhil Salunke · Last Updated: 2026-06-23
> The binding non-negotiables (P1–P8). Full context in MineralView_Operating_Constitution.md.

## The Non-Negotiables (P1–P8)

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

