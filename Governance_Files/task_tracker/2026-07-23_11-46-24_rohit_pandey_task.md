# Task Tracker

## Employee
Rohit Pandey

## Created Date
23 July 2026

## Created Time
11:46 AM IST

## Created At
2026-07-23 11:46 AM IST

## Created By
Unknown

## Task Description

Yesterday's Work Summary

1. User Behavior Tracking & Website Monitoring

- Monitored newly registered users in Cerebro and verified their activity across the website.
- Reviewed each new user's journey to determine whether they had claimed any mineral leases and documented the number of successful lease claims.
- Tracked new lease claim requests submitted through the platform and updated the internal tracking sheet with the latest information.
- Verified paid user activity, monitored feature usage, and reviewed their interactions with the platform.
- Checked all new inquiries submitted through the **Contact Us** form and documented the relevant details for follow-up.
- Updated the daily tracking sheet with user registrations, lease claim requests, paid user activity, and customer inquiries.
- Monitored **Google Analytics** to review website traffic, user engagement, and other key performance metrics.
- Analyzed **Google Search Console** data to monitor search performance, indexing status, impressions, clicks, and CTR trends.
- Shared the latest Analytics and Search Console updates with the team through the designated communication channels.
- Reviewed **Microsoft Clarity** session recordings to analyze user navigation patterns, click behavior, scroll depth, and overall interaction flow.
- Identified usability issues and user friction points, documented key observations, and communicated important findings to the development team for further investigation and improvement.

2. Owner Dossier Validation & 2025 County Data Analysis

2025 CAD Data Validation

- Performed a detailed validation of the newly available **2025 County Appraisal District (CAD)** ownership dataset before regenerating owner dossier reports.
- Compared the current production ownership data with the new 2025 dataset to verify whether previously identified duplicate ownership records had been resolved.
- Confirmed that the duplicate-record issue was successfully corrected by validating ownership values against actual customer claim records using a real customer account.
- Verified that the corrected ownership percentages in the 2025 dataset matched the claim records, demonstrating that the previous production data contained duplicate ownership entries rather than legitimate ownership changes.

Dataset Completeness Review

- Audited the overall completeness of the 2025 ownership dataset by comparing it with the current production database.
- Measured county-level coverage and identified that the 2025 collection currently contains ownership data for only a portion of Texas counties, indicating that the data load is still incomplete.
- Identified numerous counties that are not yet available in the 2025 collection and confirmed that the missing data is due to an incomplete data load rather than formatting or import errors.
- Assessed the impact of the incomplete dataset across existing owner dossiers by comparing claimed leases against available 2025 ownership records.
- Identified multiple customer accounts whose ownership information would be incomplete or unavailable if dossier regeneration proceeded before the remaining county data is loaded.
- Investigated additional ownership anomalies where lease records existed in the new dataset but specific owner records were missing, documenting these findings for follow-up with the data team.

Portal Alignment & Regeneration Planning

- Evaluated whether dossier regeneration should proceed immediately or wait until the production portal is updated to use the 2025 ownership collection.
- Determined that regenerating dossiers before the portal migration would create inconsistencies between owner reports and the information displayed inside the live application.
- Recommended delaying dossier regeneration until both the 2025 county data load is complete and the production portal has been migrated to the same dataset, ensuring consistency between customer-facing reports and portal data.

Performance & Database Review

- Reviewed query performance against the new **Mineral_Owners_Data_2025** collection.
- Identified that lease lookups currently perform full collection scans because the required compound index is not yet present.
- Recommended adding a compound index on **districtcode + leasenumber** before the portal begins using the new collection to improve query efficiency and prevent unnecessary performance degradation during live owner lookups.

Data Quality Review

- Identified changes in the owner-number assignment methodology between the current production dataset and the 2025 collection, where individual owners may now appear under multiple owner identifiers despite representing the same owner record.
- Documented this behavior for clarification with the data engineering team to determine whether the change is intentional as part of the 2025 data migration.
- Compared owner address fields between the two datasets and identified that address normalization has not yet been applied in the 2025 collection.
- Confirmed that owner names appear standardized while address fields currently remain in their raw imported format, documenting the observation for future data-cleaning improvements.

---

Generated by Governance Workbench
