# Maintenance Cadence & Ownership

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly (this file).

---

## 1. Purpose & scope
Define **who owns each governance band** and **how often each is reviewed**, plus the trigger events that force a re-review regardless of cadence. A governance corpus that isn't maintained drifts from reality and loses authority; this file is the maintenance contract.

## 2. Ownership matrix
| Band | Owner | Final approver |
|---|---|---|
| Foundation / constitution | Nikhil Salunke | Ryan Cochran |
| Business / brand | Product / Content | Ryan |
| Engineering | Nikhil Salunke | Ryan (security/prod) |
| Data / methodology | Nikhil Salunke + DS SME (Christos Batsios / Gabor Korosi) | Ryan |
| Product / pricing | Product | Ryan (pricing/claims) |
| Content / SEO | Content/SEO Lead | Ryan (claims) |
| Legal / trust / UX | Legal / Design | Ryan |
| Operations / meta | Nikhil Salunke | Ryan |

> Note: the "108" MVestimate repo and the MVestimate governance file are owned by **Nikhil Salunke** (DS SME reviews methodology).

## 3. Review cadence
| Cadence | Tasks |
|---|---|
| Monthly | open-questions register; security register; data freshness; content refresh queue; news-feed freshness |
| Quarterly | inventories (repo / database / spreadsheet / screenshot / feature); pricing; SEO; engineering files; claim-risk register |
| Annual | constitution; legal/compliance; full corpus health check |
| Trigger-based | new backup / repo change / legal change / pricing change / incident → re-review the affected files immediately |

## 4. Documentation health checks
Every file carries status / owner / maintainer / `Last Updated` / evidence notes; no orphaned or duplicate files; the four logs stay append-only; `Last Updated` reflects reality; inventories match the live systems.

## 5. Escalation
Per `master-governance-architecture.md` §8: Engineering → Nikhil → Ryan; Content/claims → content lead → product → legal → Ryan; Data/methodology → DS SME → Nikhil → Ryan; Security/PII → Ryan immediately.

## 6. Evidence notes & gaps
DS SMEs (Christos Batsios, Gabor Korosi) confirmed from repo content (`christos.py`). Other named role assignments are to be confirmed by Ryan (**Not confirmed from the uploaded files**).

---

## Deep context (2026-06-30) — cadence & ownership matrix

**Review cadence (MUST):** governance files — **quarterly** + on related change; data freshness (RRC/scrapers) — **monthly** + on pull; security register — **quarterly** + on any finding; screenshots/content — refreshed when the UI/regulatory facts change; backups — **monitored continuously**, test-restore periodically.

**Ownership matrix (who keeps what current):**
- **Data/methodology, geospatial, governance corpus** — Nikhil (+ Pranav, DS SMEs).
- **Scrapers/source freshness** — Riya.
- **Backend/platform/infra/backups** — Vaishnavi, Sanskriti, Tushar.
- **Frontend/UX/mobile** — Aboli, Pragati, Pooja.
- **QA/release validation** — Utkarsha.
- **Content/SEO/glossary/news/video** — Krishna, Ajay, Rohit, Shubham, Tejas.
- **Sales/CRM/outreach** — Gautammi.
- **Final approval on any governed change** — Ryan.

**Rule:** every governance file names an owner + cadence in its header; an unowned or overdue file is itself a finding surfaced for review.
