# Contact Information Governance

> **Status:** ENHANCED (deep) · **Owner:** Content/Ops · **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly
> **Source:** contact page. **Companion:** `forms-contact-and-conversion-governance.md`, `legal-compliance-and-claims-governance.md`.

---

## 1. Purpose & scope
Keep **contact facts accurate and consistent** on every surface — header, footer, contact page, structured data, transactional emails, and help content. Inconsistent contact facts erode trust (a scam-wary audience notices) and break local-SEO structured data.

## 2. Canonical contact facts (confirmed)
| Fact | Value |
|---|---|
| Phone | (866) 646-8439 |
| Emails | support@mineralview.com / help@mineralview.com |
| Address | Austin, TX |
| Hours | Monday–Friday, 8–5 |

## 3. Rules (MUST)
- Every surface **matches** these values exactly; a change updates **all** surfaces + structured data in a single change.
- Phone is **required + validated** at registration.
- `tel:` and `mailto:` links are correctly formatted and working.
- Verify the current values before publishing any change (do not assume).

## 4. Surfaces to keep in sync
Header, footer, contact page, help/support pages, transactional/monthly emails, LocalBusiness structured data, and any "contact us" CTA.

## 5. Update workflow
Confirm new value → update the single source/component → propagate to all surfaces + schema → QA links → record the change.

## 6. QA checklist
☐ Phone/email/address/hours consistent everywhere ☐ Footer = contact page ☐ Structured data updated ☐ `tel:`/`mailto:` work ☐ Emails route correctly.

## 7. Anti-patterns
Divergent footer vs contact page; stale hours/phone; structured data not updated; broken `tel:`/`mailto:`.

## 8. Evidence notes & gaps
Confirmed from the contact page + prior registration work. Re-verify values before any change.

---

## Deep context (2026-06-30) — contact data accuracy & handling

Covers public contact details (support/sales email, contact forms) and the handling of user-submitted contact data.

**Rules (MUST):**
- **Accuracy:** published contact channels are current and monitored; a "Contact Us" path that nobody watches is a defect.
- **PII handling:** user-submitted contact data is personal data — store, route, and retain per `privacy-and-data-use-governance.md`; never expose it publicly or in analytics; never sell it.
- **Routing & consent:** form submissions route to the right team (sales/support) with any consent captured; CRM ingestion (Pursuit/HubSpot) respects claim-state and consent.
- **Security:** contact endpoints are rate-limited and validated (spam/abuse protection); no contact data in URLs/logs.
- **Consistency:** one canonical set of contact details reused across site/app/footer/legal pages.
