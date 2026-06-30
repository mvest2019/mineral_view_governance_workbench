# Mineral View — Playbook: Revenue & Royalty Mechanics

Status: ENHANCED (v0.2 — preserves v0.1 method; some rates/handling still need SME confirmation)
Owner: Ryan Cochran (final authority) · Reviewer: DS SME (Christos Batsios / Gabor Korosi) · Maintainer: Nikhil Salunke
Last Updated: 2026-06-23
Applies To: Mineral View only

How production becomes the actual royalty check, and why checks move month to month. The most
owner-facing math playbook, so its honesty discipline (exact-vs-estimated separation + income
disclaimer) is strict.

## 1. Purpose & scope
Govern the computation, explanation, and disclaiming of an owner's **net royalty check** and its
6-month trajectory. In scope: the production→check chain, the data layers behind each term, why
checks move, guardrails. Out of scope: the decline forecast (`Playbook_Decline_And_Forecast.md`),
realized-price modeling and valuation roll-up (`Playbook_Pricing_And_Realization.md`).

## 2. The chain (production → check)
```
production volume (per product, per well)
   × realized price (Pricing playbook)
   = gross value
   × owner decimal interest
   = owner gross
   − post-production deductions (e.g. gas processing/gathering)
   − severance taxes (oil ~4.6%, gas ~7.5% — confirm current rates)
   = NET CHECK
```
Worked example (enriched sample dossier; synthetic): owner gross $6,080.16 − gas post-production
(25% of gas) − oil severance (4.6%) − gas severance (7.5%) = **$5,729.06 net**.

| Term | Source layer | Authority | Rule |
|---|---|---|---|
| Production volume | actual (RRC) or derived (decline) | public / Layer 2 | Use actuals where present; model only the gap; respect gap-vs-true-zero |
| Realized price | owner stub or modeled | Layer 1 / 2 | Stub price → exact; else modeled via deck `oil_gas_history_future` |
| Owner decimal interest | division order / stub | Layer 1 (authoritative) | From owner docs → multiplier is **exact** |
| Post-production deductions | lease / stub | Layer 1 | Per lease; gas side most affected |
| Severance taxes | statute | public | Oil ~4.6%, gas ~7.5% — **confirm current rates** |

## 3. Inputs (data layers)
- **Layer 1 (owner):** decimal interest (division order/stub — authoritative), realized prices
  (stub), deduction rate (lease/stub), suspense status.
- **Layer 2 (derived):** modeled volumes (decline), modeled prices where actuals are absent.
- **Backed in DB by:** `update_dispvol_cashflow`; the `cash-flow` / `getWellReportCashflow` /
  `getleaseCashflowChart` endpoints; production from `og_lease_cycle_production`, disposition from
  `og_lease_cycle_disposition` (53 disposition-code columns).

## 4. Why checks move (explain to owners)
- A **new well** produces a lot early, then tapers (Decline playbook).
- **Prices** change (shown as a lever, never predicted — Market & World Context).
- **Deductions** (post-production costs) reduce the gas side.
- **Operator timing** (reporting/payment) and **suspense** can shift a check.
- **Retroactive RRC corrections** can restate a prior month between pulls; bitemporal handling
  keeps prior real production from vanishing (`rrc-data-governance.md`).

## 5. Guardrails
- When decimal, deductions, and prices come from the owner's own documents, the **dollar math is
  exact** — say so, and confine remaining uncertainty to volumes and prices.
- Estimate, not a guarantee (Non-Negotiable #3); attach the income disclaimer.
- Severance/deduction specifics must reflect the lease and current law. _(confirm rates.)_
- No single precise number for a forecasted check without a range + confidence.

## 6. Outputs
Net-check figure + term-by-term breakdown; the 6-month income trajectory (with Decline + Pricing);
feeds the Monthly Report "Your income" and the Answer-Routing "Will my check stay steady?" recipe.

## 7. Good vs bad framing
| Good | Bad |
|---|---|
| "Your decimal and deductions are from your division order, so the dollar math is exact; the 6-month number is a modeled range." | "Your check will be $5,729 next month." |
| "If oil slipped from ~$70 to ~$60, your check would be ~12–14% lighter on price alone." | "Oil is going to fall, so expect a smaller check." |

## 8. Anti-patterns
Forecasted check shown as guaranteed; hiding severance/deductions; mixing exact and modeled terms
without labeling; predicting prices; ignoring suspense/operator-timing as reasons a check moved.

## 9. QA checklist
☐ Each chain term sourced + labeled exact-vs-modeled ☐ Owner-doc decimal treated as exact ☐
Severance/deduction per lease + current law (confirmed) ☐ Range + confidence on any forecast ☐
Income disclaimer ☐ Gap-vs-true-zero respected ☐ Prices shown as a lever.

## 10. Evidence notes & gaps (TODO)
Confirm current severance rates, deduction handling per lease type, and suspense surfacing. Confirm
the `update_dispvol_cashflow`→`og_lease_cycle_disposition` code mapping. Worked example is synthetic.
Decimal application is also the open MVestimate net-vs-gross question (`Playbook_Pricing_And_Realization.md`).
