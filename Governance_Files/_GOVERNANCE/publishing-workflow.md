# Publishing Workflow

> **Status:** ENHANCED (deep) · **Owner:** Content/Product · **Final approver:** Ryan (claims/legal/pricing/methodology) · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly · **Companion:** `change-management-governance.md`, `incident-and-rollback-governance.md`, `quality-assurance-checklists.md`, `claim-risk-register.md`.

---

## 1. Purpose & scope
Define the **end-to-end workflow** for publishing or changing public content, pages, or features, with explicit owners and gates so nothing claim-laden ships unreviewed. The workflow exists because the platform's outputs are claims about real assets — the cost of an unreviewed wrong claim is high, so the path is deliberately gated.

## 2. Workflow & owners
| Stage | Owner | Gate / output |
|---|---|---|
| Request | requester | scope + evidence + claim-risk level |
| Draft | content/product | grounded, brand-voice, estimates labeled |
| Product review | product | behavior-accurate, tier-correct (persona × tier) |
| SEO review | SEO | title/meta/slug/canonical/links/schema |
| Design/UX review | design | tokens, responsive, one CTA, no PII in assets |
| Engineering review | eng | code/perf/security, no secrets/PII |
| Accessibility review | frontend | a11y checklist |
| Legal/compliance review | legal | **required** for claims/legal/pricing |
| Stakeholder approval | **Ryan** | **required** for claims/pricing/legal/methodology |
| Pre-launch QA | QA | consolidated checklist |
| Publish | eng/content | metadata + redirects updated |
| Post-launch monitoring | owner | errors / SEO / conversion window |

## 3. Fast paths vs full path
Non-claim copy/SEO edits take a fast path (content-lead sign-off only). Anything touching a **claim, price, legal statement, methodology description, or data figure** takes the **full path** ending at Ryan, classified via `claim-risk-register.md`.

## 4. Rollback / escalation
Any failure triggers rollback (`incident-and-rollback-governance.md`); claims/legal/security issues escalate to Ryan immediately.

## 5. Worked example
A new "How MVestimate works" page → drafted by content → product confirms behavior → SEO sets title/meta → legal reviews the value-claim language (High risk) → Ryan approves → QA runs the page + claim checklists → publish with provenance/vintage and the estimate disclaimer → monitor.

## 6. Checklist
☐ Evidence cited ☐ Claim-risk classified ☐ Reviews complete ☐ Legal if claims ☐ Ryan if pricing/legal/methodology ☐ QA passed ☐ Metadata/redirects updated ☐ Monitored.

## 7. Anti-patterns
Shipping claims without legal/Ryan; skipping QA; publishing without metadata/redirects; no post-launch monitoring; using the fast path for a claim.

## 8. Evidence notes
Workflow synthesized from the governance roles + the constitution's change rules; refine org-specific steps as confirmed.

---

## Deep context (2026-06-30) — the publish gate (every public surface)

Anything customer-facing — blog, glossary, page, news, video description, testimonial — passes one governed publish gate before going live.

**Pre-publish checklist (MUST):**
- **Accuracy:** facts sourced/dated; oil & gas terms canonical; figures carry source + vintage; **estimates labeled** (P3).
- **Scope & claims:** Texas-only framing (P1); **no overstatement** (P2); no investment/legal advice (`Compliance_And_Disclaimers.md`); **legal-reviewed** if it makes a claim.
- **SEO/structure:** one H1, unique title/meta/canonical, logical headings, internal links, schema where relevant.
- **Accessibility & performance:** labels/contrast/focus/keyboard; image optimization; Core Web Vitals (`accessibility-governance.md`, `performance-and-technical-seo-governance.md`).
- **Brand:** matches voice (`Customer_Communication_Style_Guide.md`).
- **Redirects:** 301 plan if a URL is replaced.

**Roles:** writer drafts → editor/SEO reviews → legal reviews claims → publisher ships → analytics confirms. **AI-assisted drafts and trending-automation (Trendelier) output always require a human review step before publish.** Corrections are issued promptly and visibly.
