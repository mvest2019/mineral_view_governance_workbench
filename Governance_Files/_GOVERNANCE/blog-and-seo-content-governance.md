# Blog & SEO Content Governance

> **Status:** ENHANCED (deep) · **Owner:** Content/SEO · **Reviewer:** Legal (claims) · **Final approver:** Ryan (claims) · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + monthly refresh queue · **Source:** `Blog.xlsx` (180 posts). **Companion:** `seo-governance.md`, `content-governance.md`, `texas-oil-and-gas-domain-governance.md`.

---

## 1. Purpose & scope
Govern the **180-post blog content engine**: topic strategy, search intent, metadata, internal linking, refresh/pruning, compliance, and AI-generated-content rules. The blog is the primary organic-acquisition engine **and** a major claim surface — it discusses royalties, leasing, valuation, taxes, and market conditions, all of which are advice-adjacent. The governing tension is growth vs. the constitution's no-advice rule, and the constitution wins.

## 2. Topic clusters (pillar model)
Organize the 180 posts into pillars, each with a pillar page that posts link up to:
- **Mineral-owner education** (what you own, how to read your data, claiming)
- **Royalties & leasing** (NRI/royalty, lease terms, HBP, division orders)
- **RRC & regulatory** (permits, completions, production reporting, regulatory activity)
- **Valuation & MVestimate** (EUR, decline, six-year earnings)
- **Operators & benchmarking** (operator directory, performance)
- **Texas geography & basins** (districts, counties, basins)

## 3. Search-intent mapping
Each post is tagged informational/educational (owner education, glossary/FAQ adjacency) or commercial/product-led (feature, valuation). The CTA matches intent — educational posts link deeper into education + a soft claim/sign-up; commercial posts drive to the product.

## 4. Metadata & linking (MUST)
Each post carries: a unique title + meta description, a canonical tag, a descriptive slug (`/blog/<topic>`), and internal links to the related glossary terms **and** the cluster pillar. Orphan posts (no pillar link) are not allowed.

## 5. Compliance (from `Blog.xlsx` findings)
The same compliance rules as `content-governance.md` §4 apply, specifically: no tax-as-advice, no lease-vs-sell recommendation, no bullish-as-fact framing, no transaction directives, Texas data scope (US content educational only), and the "not advice" disclaimer on decision-adjacent posts. The flagged community pattern ("don't sign the first lease the landman brings you") is the canonical example of what gets a disclaimer + moderation, not free publication.

## 6. Refresh & pruning
High-value posts are refreshed on cadence (data, prices, regulatory facts go stale); thin or duplicative posts are consolidated or pruned with a 301 redirect to the nearest relevant pillar. Cannibalizing posts targeting the same term are merged.

## 7. AI-generated content
AI may draft posts but **must** follow `ai-agent-instructions.md`: grounded in canonical sources, no invented facts/stats, no advice, human review for any claim, and `Not confirmed from the uploaded files.` where evidence is missing. AI-drafted posts get the same compliance review as human drafts.

## 8. QA checklist
☐ Cluster + intent assigned ☐ Pillar link present (no orphan) ☐ Title/meta/slug/canonical ☐ Internal glossary links ☐ No advice/steering ☐ Sources cited ☐ Estimates labeled + vintage ☐ Refresh date set ☐ Claims routed to legal.

## 9. Anti-patterns
Orphan posts; duplicate/cannibalizing topics; advice framing; unsourced stats; AI-invented figures; stale prices/data; nationwide implication.

## 10. Evidence notes & gaps
180-post scale + compliance findings confirmed from `Blog.xlsx`. Per-post metadata/fields are in the spreadsheet and **Not confirmed from the uploaded files** verbatim here.

---

## Deep context (2026-06-30) — the content engine & its guardrails

Content is Mineral View's primary organic growth channel: **25+ published blogs**, glossary pages, and YouTube content, driven by keyword research and search-intent mapping (work by the SEO/content/marketing team).

**Workflow (MUST):** keyword research → search-intent mapping → outline → draft (content writer) → **review/QA** (optimization, internal-linking, accuracy) → publish → measure. Drafts are audited before writer handoff and again before publish.

**On-page SEO standards:** unique title/meta/canonical; one H1 (server-rendered, not JS-injected); logical H2/H3; internal links to glossary/pillar pages; schema markup where relevant; image alt text. Technical/AI-visibility work (GEO/AI Overviews, Bing Webmaster + IndexNow, SSR fixes) is in scope.

**Guardrails (MUST):**
- **Accuracy over ranking:** never trade factual correctness for SEO; oil & gas claims use **canonical glossary terms** and are technically correct.
- **Texas scope (P1) & no overstatement (P2):** educational/US framing must not imply nationwide platform data; don't overstate what the platform proves.
- **No advice:** educational, not investment/legal advice (`Compliance_And_Disclaimers.md`).
- **AI-assisted, human-reviewed:** AI tools may draft/optimize, but a human reviews for accuracy and brand voice before publish; trending-automation output (Trendelier) always has a human gate.
