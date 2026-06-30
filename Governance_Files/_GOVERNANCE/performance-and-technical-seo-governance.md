# Performance & Technical-SEO Governance

> **Status:** ENHANCED (deep) · **Owner:** Frontend/SEO · **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly
> **Companion:** `seo-governance.md`, `media-and-assets-governance.md`, `frontend-governance.md`.

---

## 1. Purpose & scope
Govern page speed, Core Web Vitals, crawlability, indexability, and structured data — the technical foundation that lets content rank and load well, especially for the programmatic county/operator pages and the data-heavy map/dossier views.

## 2. Rules (MUST)
- Optimize images; defer non-critical JS; keep bundle sizes reasonable.
- Meet Core Web Vitals targets; cache where possible; **progressive loading** for API-bound views (map, dossier, MVestimate) so the user sees data as it arrives.
- Crawlable, indexable **public** pages; correct canonicals; valid sitemap/robots.
- **Do not** index thin/duplicate or private/owner pages.

## 3. Structured data
Add Article / FAQ / Breadcrumb schema where applicable; validate it; keep it consistent with on-page content and the canonical contact facts.

## 4. Programmatic-page performance
County/operator pages must carry real per-entity data (not thin templates) and load efficiently at scale; thin pages are both an SEO and a performance liability.

## 5. QA checklist
☐ CWV acceptable ☐ Images optimized ☐ JS deferred ☐ Cached ☐ Progressive loading on API views ☐ Crawlable/indexable (private/thin excluded) ☐ Canonical correct ☐ Sitemap/robots valid ☐ Schema valid.

## 6. Anti-patterns
Indexing private/thin pages; render-blocking JS; unoptimized images; invalid/missing canonicals; broken sitemap/robots; blocking the whole UI on a slow API call.

## 7. Evidence notes & gaps
Best-practice targets; the exact CWV metrics, sitemap/robots, and schema configuration are **Not confirmed from the uploaded files**.

---

## Deep context (2026-06-30) — performance & technical-SEO baseline

**Core Web Vitals (MUST):** budget LCP/CLS/INP per page; optimize and lazy-load images/media; split/defer JS; cache where safe (Redis on the API, CDN on static). Heavy data views (portfolio, map, reports) paginate/aggregate rather than loading everything.

**Technical SEO (MUST):** **server-rendered H1** (not JS-injected — this was an explicit fix); crawlable URLs; correct canonicals; XML sitemap + robots; schema markup; Bing Webmaster + **IndexNow**; fast TTFB. AI-visibility (Google AI Overviews, Bing Copilot) is in scope — structured, well-sourced content wins.

**Process:** performance + technical-SEO checks are in the publish/launch QA gate; a regression in CWV or a broken canonical/redirect blocks release; replaced URLs always get a **301**.
