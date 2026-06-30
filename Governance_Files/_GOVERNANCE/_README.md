# Mineral View — Governance Documentation System

> Status: ENHANCED (v2.0 — preserves and expands the existing 36-file `_GOVERNANCE` corpus)
> Owner: Ryan Cochran (final governance authority, Mineral View, LLC)
> Maintained by: Nikhil Salunke (backend / platform)
> Last Updated: 2026-06-23

---

## 1. Purpose

This governance system defines **how the Mineral View website and platform are allowed to change** — across product claims, data pipelines, APIs, frontend, content/SEO, legal/compliance language, Texas oil-and-gas positioning, analytics, publishing, and future AI-generated edits.

It exists so that any contributor — a developer, content editor, SEO specialist, product manager, data engineer, legal reviewer, executive, or AI agent — can answer three questions before they change anything:

1. **Is this change allowed, and who must approve it?**
2. **What is the canonical source of truth for this fact or claim?**
3. **What must be reviewed, tested, or disclaimed before it ships?**

This is an **operational handbook**, not a marketing document. Every rule should be enforceable and traceable to evidence.

## 2. Scope

In scope: the public website (`Mview-Presentation-Next`), the owner/professional portal and its backends (`MViewPortalAPI`, `MviewMapAPI`, `PresentationSiteAPI`), the internal admin (`Mview-Cerebro-web`), the analytics/methodology repos (decline-curve and MVestimate engines), the data stores (PostgreSQL production + MongoDB analytics), the content engine (Blog, FAQ, Glossary, News), and all customer-facing claims, pricing, and legal text.

Out of scope: BOLD Precious Metals (a sibling Cochran business cross-linked in the public footer only — context, not Mineral View product scope) and any non-Texas data product. Texas is the canonical data scope.

## 3. Who should use this, and how

| Role | Start here |
|---|---|
| New engineer | `repository-and-codebase-governance.md` → the repo-specific file (`backend-api-governance.md`, `frontend-governance.md`, `map-gis-governance.md`, `admin-and-cerebro-governance.md`) |
| Data engineer | `data-architecture-governance.md` → `database-source-inventory.md` → `data-provenance-and-lineage-governance.md` |
| Content / SEO | `content-governance.md` → `blog-and-seo-content-governance.md` → `seo-governance.md` |
| Product manager | `product-and-feature-governance.md` → `pricing-and-plan-governance.md` |
| Legal / compliance | `legal-compliance-and-claims-governance.md` → `privacy-and-data-use-governance.md` |
| Executive / stakeholder | `business-model-and-product-positioning.md` → `brand-and-messaging-governance.md` |
| AI agent | `ai-agent-instructions.md` (read first, every time) |

## 4. Document map

The corpus is organized into nine bands. The authoritative file inventory and enhancement status lives in `governance-enhancement-summary.md`.

| Band | Files |
|---|---|
| **Foundation** | `README.md`, `master-governance-architecture.md`, `governance-constitution.md`, `maintenance-cadence-and-ownership.md` |
| **Business & brand** | `site-overview.md`, `business-model-and-product-positioning.md`, `brand-and-messaging-governance.md` |
| **Engineering** | `repository-and-codebase-governance.md`, `frontend-governance.md`, `backend-api-governance.md`, `admin-and-cerebro-governance.md`, `map-gis-governance.md`, `security-governance.md`, `release-and-deployment-governance.md` |
| **Data** | `data-architecture-governance.md`, `data-provenance-and-lineage-governance.md`, `database-backup-and-archive-governance.md`, `rrc-data-governance.md`, `database-source-inventory.md` |
| **Analytics & methodology** | `mvestimate-governance.md`, `decline-curve-methodology-governance.md`, `analytics-layer-governance.md` |
| **Product** | `product-and-feature-governance.md`, `owner-portal-governance.md`, `reporting-products-governance.md`, `pricing-and-plan-governance.md`, `operator-directory-governance.md` |
| **Content & SEO** | `content-governance.md`, `page-governance.md`, `blog-and-seo-content-governance.md`, `seo-governance.md`, `faq-and-glossary-governance.md`, `news-and-regulatory-feed-governance.md`, `texas-oil-and-gas-domain-governance.md` |
| **Legal, trust & UX** | `legal-compliance-and-claims-governance.md`, `privacy-and-data-use-governance.md`, `terms-billing-and-refund-governance.md`, `testimonials-and-social-proof-governance.md`, `contact-information-governance.md`, `design-ux-and-screenshot-governance.md`, `accessibility-governance.md` |
| **Operations & meta** | `publishing-workflow.md`, `change-management-governance.md`, `quality-assurance-checklists.md`, `incident-and-rollback-governance.md`, `analytics-and-measurement-governance.md`, `ai-agent-instructions.md`, `open-questions-and-evidence-gaps.md`, `governance-enhancement-summary.md`, and the source inventories (`repo-inventory.md`, `spreadsheet-source-inventory.md`, `screenshot-inventory.md`, `glossary-terms-reference.md`, `feature-inventory-reference.md`, `claim-risk-register.md`) |

