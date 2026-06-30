# Spreadsheet Source Inventory

> Status: NEW · Owner: Content / Data · Last Updated: 2026-06-23
> Source: provided spreadsheets. Detailed rules in `faq-and-glossary-governance.md`,
> `blog-and-seo-content-governance.md`, `news-and-regulatory-feed-governance.md`.

---

## 1. Purpose

Canonical list of the spreadsheet inputs that feed content, SEO, methodology, and reference governance, with their scale and the file that owns each.

## 2. Inventory

| Spreadsheet | Scale | Role | Governed by |
|---|---|---|---|
| `Presentation_FAQs.xlsx` | FAQ set | Methodology + product FAQ: Arps decline, allocated production, acre/well (8,000-ft lateral), EUR/EUR-per-acre gridding, new-well-probability factors, MVestimate definition; tier framing | `faq-and-glossary-governance.md` |
| `Glossary.xlsx` | 36 terms | Customer-facing domain glossary (NRI, NMA, HBP, EUR, MCF, stripper well, executive rights…) + canonical Texas facts (3 basins, API-42 prefix, stripper thresholds) | `faq-and-glossary-governance.md` |
| `Blog.xlsx` | 180 posts | SEO/content engine; carries content-compliance findings (tax specifics, lease-vs-sell framing, bullish market framing) | `blog-and-seo-content-governance.md`, `seo-governance.md` |
| `Newsnew.xlsx` | 11,638 records | RRC regulatory-activity feed; confirms RRC as dominant data source; backs Activities/Materiality | `news-and-regulatory-feed-governance.md` |
| `All_Operator_Names_sanitized.xlsx` | operator map | Operator-name sanitization for "Know Your Operators" | `operator-directory-governance.md` |
| `Historical_Production_Change.xlsx` | RRC sample | Retroactive-RRC bitemporal problem (82% zero rows; `prod_report_filed_flag` Y vs N; `vintage_date` vs `cycle_year_month`) | `rrc-data-governance.md`, `data-architecture-governance.md` |

## 3. Usage rules

- These spreadsheets are **rank 8** in the source-of-truth hierarchy — they lose to code, data schemas, screenshots, and legal text on conflict.
- Content derived from `Blog.xlsx` **must** pass content-compliance review (no advice, no guaranteed-outcome framing).
- `Glossary.xlsx` is the canonical wording source for domain terms used across the site.

## 4. Evidence notes

Scales (180 posts, 11,638 records, 36 terms) are confirmed from prior analysis. Column-level schemas should be re-verified against the live files before adoption where exact fields matter.
