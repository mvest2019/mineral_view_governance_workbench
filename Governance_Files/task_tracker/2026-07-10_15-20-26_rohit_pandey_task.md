# Task Tracker

## Employee
Rohit Pandey

## Created Date
2026-07-10

## Created Time
3:20 PM

## Created By
Unknown

## Task Description

Daily Work Summary

**Date:** July 10, 2026

1. User Behavior Tracking & Website Monitoring

Reviewed the newly registered user cohort in Cerebro and cross-referenced each account against on-site activity to determine post-registration behavior. For each new registration, checked whether the user had progressed to the lease claim step — the platform's core activation event — and recorded the number of claims per user.

Monitored inbound lease claim requests submitted through the website and reconciled them against the tracking sheet. Reviewed paid user activity separately, examining feature-level interactions to distinguish active subscribers from dormant ones. Processed all new Contact Us submissions and documented the relevant details for follow-up.

Consolidated registration, lease claim, paid user, and contact request data into the internal tracking sheet in a single reconciled update.

Pulled Google Analytics and Google Search Console data to track site performance, session activity, and key acquisition metrics, then distributed the findings to the team through the standing communication channels.

Reviewed Microsoft Clarity session recordings to observe real user navigation behavior. This surfaced usability friction points and obstacles encountered during on-site journeys — the qualitative counterpart to the quantitative analytics review above.

2. Claude Database Integration & Validation

**MongoDB.** Established a read-only connection between Claude and the MongoDB database. The initial connection attempt failed; the configuration was reworked and the connection retried, after which it functioned correctly. Verified the working connection and confirmed data accessibility.

Explored the available databases: `Data_Allocation`, `Decline_data_to_web`, `EF_SpAnalysis`, `GeoMapPortal`, and `Linkage_data`. Reviewed collection structure across each and confirmed access to the Texas oil and gas datasets, including county-level collections and well-related records.

**PostgreSQL.** Established and verified a connection to the PostgreSQL server. Explored `Archive`, `MviewDownload`, `Production`, and `spatiotemporal_analysis`. Reviewed the `MviewDownload` schema in detail, covering county-specific mineral owner tables alongside the public well, lease, and production datasets.

**Production database validation.** Explored the `Production` database and reviewed its application-layer tables. Verified key business entities including users, subscriptions, payments, notifications, and activity logs. Validated the subscription plan records and confirmed the pricing structure for the Free, Pro, and Premium tiers matches expectation.

Confirmed end-to-end that Claude can query and correctly interpret both connected database systems, establishing the foundation for future analysis work without repeated setup.

3. Organic Traffic & Performance Data Collection

Worked on the Mineral View Organic Traffic performance report covering November 2025 through July 2026 — a nine-month window across four metrics drawn from three separate systems.

Reviewed the existing reporting sheet and supporting tools to establish where accurate historical figures could be sourced for each month. Collected and organized:

- Organic Traffic (Ahrefs)
- Website Visited Users Count (Google Analytics)
- Mineral Owner Registrations (internal registration data)
- Professional Registrations (internal registration data)

Consolidated the four series into the reporting sheet and validated the assembled dataset for use in performance analysis and future period-over-period reporting.

4. Glossary Content Audit — Joint Operating Agreement

Performed a detailed content audit of the Joint Operating Agreement (JOA) glossary page, evaluating it across factual accuracy, readability, SEO optimization, structural integrity, and overall user value.

The audit identified specific defects rather than general impressions: a verbatim duplicate paragraph, a typographical error rendering "P-4" as "P-$", an unfilled live data placeholder, redundant repetition of Mineral View product callbacks, and missing internal links, external links, and schema markup. Documented the improvement opportunities as line-level recommendations and forwarded the findings to the content team for implementation.

5. Operator Glossary Framework & Audit Standardization

**Framework development.** Shifted away from applying the Mineral Owner glossary framework to operator content, and built a dedicated Operator Glossary framework instead. Audited the initial content structure template and identified where it failed to produce useful operator-facing pages.

Developed an improved structure with dedicated sections for term classification, common mistakes, Texas Railroad Commission regulatory context, operator-specific insight, and structured schema recommendations. Incorporated Mineral View's Operator Hub by mapping all six operator tools into the framework with explicit placement guidelines and interlinking logic, so tool references appear where they serve the reader rather than as generic product mentions.

Finalized the template with standardized operating rules, an internal linking strategy, AI Overview (AIO) enhancements, and documentation suitable for long-term implementation by other team members.

**Audit rubric.** Addressed the underlying reason Operator glossary pages consistently scored lower than Mineral Owner pages during content audits: the existing rubric was constructed around owner-focused educational content and its scoring criteria did not map onto operator-focused pages, which are evaluated on different grounds entirely.

This prompted a strategic repositioning of the Operator Glossary as a Texas oil and gas *data* glossary — emphasizing data-driven insight, benchmarks, regulatory context, and operational diagnostics over basic definitional content.

Built a dedicated Operator Glossary Audit Rubric on a 100-point evaluation system with a 90-point publication threshold. The rubric weights information gain, Texas-specific regulatory context, practical operator value, and data-driven insight, and is deliberately constructed so that structural compliance alone cannot produce a passing score — a page must contain something a reader could not get elsewhere.

---

Generated by Governance Workbench
