# Media & Assets Governance

> **Status:** ENHANCED (deep) · **Owner:** Design/Frontend · **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly
> **Companion:** `design-ux-and-screenshot-governance.md`, `performance-and-technical-seo-governance.md`, `accessibility-governance.md`.

---

## 1. Purpose & scope
Govern images, screenshots, icons, and media — organization, naming, alt text, optimization, and licensing — serving accessibility, SEO, performance, and privacy at once.

## 2. Rules (MUST)
- **Descriptive file names + alt text** (accessibility + SEO).
- **Optimize** images (size/format) for performance and Core Web Vitals.
- **Track source/licensing**; do not use unlicensed media.
- **Mask PII/secrets** in any screenshot asset (owner names/addresses, keys, internal config).
- Screenshots reflect current UI and never present demo values as real (mirrors `design-ux-and-screenshot-governance.md`).

## 3. Alt-text examples
| Good | Bad |
|---|---|
| "Texas RRC district map showing District 8 wells." | "image1.png" |
| "Owner Dossier with lease, reservoir, and well sections." | "screenshot" |

## 4. Organization
Group assets logically (product screenshots, map imagery, icons, marketing). Version screenshots so stale UI is retired.

## 5. QA checklist
☐ Named descriptively ☐ Alt text present + meaningful ☐ Optimized ☐ Licensed/sourced ☐ No PII/secrets ☐ Current UI.

## 6. Anti-patterns
Generic file names; missing/poor alt text; unoptimized images; unlicensed media; PII in assets; stale screenshots.

## 7. Evidence notes & gaps
Grounded in frontend + screenshot practice; the asset-store structure is **Not confirmed from the uploaded files**.

---

## Deep context (2026-06-30) — media, screenshots, and brand assets

Covers images, banners, graphics, video, and product screenshots across the site, app, blog, glossary, and YouTube.

**Rules (MUST):**
- **Rights:** only licensed/owned media; no unlicensed images; keep license records. Brand assets follow the brand system (navy/teal, Lexend).
- **Screenshots reflect reality:** product screenshots show the **current UI** and **realistic, non-misleading** data — no doctored numbers implying coverage/accuracy the platform doesn't have (P2). Mask/obfuscate real owner PII in any shared screenshot (`privacy-and-data-use-governance.md`).
- **Accessibility:** images carry descriptive alt text; text-in-image is avoided or duplicated in real text (`accessibility-governance.md`).
- **Performance:** images are optimized/responsive (Core Web Vitals); large media is lazy-loaded.
- **Versioning:** when UI changes, stale screenshots are refreshed on the maintenance cadence; the screenshot inventory tracks what exists and where it's used.
