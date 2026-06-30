# MVestimate Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Reviewer:** DS SME (Christos Batsios / Gabor Korosi) · **Final approver:** Ryan Cochran
> **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly + on any methodology change · **Change class:** Major (claim + methodology)
> **Source:** Nikhil Salunke's "108" MVestimate repo (`Mvestimates_cashflow_Producing.ipynb`), `Presentation_FAQs.xlsx`, product screenshots. **Companion:** `decline-curve-methodology-governance.md`, `data-architecture-governance.md`, `data-provenance-and-lineage-governance.md`, `legal-compliance-and-claims-governance.md`.

---

## 1. Purpose & scope
Govern how **MVestimate** — the platform's flagship valuation number — is **computed, sourced, described, disclaimed, and changed**. MVestimate is the single highest-stakes output on the platform: it attaches a dollar figure to a real person's mineral interest, updates daily, and is built on two volatile inputs (a forward price deck and a decline forecast). That makes it simultaneously a **claim** (constitution P3), a **methodology artifact** (constitution change-rule §7), and a **conversion driver**. Every rule here exists to keep it honest under all three pressures.

**In scope:** the calculation inputs and chain, the canonical data sources, the user-facing presentation/disclaimers, and the approval path for any change. **Out of scope:** the decline fit itself (`decline-curve-methodology-governance.md`) and the price-table SSOT cleanup (`data-architecture-governance.md`).

## 2. What MVestimate is — and is not
| MVestimate **is** | MVestimate **is not** |
|---|---|
| A **modeled estimate** of **projected six-year earnings** for a mineral interest | An audited or guaranteed value |
| Updated **daily** (shows a delta vs the prior day) | A current market or sale price |
| Built from RRC production + decline forecast + a forward price deck | Financial, tax, or investment advice |
| Expressed across **scenarios** (Mean / Down / High) | A single precise certainty |

Copy **must** preserve the "projected six-year earnings" framing and the estimate/limitation labeling (constitution P3). The portal label is "Projected six-year earnings."

## 3. Methodology (as implemented in `Mvestimates_cashflow_Producing.ipynb`)
The computation chain the governance protects:
1. **Net volume** — start from actual RRC lease-cycle production; where the horizon extends beyond actuals, **forecast with the governed decline model** (`decline-curve-methodology-governance.md`). The production input has already passed the zero/gap/vintage rules (`rrc-data-governance.md`).
2. **Price deck** — multiply net volume by the **forward monthly price deck** `oil_gas_history_future` (the canonical PostgreSQL price table, 1990→2026, oil + gas).
3. **Scenarios** — produce **Mean / Down / High** cases.
4. **Aggregate** — sum the monthly cashflow over the horizon.
5. **Daily delta** — recompute daily and surface the change vs the prior day.

**EUR relationship:** EUR is shown as **produced + remaining reserves** over a "next 6 years" window, consistent across portal, field/well reports, and FAQ.

## 4. Source-of-truth (MUST)
| Input | Canonical source | Rule |
|---|---|---|
| Production | RRC lease-cycle (`og_lease_cycle_production`) | Vintage-correct; gap vs true-zero respected |
| Decline forecast | the governed decline methodology | ARPS-guarded; SME-reviewed; validated |
| Prices | `oil_gas_history_future` **only** | The other three price tables (`oilgaspricing`, `oilgashistorydata`, `oilgasfuturepricingdata`) **must not** feed MVestimate |
| Owner share | (open — Q-E) | Confirm whether decimal/owner net interest is applied |

## 5. Description & disclaimer rules
- Copy **must** call it an estimate, state the **6-year** window, name the inputs (production, decline, prices), label the scenarios, and show vintage.
- Copy **must not** imply audited reserves, a guaranteed value, a sale price, or advice.
- Demo/illustrative figures (e.g., a portal MVestimate of $131M, Brent $95.33) are **not** canonical facts and **must not** be cited as real outputs.

## 6. Open methodology questions (Ryan / DS SME) — Q-E
These are **not confirmed** and **must not** be asserted in copy as if settled:
1. **Lease value vs owner net share** — does the calc apply the owner's decimal/net interest, or report gross lease value? (Decimal interest is not visibly applied in the calc.)
2. **Severance/royalty netting** — are severance taxes and royalty burdens netted out?
3. **Forward price-deck disclosure** — how is the forward deck described to users?
4. **Display mapping** — how does the underlying ~120-month model map to the 6-year MVestimate display? (Shared with decline Q-D.)
Until resolved, descriptions **must not** assert net-of-tax or owner-net precision the implementation doesn't guarantee. Tracked in `open-questions-and-evidence-gaps.md` (Q-E).

## 7. User-facing explanation pattern (recommended, grounded)
> "MVestimate projects six-year earnings for this interest from RRC production, a decline forecast, and a forward oil-and-gas price deck, shown as a range (Down / Mean / High). It is a modeled estimate — not a guaranteed value, sale price, or advice — and it updates daily. Source: Texas RRC; as of <vintage>."

## 8. Good vs bad copy
| Good | Bad |
|---|---|
| "Estimated six-year earnings range: $X–$Z (modeled)." | "Your minerals are worth $Y." |
| "Based on a forward price deck; prices change, so estimates change." | "Guaranteed value, updated live." |
| "Source: Texas RRC, as of June 2026." | (no source, no vintage) |

## 9. Change control
Any change to MVestimate's method, inputs, or presentation is a **Major** change: the DS SME reviews the method, Nikhil (the repo owner) reviews the data path, Legal reviews the claim, **Ryan approves**, and the change is logged. The description **must** be updated in lockstep with the implementation so they never diverge (constitution change-rule §7).

## 10. QA checklist
☐ Reads the canonical price deck (`oil_gas_history_future`) only ☐ Decline input ARPS-guarded + validated ☐ 6-year window stated ☐ Scenarios (Down/Mean/High) labeled ☐ Estimate + limitations labeled ☐ Vintage shown ☐ No guaranteed-value/sale-price language ☐ Net-share treatment confirmed or hedged (Q-E) ☐ No demo figure cited as real.

## 11. Anti-patterns
Reading a non-canonical price table; presenting a single precise value instead of a range; dropping the estimate label or vintage; asserting net-of-tax/owner-net precision (Q-E); citing demo figures as real outputs.

## 12. Evidence notes & gaps
The chain (net volume × `oil_gas_history_future` deck, Mean/Down/High, daily delta) is confirmed from `Mvestimates_cashflow_Producing.ipynb` plus portal/FAQ labels; the canonical price deck is confirmed from the PostgreSQL dump. **Not confirmed from the uploaded files:** owner-net-share treatment, severance/royalty netting, and the exact 120-month→6-year mapping (all Q-E — SME decisions required).
