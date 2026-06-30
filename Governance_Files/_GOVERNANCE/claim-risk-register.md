# Claim Risk Register

> **Status:** NEW (reference) · **Owner:** Legal/Product · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Source:** Terms/Privacy, constitution P2/P3, `Blog.xlsx` findings, product screenshots. **Companion:** `legal-compliance-and-claims-governance.md`, `content-governance.md`, `mvestimate-governance.md`.

---

## 1. Purpose & scope
A single register that classifies the **recurring claim types** on the platform by risk level, with the required review and the safe vs prohibited phrasing for each. Use it before publishing anything that asserts what the platform measures, predicts, guarantees, or covers.

## 2. Risk levels & review
| Level | Definition | Required review |
|---|---|---|
| Low | Neutral education; glossary definition | Content |
| Medium | Feature description; methodology summary | Product + DS SME |
| High | Value/accuracy/savings/coverage claim; legal statement; pricing | Legal + **Ryan** |

## 3. Claim-type register
| Claim type | Risk | Safe phrasing | Prohibited phrasing |
|---|---|---|---|
| Mineral value (MVestimate) | High | "Modeled six-year earnings estimate; not a guarantee or sale price." | "Your minerals are worth $X." / "Guaranteed value." |
| Reserves / EUR | High | "EUR = produced + estimated remaining reserves (modeled, 6-yr window)." | "Exact/audited reserves." |
| Production forecast (decline) | High | "Modeled forecast; actual production varies." | "Guaranteed future production." |
| Data coverage | High | "Texas RRC data." | "Nationwide coverage." |
| Accuracy | High | "Estimates based on RRC data and modeling; verify independently." | "100% accurate." |
| Savings / outcomes | High | (avoid unless evidenced + Ryan-approved) | "Save $X." / "Best returns." |
| Tax | High | "Consult a tax professional." | Tax-avoidance guidance. |
| Lease/sell decisions | High | "Factors to weigh; not advice." | "You should sell/lease/sign." |
| Operator quality | Medium-High | Neutral comparative data. | "Better lease terms with X." |
| Feature capability | Medium | Matches actual behavior. | Capabilities the product lacks. |
| Pricing/limits | High | Canonical persona × tier figures. | Invented/rounded figures; excluded-doc sourcing. |
| Heritage | Medium | "Family-owned; 6 generations; 75+ years in Texas O&G." | Embellished years/generations; software "75 years old." |

## 4. Workflow
Draft → identify claim type → classify risk → route reviewers → **Legal for High** → **Ryan approval for High** → publish → log in the decision log. AI may draft but **must not** finalize High-risk claims (`ai-agent-instructions.md`).

## 5. Disclaimers required by claim type
Value/forecast/coverage/decision claims carry the no-advice + no-reliance disclaimer and the estimate label + vintage. Tax content carries "consult a professional." Heritage claims stay factual.

## 6. Evidence notes & gaps
Risk classifications derive from the constitution (P2/P3), Terms/Privacy disclaimers, the `Blog.xlsx` compliance findings, and the product screenshots. Specific approved phrasing should be confirmed by counsel before adoption (`legal-compliance-and-claims-governance.md`).

---

## Deep context (2026-06-30) — claim-accuracy risks & controls

The "claim" surface (Claim Mineral Owner/Lease) is the activation moment **and** the highest-trust risk: telling someone they own (or don't own) minerals.

**Top risks → controls (MUST):**
- **Wrong ownership shown** → owner/linkage data is validated (DS validation frameworks); claims go through **verification** before portfolio integration; ownership uses canonical entity matching, not fuzzy guesses.
- **Stale "asset disappeared"** (RRC restatement) → **bitemporal** production handling so a retroactive RRC rewrite never reads as a lost asset (`rrc-data-governance.md`).
- **Over-claiming beyond tier** → server-enforced **claim limits**; duplicate-claim detection; clear upgrade prompts, not silent failures.
- **Cross-owner data leakage** → access control on ownership/financials; the professional **act-as-owner** path is authorization-checked and audited.
- **Estimate mistaken for fact** → cashflow/value shown on a claimed asset is **labeled estimate** (P3) with confidence context.
- **Overstated coverage** → "we couldn't find it" never implies "it doesn't exist" (P2).

**Governance:** claim-logic changes are high-sensitivity (QA + Ryan-aware); incidents affecting displayed ownership/financials follow `incident-and-rollback-governance.md` with provenance preserved.
