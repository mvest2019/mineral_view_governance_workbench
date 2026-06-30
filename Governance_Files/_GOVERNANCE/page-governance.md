# Page Governance

> **Status:** ENHANCED (deep) · **Owner:** Content/Frontend · **Reviewers:** SEO, Legal (claims), a11y · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Companion:** `seo-governance.md`, `accessibility-governance.md`, `publishing-workflow.md`, `frontend-governance.md`.

---

## 1. Purpose & scope
Govern page **structure, required sections, metadata, claim-safety, and lifecycle** for the public site so every page is consistent, findable, accessible, and compliant. A page is the unit that ships claims, estimates, and CTAs to users, so it inherits the constitution's labeling/disclaimer rules on top of structural standards.

## 2. Required page elements (MUST)
Exactly one H1; unique title tag; concise meta description; logical H2/H3; one clear primary CTA; canonical tag; internal links to related glossary/FAQ where relevant; provenance + vintage on any data; estimate labels where applicable; disclaimers on decision-adjacent content.

## 3. Page types & their extra rules
| Type | Extra requirement |
|---|---|
| Marketing / landing | Claim review if value/coverage claims |
| Product / feature | Behavior-accurate; tier-correct; estimates labeled |
| Glossary term | Canonical definition; cross-links |
| FAQ | Methodology-accurate; hedged |
| Blog post | Cluster + intent; compliance review |
| News / regulatory | Provenance + vintage; no steering |
| County / operator (programmatic) | Real per-entity data; no bulk PII; not thin |
| Legal | Counsel-reviewed; entity name correct |

## 4. CTA rules
One **primary** CTA per page (claim, sign up, upgrade, contact); secondary links may exist but must not compete. Upgrade CTAs follow `free-tier-and-upgrade-path-governance.md` (no false urgency/guaranteed value).

## 5. Internal linking
Owner-education pages link to relevant glossary terms and pillar pages with descriptive anchors (not "click here"); programmatic pages link to related counties/operators.

## 6. Lifecycle
Create → review (content/SEO/legal/a11y as applicable) → publish → monitor → update → retire **with a 301 redirect**. Follow `publishing-workflow.md`; record per `change-management-governance.md`.

## 7. Publishing checklist
☐ One H1 ☐ Title/meta/canonical ☐ Logical H2/H3 ☐ Primary CTA ☐ Internal links ☐ Accessible ☐ Provenance on data ☐ Estimates labeled ☐ Legal-reviewed if claims ☐ 301 redirect on retire.

## 8. Anti-patterns
Multiple/zero H1s; duplicate titles; competing CTAs; orphan pages; retiring without a redirect; claims without review; thin programmatic pages.

## 9. Evidence notes & gaps
Nav taxonomy confirmed; the exhaustive page list is **Not confirmed from the uploaded files**.

---

## Deep context (2026-06-30) — page standards & feature landing pages

The site spans **feature landing pages**, county pages, glossary pages, blog posts, and the presentation site (Next.js). Each page is a governed surface.

**Per-page standards (MUST):** exactly one **server-rendered H1**; unique title/meta/canonical; logical H2/H3; one primary CTA aligned to the funnel (search/claim/sign-up); internal links to glossary/pillar pages; accessible (labels/contrast/focus/keyboard); performant (Core Web Vitals, optimized images/JS); any data shown carries **source + vintage**; **estimates labeled** (P3); **Texas-scoped** (P1).

**Feature landing pages:** explain a single feature (map, claim, reports, operator hub, data coverage) with accurate capability claims — **no overstatement** (P2) of coverage or accuracy; screenshots reflect current UI (`design-ux-and-screenshot-governance.md`).

**Lifecycle:** new/changed pages pass the publish gate (`publishing-workflow.md`) and the QA launch/update checklist; replaced URLs get a 301; stale figures are refreshed on the maintenance cadence.
