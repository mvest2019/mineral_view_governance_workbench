# Event-Tracking & Dashboard Governance

> **Status:** ENHANCED (deep) · **Owner:** Product/Growth · **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly
> **Companion:** `analytics-and-measurement-governance.md`, `forms-contact-and-conversion-governance.md`, `privacy-and-data-use-governance.md`.

---

## 1. Purpose & scope
Govern **event naming, conversion tracking, and dashboards** so analytics are consistent, privacy-safe, and decision-useful across the platform's funnels (discover → claim → value → upgrade).

## 2. Event naming (MUST)
Consistent, descriptive snake_case names tied to real surfaces: `signup_completed`, `claim_record_submitted`, `mvestimate_viewed`, `cashflow_viewed`, `report_downloaded`, `upgrade_cta_clicked`, `pricing_page_viewed`, `operator_compared`, `lease_pulse_viewed`. **No PII** in event names or payloads (no owner names, addresses, emails).

## 3. Tracked events
Conversions (signup / claim / upgrade / contact), CTA clicks, form submissions, pricing-page views, blog/content engagement, and product-feature usage (dossier / MVestimate / map / reports / operator tools).

## 4. Dashboards
Each KPI area has an **owner** and a **cadence**; dashboards use canonical metric definitions; conversions tie to the goals in `site-overview.md`. A dashboard without an owner is not maintained and is retired or reassigned.

## 5. Checklist
☐ Consistent snake_case names ☐ No PII in names/payloads ☐ Conversions covered end-to-end ☐ Dashboard owned ☐ Definitions canonical ☐ Consent respected.

## 6. Anti-patterns
Inconsistent/ad-hoc event names; PII in payloads; duplicate metric definitions; unowned dashboards; tracking without consent.

## 7. Evidence notes & gaps
The event list is illustrative, mapped to confirmed surfaces (claim, MVestimate, cash flow, reports, operator tools, pricing); the tracking implementation is **Not confirmed from the uploaded files**.

---

## Deep context (2026-06-30) — event taxonomy & internal dashboards

Events instrument the **owner funnel** and product usage. Grounded in the behavior-tracking work (IP, page visits, engagement, most-visited sections) and the funnel model.

**Event taxonomy (governed):** page_view, search (owner/lease/well/county/operator), claim_started / claim_submitted / claim_verified, portfolio_view, report_download (lease/well/reservoir/owner), map_interaction (filter/popup/permit/completion), notification_view, upgrade_prompt_view / upgrade_completed, community_action. Each event carries: user (or anonymous id), tier, timestamp, and minimal context — **never** raw financial or ownership values.

**Internal dashboards (MUST):** report on activation (first claim), engagement (most-viewed features), conversion (Free→Pro→Enterprise), and geographic reach (country-level). Dashboards are **internal**, access-controlled, and built on **aggregated** analytics — not on per-owner record detail. Event definitions are versioned; renaming/removing an event is a governed change so historical comparisons stay valid.
