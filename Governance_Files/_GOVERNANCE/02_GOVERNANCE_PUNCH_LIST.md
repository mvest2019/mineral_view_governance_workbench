# Open Questions & Evidence Gaps

> Status: NEW (living) · Owner: Nikhil Salunke · Final approver: Ryan Cochran · Last Updated: 2026-06-23
> Mirrors the existing priority-questions log. Items here block full adoption until resolved.

---

## 1. Purpose

A single, living register of everything the governance corpus could **not** confirm from evidence, plus the human decisions required to finalize prescriptive files. No file should "fill" these gaps by guessing.

## 2. Confirmation questions for Ryan (decisions, not files)

| ID | Question | Affected file(s) | Status |
|---|---|---|---|
| Q-A | **Mineral-Owner pricing reconciliation** — two batches showed different Owner figures. Confirm $49.99/$99.99 as canonical. | `pricing-and-plan-governance.md` | Open |
| Q-B | **Payment processor** — code shows Braintree; site/FAQ reference Wells Fargo Cybersource. Which is current? | `terms-billing-and-refund-governance.md`, `security-governance.md` | Open |
| Q-C | **Geographic-scope wording** — exact public phrasing for "Texas data, US education." | `texas-oil-and-gas-domain-governance.md`, `content-governance.md` | Open |
| Q-D | **Decline/probability parameters** — terminal-rate floor, young-well fallback vs type-curve, the 120-month model → 6-year MVestimate display mapping. | `decline-curve-methodology-governance.md`, `mvestimate-governance.md` | Open (SME) |
| Q-E | **Valuation nuance** — is MVestimate lease value or owner net share? Severance/royalty netting? Forward price-deck disclosure? | `mvestimate-governance.md` | Open (SME) |

## 3. Repo / data ambiguities

| ID | Item | Affected file(s) | Status |
|---|---|---|---|
| G-1 | Is `Mvestimate`/`mvestimateAPI` a distinct repo from Nikhil Salunke's "108" MVestimate notebooks, or the same? | `repo-inventory.md`, `mvestimate-governance.md` | Open |
| G-2 | Four overlapping Postgres price tables — confirm `oil_gas_history_future` canonical, scope/deprecate the rest. | `data-architecture-governance.md`, `pricing-and-plan-governance.md` | Open |
| G-3 | Are the `*_dec_2025` snapshot tables the intended bitemporal vintage mechanism? | `data-architecture-governance.md`, `rrc-data-governance.md` | Open |
| G-4 | "Postgres ×3" — exact database count/names/roles. | `database-source-inventory.md` | Open |
| G-5 | Is the in-DB `schema_mappings` drift-detection loop actively used? | `data-provenance-and-lineage-governance.md` | Open |

## 4. Corpus reconciliation

| ID | Item | Status |
|---|---|---|
| C-1 | The original 36 `_GOVERNANCE.zip` files were not re-read in the v2.0 build session (only summaries available). Every "ENHANCED" file must be reconciled against the original wording before adoption. | Open — **re-upload `_GOVERNANCE.zip`** |
| C-2 | Original wording of the constitution, non-negotiables, and the four logs must be preserved verbatim where it exists. | Open |

## 5. Security remediation (tracked here + in register)

| ID | Item | Severity |
|---|---|---|
| S-1 | Rotate all exposed secrets (Braintree, OpenAI, Mongo, Postgres, TLS) and purge from git history. | 🔴 |
| S-2 | Remove `dblink_config` plaintext credentials; exclude from exports. | 🔴 |
| S-3 | Re-key the 108 notebooks to a secret store. | 🔴 |

## 6. Resolution process

Each item is closed by: (a) a human decision recorded in the decision log, or (b) confirming evidence (re-uploaded file, code, screenshot). On closure, update the affected file, remove the gap marker, and note the resolution date here.

## 7. What humans must review before adoption

1. Reconcile every ENHANCED file against the original `_GOVERNANCE.zip` (C-1, C-2).
2. Resolve Q-A…Q-E with Ryan / DS SMEs.
3. Confirm the security remediations (S-1…S-3).
4. Legal review of all claim/disclaimer/pricing/legal files.
