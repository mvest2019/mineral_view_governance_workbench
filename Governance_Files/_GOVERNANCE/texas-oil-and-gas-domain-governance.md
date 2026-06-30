# Texas Oil-and-Gas Domain Governance

> **Status:** ENHANCED (deep) · **Owner:** Content/DS SME · **Reviewer:** Legal (sensitive claims) · **Final approver:** Ryan · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Source:** `Glossary.xlsx`, map screenshots, RRC data. **Companion:** `glossary-terms-reference.md`, `faq-and-glossary-governance.md`, `rrc-data-governance.md`.

---

## 1. Purpose & scope
Govern **domain terminology, regulatory sensitivity, and Texas-specific accuracy** so the platform speaks the industry's language precisely and never overstates regulatory, production, or reserve claims. Mistakes here read as incompetence to professionals and as misinformation to owners.

## 2. Terminology rules (MUST)
Use canonical glossary terms precisely (`glossary-terms-reference.md`): mineral rights, royalty/NRI/NMA, HBP, EUR, MCF, BOE, stripper well, executive rights, decimal interest, division order, allocation well; and RRC, district, API-42, lease/well/operator. Definitions match the glossary.

## 3. Geography & regulatory facts
3 Texas basins; RRC Districts 1–10 (incl. 7B/7C/8A); API-42 (Texas) prefix; W-1/W-2 forms; stripper-well thresholds. Data scope is **Texas-only** (constitution P1) — US/educational content **must not** imply nationwide data.

## 4. Regulatory sensitivity
Regulatory/production/reserve/performance statements are **claims** — hedge as estimates, cite the RRC, and route sensitive claims to legal. **Do not** advise on leasing, selling, or drilling, and **do not** steer toward operators.

## 5. Claim rules
Reserve/production/performance figures are modeled-labeled with provenance + vintage; **must not** be presented as guaranteed or audited.

## 6. Domain review
Technical/domain content is DS SME-reviewed; legal-sensitive content is legal-reviewed; the public geographic-scope wording is pending Ryan (Q-C).

## 7. Good vs bad
| Good | Bad |
|---|---|
| "Texas RRC production data, as of June 2026." | "Real-time nationwide production." |
| "Stripper wells are low-rate wells at/below the RRC threshold." | (loose/incorrect domain term) |

## 8. QA checklist
☐ Canonical terms ☐ Texas scope ☐ RRC provenance + vintage ☐ Estimates hedged ☐ No advice/steering ☐ SME/legal review where needed.

## 9. Anti-patterns
Loose/incorrect domain terms; nationwide implication; unhedged reserve/production claims; advice on transactions; operator steering.

## 10. Evidence notes & gaps
Confirmed from the glossary, map screenshots, and RRC schema. Exact public scope wording pending Ryan (Q-C).

---

## Addendum (2026-06-30) — directional-survey & spatial domain terms (MView_X)

Canonical terms used by the geospatial pipeline (`geospatial-directional-survey-pipeline-governance.md`). Use them precisely:

- **SHL / BHL** — surface-hole location / bottom-hole location.
- **MD / Inc / Azimuth** — measured depth, inclination, azimuth: the raw directional-survey measurements.
- **MWD / GYRO** — measurement-while-drilling vs gyroscopic survey types; processed separately and reconciled per trajectory.
- **Minimum curvature** — the standard method for computing 3D well-path geometry from MD/Inc/Azimuth.
- **Perforation MD** — measured depth of perforations, used to derive completion/perforation geometry.
- **Lateral / linkage** — the horizontal wellbore segment and the relationships linking survey, permit, and production records.
- **Supergroup / zone / reservoir name** — grouping and naming layers built downstream (Permian public naming for Stage 9).

**MUST:** synthetic well trajectories are modeled as a **straight line SHL → landing → BHL**; do not describe or model a curved/bent synthetic path — empirical validation across tens of thousands of wells showed a bend doubles mean error.
