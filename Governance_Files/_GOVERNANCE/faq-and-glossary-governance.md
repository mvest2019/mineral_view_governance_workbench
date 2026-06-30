# FAQ & Glossary Governance

> **Status:** ENHANCED (deep) · **Owner:** Content · **Reviewer:** DS SME (methodology terms) · **Final approver:** Ryan (claims) · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Source:** `Presentation_FAQs.xlsx`, `Glossary.xlsx` (36 terms). **Companion:** `glossary-terms-reference.md`, `content-governance.md`, `texas-oil-and-gas-domain-governance.md`, `mvestimate-governance.md`.

---

## 1. Purpose & scope
Govern FAQ and glossary content — the **canonical wording** for domain terms and methodology explanations the entire site must stay consistent with. The FAQ is where the platform explains its **methodology** to users; an FAQ that overstates precision (e.g., implying MVestimate is an exact value) propagates a claim risk site-wide. The 36-term glossary is the shared vocabulary every other surface inherits.

## 2. Glossary rules (MUST)
- The **36 customer-facing terms** are canonical (`glossary-terms-reference.md`); definitions are **identical everywhere**.
- New terms require content review + (technical terms) DS SME review.
- A definition change **propagates** to every surface that uses the term.
- Technical/estimate terms (EUR, MVestimate, decline, acre/well) stay **hedged**.

## 3. FAQ rules (MUST)
The FAQ covers methodology and product basics; methodology answers **must** match the implementation and stay hedged:
| FAQ topic | Governing rule |
|---|---|
| Arps decline | Describe as a modeled forecast; no guaranteed production |
| Allocated production | Lease→well allocation per the documented engine |
| Acre/well (8,000-ft lateral) | State the lateral reference; spatial density |
| EUR / EUR-per-acre gridding | Produced + remaining reserves (modeled), 6-yr window |
| New-well-probability factors | Describe inputs; do not present as certainty |
| MVestimate | Modeled six-year earnings estimate; not a value/guarantee |
| Tiers (Free/Pro/Premium) | Use canonical pricing (`pricing-and-plan-governance.md`); 1-lease-free framing |

## 4. Canonical Texas facts
3 basins; RRC Districts 1–10 (incl. 7B/7C/8A); API-42 prefix; stripper-well thresholds — used consistently across all content.

## 5. Cross-linking & SEO
Glossary terms link from blog/product pages; FAQ links to relevant glossary terms and cluster pillars. Glossary and FAQ are prime **evergreen entity/long-tail** SEO assets (`seo-governance.md`).

## 6. Add/update workflow
Draft → content review → SME review (technical) → publish → propagate a definition change everywhere the term appears. Keep terminology aligned with the constitution and methodology files.

## 7. QA checklist
☐ Consistent definition site-wide ☐ Matches implementation ☐ Hedged (estimate) ☐ Cross-linked ☐ Texas facts correct ☐ SME-reviewed if technical ☐ Tier wording canonical.

## 8. Anti-patterns
Divergent definitions across pages; FAQ methodology that overstates precision; orphaned glossary terms; tier wording from the excluded doc.

## 9. Evidence notes & gaps
Terms/facts confirmed from `Glossary.xlsx`; methodology coverage from `Presentation_FAQs.xlsx`. Exact verbatim entries live in the spreadsheets and should be synced before adoption.

---

## Deep context (2026-06-30) — glossary & FAQ as the terminology source

The **Glossary** is the canonical, owner-readable definition set for oil & gas terminology, built on a shared content framework and optimized for understanding and search. The **FAQ** answers common owner questions in plain language. Together they anchor the platform's voice and the AI's terminology.

**Rules (MUST):**
- **Single source of truth:** glossary definitions are canonical — product microcopy, blogs, reports, and AI answers use the **same terms the same way** (`MineralView_Glossary.md`, `texas-oil-and-gas-domain-governance.md`). A term is defined once and reused, not redefined per page.
- **Accuracy + accessibility:** definitions are technically correct **and** understandable to a non-expert owner; include examples where it aids comprehension.
- **Texas scope (P1):** definitions reflect Texas/RRC reality (districts, API-42, W-1/W-2, stripper thresholds) and don't imply nationwide data.
- **No advice (P3 framing):** explanatory only; estimates referenced in definitions are labeled as estimates.
- **Maintenance:** new product terms get a glossary entry; changed regulatory facts update the glossary and cascade to dependent pages; entries pass the content QA gate before publish.
