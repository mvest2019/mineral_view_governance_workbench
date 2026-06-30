# Decline-Curve Methodology Governance

> **Status:** ENHANCED (deep) · **Owner:** DS SME (Christos Batsios / Gabor Korosi) · **Reviewer:** Nikhil Salunke · **Final approver:** Ryan Cochran
> **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly + on any method change · **Change class:** Major (methodology + claim)
> **Source:** `Decline_curve`, `DeclineCurveManualAnalysis2025`, `DeclineCurve2026`, `Presentation_FAQs.xlsx`. **Companion:** `mvestimate-governance.md`, `analytics-layer-governance.md`, `rrc-data-governance.md`.

---

## 1. Purpose & scope
Govern decline-curve fitting, lease→well allocation, acre/well density, the manual-review workflow, and how all of these are **described to users** — because decline forecasts feed EUR and MVestimate, the platform's headline value claims. A decline curve presented as certainty, or built without validation, becomes a false promise about someone's future income; this file prevents that.

**In scope:** the three decline repos, the Arps fit, change-point segmentation, allocation, acre/well, manual review, versioning, and user-facing description rules. **Out of scope:** the price-deck multiplication and scenario aggregation (`mvestimate-governance.md`) and the raw production rules (`rrc-data-governance.md`).

## 2. Methodology lineage (three repos, oldest → current)
| Repo | Role | Notes |
|---|---|---|
| `Decline_curve` (oldest) | The proprietary lease→well **allocation engine** (`AllocationFinal.py`, `utils_AllocationFinal.py`) | Includes `christos.py` (DS SME Christos Batsios). Lease-level RRC production is allocated to individual wells before decline is fit |
| `DeclineCurveManualAnalysis2025` | **Streamlit manual-review** tool | An analyst adjusts the change point and minimum points used in the fit |
| `DeclineCurve2026` (current MVP) | **Batch + review MVP** | Hyperbolic Arps fit `q(t) = qi / (1 + b·Di·t)^(1/b)` with **b ∈ [0, 3]**; change-point segmentation; acre/well spatial density; Mongo write-back. Stack: pandas / numpy / scipy / sklearn / statsmodels / geopy + MongoDB + Streamlit + Plotly. Labeled "internal MVP, evolving monthly." |

## 3. Method rules (MUST)
- The Arps fit **must** guard against empty/short series (no crash on a sparse or newly-gapped lease — ties to `rrc-data-governance.md` §4).
- The hyperbolic exponent **`b` stays within [0, 3]**; values outside this range are rejected/clamped, not silently fit.
- Lease→well **allocation** follows the documented engine; changes are SME-reviewed (allocation errors propagate into every well's EUR and value).
- **Acre/well** uses spatial density with the documented **8,000-ft lateral** reference (per FAQ); the parameters are documented, not implicit.
- The methodology is **versioned**; the 2026 MVP is explicitly internal and evolving — version is recorded with any output that feeds a customer-facing value.
- The fit consumes RRC production that has already passed the zero/gap/vintage rules — a gap (`flag=N`) is **not** fed to the fit as a real zero.

## 4. Empirical-validation principle (MUST)
Methodology decisions are **data-driven, not intuition-driven**. Standing precedent: a **bend-based trajectory approach was abandoned** after a **44,570-well validation** showed it performed at coin-flip accuracy and **doubled** the mean error versus the simpler approach. The rule that follows: a new or changed method **must** carry validation evidence (accuracy, error vs the incumbent) before it is allowed to feed any customer-facing value. Intuition or elegance **must not** override validation.

## 5. Manual-review workflow
Where the workflow requires it, manual-review outputs (analyst-set change/min points) are **analyst-validated** before they feed user-facing values. The manual tool (`DeclineCurveManualAnalysis2025`) and the batch+review MVP (`DeclineCurve2026`) are the sanctioned review surfaces.

## 6. Open parameters (Ryan / DS SME) — Q-D
These are **not yet confirmed** and **must not** be invented in copy or code descriptions:
- the **terminal-rate floor** (the minimum rate the decline asymptotes toward),
- the **young-well fallback** vs **type-curve** behavior (what is used when a well has too little history to fit),
- the **120-month model → 6-year MVestimate display mapping** (how the underlying horizon maps to the displayed window).
Tracked in `open-questions-and-evidence-gaps.md` (Q-D).

## 7. User-facing rules
Decline forecasts are **modeled estimates with limitations** — described with the input (historical RRC production), the method (Arps decline), and the uncertainty. They **must not** be presented as guaranteed or actual future production.

## 8. QA checklist
☐ ARPS-guarded on empty/short series ☐ `b` within [0, 3] ☐ Allocation documented + SME-reviewed ☐ Acre/well params stated (8,000-ft lateral) ☐ Method version recorded ☐ Validation evidence retained for any change ☐ Gap (`flag=N`) not fed as a real zero ☐ Estimate labeled in any surfaced output.

## 9. Anti-patterns
Shipping a method without validation evidence; unbounded `b`; undocumented allocation changes; feeding `flag=N` gaps as real zeros; presenting forecasts as certainties; inventing the terminal-rate/young-well/display-mapping parameters in copy.

## 10. Evidence notes & gaps
Arps form, `b` range, change-point, and acre/well confirmed from `DeclineCurve2026`; allocation from `Decline_curve`; the 44,570-well validation precedent and the abandoned bend approach from prior empirical work. **Not confirmed from the uploaded files:** the exact terminal-rate floor, young-well fallback, and 120-month→6-year mapping (Q-D).
