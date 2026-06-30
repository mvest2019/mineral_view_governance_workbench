# SEO Governance

> **Status:** ENHANCED (deep) · **Owner:** SEO · **Reviewer:** Frontend (technical), Legal (claims in copy) · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Companion:** `page-governance.md`, `performance-and-technical-seo-governance.md`, `blog-and-seo-content-governance.md`, `faq-and-glossary-governance.md`, `county-pages-governance.md`.

---

## 1. Purpose & scope
Govern on-page and technical SEO across every public surface — marketing/landing pages, product/feature pages, the 180-post blog, the 36-term glossary, the FAQ, the regulatory news feed, and the programmatic county/operator pages. SEO is the platform's primary organic-acquisition engine, but it operates **under** the constitution: a page that ranks by making an advice or guarantee claim is a governance failure, not a win.

## 2. Strategy & demand map
| Pillar | Intent | Primary surfaces |
|---|---|---|
| Texas mineral-owner education | Informational | blog, glossary, FAQ, owner-education pages |
| Royalties / leasing | Informational → commercial | blog clusters, glossary terms |
| RRC / regulatory | Informational | news feed, blog |
| Valuation / MVestimate | Commercial | product/feature pages |
| Operators / benchmarking | Commercial | operator directory, county pages |
| Texas geography / basins / counties | Informational → local | county pages, basin content |

Glossary and FAQ act as **evergreen entity/long-tail capture**; county/operator pages are **programmatic capture** and must carry real per-entity data (not thin templates) to justify indexing.

## 3. On-page rules (MUST)
| Element | Rule |
|---|---|
| Title tag | Unique; ~50–60 chars; primary term front-loaded |
| Meta description | Unique; ~150–160 chars; value + CTA |
| H1 | Exactly one; matches search intent |
| H2/H3 | Logical hierarchy; scannable |
| URL slug | Short, lowercase, hyphenated, keyword-bearing |
| Canonical | Present; prevents duplicate-content cannibalization |
| Internal links | Descriptive anchors to glossary terms + cluster pillars |
| Structured data | Article / FAQ / Breadcrumb where applicable |
| Indexability | Public/valuable pages indexable; private/owner/thin pages excluded |

## 4. Examples (good vs bad)
| Element | Good | Bad |
|---|---|---|
| Title | "Texas Mineral Rights: How to Claim Your Owner Record" | "Home \| Welcome to Mineral View" |
| Slug | `/glossary/net-revenue-interest` | `/page?id=4821` |
| Meta | "Find and claim your Texas mineral-owner record and view your dossier. Start free." | (site-wide duplicate meta) |
| Anchor | "learn what Net Revenue Interest means" | "click here" |

## 5. Schema, sitemap & robots
Add and validate structured data where applicable; maintain a correct sitemap and robots policy; keep private/owner/thin pages out of the index. Govern these centrally where confirmed in the repo; otherwise flagged as an evidence gap.

## 6. Claim discipline in SEO copy
Title/meta/heading copy is still **copy** — it follows the constitution. **No** guaranteed-value, savings, or nationwide claims in pursuit of clicks. Methodology terms in SEO copy stay hedged.

## 7. SEO QA checklist
☐ Unique title/meta ☐ One H1 matching intent ☐ Clean slug ☐ Canonical ☐ Internal links (glossary + pillar) ☐ Schema where applicable ☐ Indexable (private/thin excluded) ☐ No cannibalization ☐ No claim/advice copy ☐ Texas scope correct.

## 8. Anti-patterns
Duplicate titles/metas; thin programmatic pages; keyword cannibalization; indexing private/owner pages; advice/guarantee copy chasing rankings; "click here" anchors.

## 9. Ownership & review
Owner: SEO. Technical → Frontend. Claims in copy → Legal. Review quarterly.

## 10. Evidence notes & gaps
Strategy grounded in the confirmed content set (180 posts, 36 glossary terms, 11,638 news records) and the nav taxonomy. **Not confirmed from the uploaded files:** exact schema/sitemap/robots configuration (see `performance-and-technical-seo-governance.md`).
