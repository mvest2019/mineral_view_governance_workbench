# Mineral View — Playbook: Confidence & Data-Quality

Status: ENHANCED (v0.2 — preserves v0.1; numeric thresholds still need SME confirmation)
Owner: Ryan Cochran (final authority) · Reviewer: DS SME (Christos Batsios / Gabor Korosi) · Maintainer: Nikhil Salunke
Last Updated: 2026-06-23
Applies To: Mineral View only

Every number we surface carries an honest confidence level, and the system must say "we can't
reliably tell you that" when the data isn't there. This playbook defines how confidence is set —
the trust backbone under every other playbook.

## 1. Purpose & scope
Govern the confidence band attached to every figure and the "insufficient → won't answer" rule.
In scope: the bands, how confidence is set, the data-quality checks that feed it. Out of scope:
the per-domain math (the other playbooks) and freshness mechanics (`Data_Provenance_And_Freshness.md`).

## 2. Confidence bands
| Band | Meaning | Typical cause |
|---|---|---|
| **High** | Exact / owner-confirmed | From owner documents (decimal, prices, deductions) |
| **Medium-high** | Mostly solid, one real unknown | Confirmed inputs + a young well or moving prices |
| **Medium** | Reasonable estimate | Modeled inputs, public records |
| **Low** | Weak / indicative | Sparse data, far-future, untouched zones |
| **Insufficient** | Won't answer | Data missing → say so |

## 3. How confidence is set
Confidence rises with **data authority** (owner > derived > public > web) and **completeness**, and
falls with **age**, **model uncertainty**, and **horizon** (further out = less certain).
- Dollar mechanics from owner documents → **high** (the math is exact).
- A 6-month forecast depending on a 4-month-old well → **medium-high at best** (real, unremovable
  uncertainty).
- A deep, untouched zone's drilling odds → **low**.
- No data for the field → **insufficient → "we can't reliably tell you."**

## 4. Rules
1. **Never present a number without a confidence level.**
2. **Separate what's exact from what's uncertain** in the same answer ("the dollar math is exact;
   the forecast is less certain because…").
3. **Documents make us precise, not omniscient** — more data narrows uncertainty; it never removes
   the genuine unknowns.
4. **Say what we don't know** (Non-Negotiable #12); offer how to improve it (upload a stub).
5. Confidence travels into the Monthly Report and the chatbot identically.

## 5. Data-quality checks (feed confidence)
- **Source authority** (which layer).
- **As-of date / staleness** (see `Data_Provenance_And_Freshness.md`).
- **Internal agreement** (do two owner docs agree? e.g. stub + division order showing the same
  decimal → high).
- **Completeness** (the completeness meter).
- **Production integrity** (gap-vs-true-zero classification; ARPS-guarded fits — `rrc-data-governance.md`).

## 6. Output
A confidence band attached to every figure, plus a plain-English explanation of why and what could
change it — exactly the "reasons it could be wrong" part of the standard answer shape.

## 7. Good vs bad framing
| Good | Bad |
|---|---|
| "Medium-high: your decimal is confirmed, but the well is only 4 months old, so the forecast has real uncertainty." | "Your 6-month income will be $X." |
| "Insufficient data for this field — we can't reliably tell you yet." | (a confident number with no basis) |

## 8. Anti-patterns
A number with no confidence band; presenting modeled output as exact; answering when data is
insufficient; implying documents remove all uncertainty.

## 9. QA checklist
☐ Confidence band on every figure ☐ Exact vs uncertain separated ☐ "Insufficient" used when data
missing ☐ Source authority + staleness + agreement + completeness checked ☐ Plain-English "why"
attached.

## 10. Evidence notes & gaps (TODO)
Define numeric thresholds (well-age cutoffs, staleness windows) that map to each band — SME-pending.
The bands and rules are confirmed from v0.1; the thresholds are not yet set.