## 5. Source-of-truth hierarchy (canonical)

When two sources conflict, the higher row wins. This hierarchy is binding across the whole corpus.

| Rank | Source |
|---|---|
| 1 | Legal documents & compliance policies (Terms, Privacy Policy) |
| 2 | Governance constitution, non-negotiables, master architecture |
| 3 | Production code & active repo branches |
| 4 | Database backups & data schemas (PostgreSQL, MongoDB) |
| 5 | Product screenshots |
| 6 | Product / feature specifications |
| 7 | Published website content |
| 8 | Spreadsheets (Blog, FAQ, Glossary, News) |
| 9 | Historical / "old content" documents |
| 10 | Inferred recommendations |

**Exclusion (binding):** the pricing section of the old "master feature spec" / old content doc must **not** be used as a pricing source. Pricing is governed only by confirmed product screenshots and code (`SUBSCRIPTION_PLAN_MAP`). See `pricing-and-plan-governance.md`.

## 6. How existing governance was preserved and enhanced

The original 36-file `_GOVERNANCE` corpus (~18.8k words) is the **foundation**, not a draft to be replaced. The enhancement rules:

- **Must** preserve existing purpose, wording, rules, structure, terminology, and the four logs (findings, priority questions, decision log, security register).
- **Must** enhance existing files in place rather than create overlapping duplicates.
- **Must** mark every conflict and resolve it via the source-of-truth hierarchy above.
- **Do not** flatten detailed files into summaries or erase governance history.

> Evidence note: in the session that produced v2.0, the original `_GOVERNANCE.zip` files were available as analyzed summaries, not as re-read source text. Any file that claims to "preserve existing wording" must be reconciled against the original `_GOVERNANCE.zip` before adoption. This is tracked in `open-questions-and-evidence-gaps.md`.

## 7. Maintenance & ownership

Full detail in `maintenance-cadence-and-ownership.md`. Summary: every file names an owner and a review cadence; Ryan Cochran is the final approver for any change to non-negotiables, public claims, pricing, legal language, or data methodology descriptions. Routine engineering and content changes follow the per-band review matrix.

## 8. How to propose an update

1. Open a change request (see `change-management-governance.md`) describing the change, the affected files, and the evidence.
2. Route to the reviewers named in the affected file(s).
3. For constitution / non-negotiable / pricing / legal / methodology changes, obtain Ryan's explicit approval.
4. Record the change in the **decision log** and update the file's `Last Updated` line.

## 9. How AI agents must use this system

Read `ai-agent-instructions.md` before any edit. In short: canonical sources only, never invent facts, write `Not confirmed from the uploaded files.` when evidence is missing, never touch excluded pricing content, preserve brand voice, and require human legal review for compliance-sensitive language.

## 10. Canonical source materials (provided inputs)

See `repo-inventory.md`, `database-source-inventory.md`, `spreadsheet-source-inventory.md`, and `screenshot-inventory.md` for the full grounded inventory of the 27 inputs this corpus is built on.
