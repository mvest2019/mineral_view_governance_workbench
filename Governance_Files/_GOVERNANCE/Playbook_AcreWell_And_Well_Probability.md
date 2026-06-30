# Mineral View — Playbook: Acre/Well, EUR/Acre & Well-Probability

Status: ENHANCED (v0.2 — preserves v0.1; spacing/EUR/probability model still need SME confirmation)
Owner: Ryan Cochran (final authority) · Reviewer: DS SME (Christos Batsios / Gabor Korosi) · Maintainer: Nikhil Salunke
Last Updated: 2026-06-23
Applies To: Mineral View only

Estimates how likely more wells are to be drilled on an owner's land, and the upside that creates —
the "will they drill more wells on me?" answer. The biggest driver of valuation upside, so a
high-care claim surface.

## 1. Purpose & scope
Govern how drilling likelihood and remaining-resource upside are estimated, expressed, and
disclaimed. In scope: acre/well density, EUR/acre, landing-zone logic, the likelihood/timing/why
output, guardrails. Out of scope: the spatial "what is nearby" computation (`Playbook_Spatial_And_Offset.md`,
which feeds offset intensity here) and the cashflow the upside feeds (Revenue playbook).

## 2. Inputs (data layers)
- **Layer 1 (owner):** lease clauses (continuous-development, Pugh) — can change the likelihood.
- **Layer 2 (derived):** acre/well density, EUR/acre, landing-zone analysis.
- **Layer 3 (public):** existing wells on the unit, nearby permits/activity, formations present.
- **Backed by:** `PotentialAcreage`, `getnearbydevelopment`, portal/offset endpoints, the
  potential-acreage and zones analyses; well/permit/formation from `w1wells`, `w1permits`,
  `w2_formationrecords`; trajectory from `directional_survey_child`.

## 3. Method (to confirm with SME)
1. **Density (acre/well):** how heavily the unit is already drilled in a zone vs typical spacing →
   how much room remains. (Acre/well references an 8,000-ft lateral per FAQ.)
2. **Remaining resource (EUR/acre):** how much oil/gas the rock is still expected to hold.
3. **De-risking (nearby activity):** a nearby strong result raises the odds for the same zone
   (offset intensity from the Spatial playbook).
4. **Lease pressure (clauses):** a continuous-development clause generally forces a drilling
   schedule to hold acreage → raises likelihood.
5. **Landing zones:** separate, deeper formations (e.g. Austin Chalk under Eagle Ford) are their
   own opportunities with their own (often lower) probability.

> Exact spacing assumptions, EUR/acre figures, probability weighting, and the combination into a
> likelihood are `TODO` — fill from SME and the zones/acre-well repos.

## 4. Output (likelihood + timing + why)
Per opportunity: **likelihood** (High/Elevated/Moderate), **timing window**, and **why** (room to
drill, resource remaining, nearby de-risking, lease clause). Example: "A 4th Lower EF well —
Elevated, 12–24 mo — the unit is lightly drilled for this zone, the rock still holds oil, a nearby
result de-risks it, and the lease requires continued drilling." Feeds the Monthly Report "New &
potential activity," the valuation upside, and the "Will they drill more wells on me?" recipe.

## 5. Guardrails
- Likelihoods are **estimates**, not certainties; permitted/expected wells can be delayed, moved,
  or not drilled — say so (drilling-likelihood disclaimer).
- A bare permit is weaker evidence than permit + continuous-development clause + nearby result.
- Never imply a guaranteed new well or guaranteed income.
- A neighbor's well **doesn't pay the owner** — it's a signal, not income.

## 6. Confidence
Higher with a spudded/permitted well + lease clause + nearby de-risking; lower for untouched deep
zones with few proof points. Confidence band mandatory (`Playbook_Confidence_And_Data_Quality.md`).

## 7. Good vs bad framing
| Good | Bad |
|---|---|
| "Elevated likelihood of a 4th well in 12–24 months — not a certainty; permits can slip or move." | "You'll get a 4th well next year." |
| "A nearby strong result de-risks this zone (good sign for the rock), but it doesn't pay you." | "Your neighbor's well means more income for you." |

## 8. Anti-patterns
Likelihood shown as certainty; bare permit treated as a guaranteed well; neighbor production implied
as owner income; inventing spacing/EUR/probability numbers instead of marking them SME-pending.

## 9. QA checklist
☐ Density + remaining-resource + de-risking + lease-clause considered ☐ Likelihood + timing + why
produced ☐ Estimate/limitations labeled ☐ Confidence band attached ☐ Neighbor-well = signal not
income ☐ Landing zones scored separately ☐ No invented figures.

## 10. Evidence notes & gaps (TODO)
Document spacing/EUR assumptions and the probability model; connect to the Geography/Type-Curve
Atlas. Confirm how `PotentialAcreage`/`getnearbydevelopment` combine into the band. The 8,000-ft
lateral is from the FAQ; exact density math is SME-pending.
