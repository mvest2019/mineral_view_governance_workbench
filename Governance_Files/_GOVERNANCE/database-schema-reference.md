# Mineral View — Production PostgreSQL Backup: Database Analysis

> **Analysed:** 2026-07-02 · **Source:** `Postgress_Production_Backup_June` (11-part RAR, reassembled)
> **Backup taken:** 2026-06-25 · **Archive:** RAR4, non-solid · **Compressed:** ~3.1 GB · **Uncompressed:** ~29.8 GB · **526 table exports**
> **Format:** one tab-separated `.txt` per table, **first row = column names**, CRLF line-endings, empty string = NULL, `true`/`false` booleans.

---

## 1. What this backup is

A **logical, per-table export** of the Mineral View production PostgreSQL database (not a `pg_dump` binary/SQL dump — each table is a standalone TSV with a header row). It is organised into three top-level trees that reflect how the business actually uses the data:

| Tree | Role | Size |
|---|---|---|
| **`Production/public/`** | The **live application database** — users, claims, subscriptions/billing, operators, notifications, pricing, content, analytics. 92 tables. | ~0.95 GB |
| **`MviewDownload/`** | The **data spine / warehouse** — RRC production & disposition, wellbores, W-1 permits, W-2 completions, directional surveys, mineral owners & property, and the well↔lease↔owner linkage. This is where the platform's real oil-&-gas intelligence lives. | ~28.5 GB |
| **`Archive/`** | **Historical snapshots** — prior-year mineral-owner/property versions, older GIS layers, and raw scraped JSON. | ~1.9 GB |

**The single biggest asset by far is `MviewDownload/rrc_og_production/` (~22 GB)** — the Texas RRC lease-cycle production and disposition history. Everything else is small by comparison.

## 2. How the data links together (the model)

The database is keyed around a few identifiers that recur across tables:

- **API-14 well number** (`api14`, `api_no`, `mview_api`, `new_api`) — the unique well identifier; the join key between wellbores, permits, completions, surveys, and linkage.
- **Lease number + district** (`lease_number` + `district_code`/`district_no`) — the RRC lease identity; the join key for production, disposition, leases, and claims.
- **Owner number** (`ownernumber`) — the mineral-owner identity; joins mineral owners to their property and to user claims.
- **Member id** (`member_id`) — the application user; joins users to their claimed leases/owners, subscriptions, and activity.

The **`linkage_data_new`** table (83 columns) is the connective tissue — it ties an API-14 well to its lease, field, reservoir, operator, permit, directional survey (MWD/GYRO), and surface/bottom-hole coordinates. This is the backbone of the map, offset analytics, and reports.

## 3. The live application database (`Production/public`, 92 tables)

**Users & accounts**
- **`members_entity`** (43 cols) — the user table: `member_id, member_type` (e.g. *mineral_owner*), name, email, mailing address, phone, `password`, `membership_planid`, `subscriptionid/subscriptionstatus/issubscriptionpaid`, `registration_date`, `email_verified`, `login_type`, referral codes, profile image. **`members_entity_backup`** is a duplicate snapshot. *(Contains PII + password hashes.)*
- **`member_session`, `user_login_activity`, `user_activity`, `userbehavior`, `usersearchhistory`, `user_notification_settings`, `email_verification`, `invitations`, `cerebro_users`** (internal admin users), **`impersonation_audit`** (act-as-owner audit), **`blocked_ips`**.

**Claims & ownership** (the activation core)
- **`membersclaimedleases`** (17) — a user's claimed/watchlisted leases: `member_id, lease_number, district_code, county, original_decimal_interest, modified_decimal_interest, isclaimed, iswatchlist, claimed_date_and_time, ispaid, ownernumber, ownername`.
- **`memberleases`** (24), **`memberswatchlistleases`** (8), **`claimed_owners`** (9), **`professional_claimed_owners`** (7), **`existing_user_claimed_mineral_owners`**, **`advisor_mineral_owner`**, **`lease_claim_requests`** (16), **`members_entity` ↔ leases/owners`**.

**Subscriptions & billing**
- **`subscription`** (Free / Pro / Premium / Basic), **`subscriptionprices`** (Monthly/Yearly amounts), **`subscriptionplanfeatures`, `subscriptionfeatures`, `sub_features`, `sub_subfeatures`, `sub_subscription_plan*`, `sub_user_feature_access_*`** — the tiered feature/claim-limit model.
- **`subscriptionPayment`, `braintree_payment_response`** (payment processor = Braintree), **`subscription_checkout_logs`** (36), **`enterprise_payment_checkout_track`** (29), **`enterprise_plan_change/inquiries/requirements`**, **`sub_subscription_cancellations`, `sub_subscription_downgrade_requests`, `payment_cancel_process`, `end_subscription_conversion_log`**.
- **Data purchases:** **`purchase_purchaseDataRequest`** (67 cols — per-county data-package orders), **`purchase_insert_purchaseDataDetails`, `purchase_user_payment_emails`, `Request_order`, `largesize_purchasedatarequest`, `pricing`** (per-county record counts + prices for minerals/wells/downloads/surveys/formations/production/reserves), **`pricingmaster`, `county_discounts`, `packages`**.

**Operators, notifications, content, ops**
- **`operator_directory`** (16), **`operator_data`, `operator_data_shalexp`, `operatorcountypages_metatitleanddescription`** — the "Know Your Operators" surfaces.
- **`notification_alert, notification_history, notification_templates, notificationtypes, notification_alert`** — the notifications/agents engine.
- **`landing_pages, leasereportcontent, podcast_info, pricing_faq, send_message, sponsored_advertise, mineral_review, well_icons, countyplaytypes, gp_county, masters_entity, filter_combinations`** — content/config.
- **`apilogs`** (857 MB — API request logs), **`DailySyncLogs, error_log, exceptions`** — ops/telemetry.

## 4. The data spine (`MviewDownload`, ~28.5 GB)

**RRC production & disposition (`rrc_og_production/`, ~22 GB — the crown jewels)**
- **`og_lease_cycle_production_dec_2025`** (32 cols, **~12 GB**) — monthly lease-cycle **production** by `oil_gas_code, district_no, lease_no, cycle_year_month, operator_no, field_no`: oil/gas/condensate/casinghead volumes, allowables, and ending balances, with district/lease/operator/field names. The core production history.
- **`og_lease_cycle_disposition_dec_2025`** (52 cols, **~8.7 GB**) — monthly **disposition** volumes by disposition code (dispcd00–99) for oil/gas/condensate/casinghead — where the produced product went.
- **`og_wellbore_ewa`** (60 cols) — RRC wellbore master: API, county/district, lease/field, operator, well type, depths, shut-in/plug dates, P-5 status, 14(b)2 inactive-well flags, completion dates.
- **`well_status_history`** (61), **`gp_county`** (8).

**Wells, permits, completions, surveys (`public/`, ~4.4 GB)**
- **W-1 drilling permits:** `w1permits` (28), `w1wells` (34), `w1fields` (16), `w1permit_latitude`.
- **W-2 completions:** `w2_completions` (18), `w2_completion_informations` (38), `w2_completionwells` (22), `w2_completionattachment`, `w2_formationrecords/child`, `w2_initialpotential_testdata`, `w2_intervals`, `w2_permittypes`, `w2_fillinginformations`, `completion_form_summary`.
- **Directional surveys:** `directional_survey` (8), `directional_survey_child` (11, 762 MB), `directional_survey_exceptions`.
- **Wellbore & fields:** `new_wellbore_master` (29), `master_county/fields/leases/operators`, `field_report` (40), `field_rules`, `well_count/_new`, `dailyleases`.
- **Mineral owners & property:** `mineralowner_2023/2024` (owner name/address/county), `mineralownerproperty_2023/2024` (**864 MB** — ownership records: `mineralownerid, propertydescription, districtcode, leasenumber, ri` [royalty interest], `ritype, leasename, leaseacres, ownernumber, mineralaccountnumber`), plus county-specific variants.
- **Pricing/market:** `oilgaspricing, oilgashistorydata, oilgasfuturepricingdata, oil_gas_history_future`.

**Scraped operational data (`scrapy_data/`, ~1 GB)** — `surfacelocation` (285 MB), `bottomlocation` (337 MB), `w2_casingrecords, w2_acidfracture, w2_remarks, w2_tubingrecords, w2_linearrecords, w2_fielddata_pressurecalculations`, `production_county*`, `gasmeasurement*`, plus scraper telemetry (`scraper_exceptions, scrape_session_log, scraper_process_log`) and audit tables (`audit_w1permits, audit_w2completions, audit_surfacebottomlocation, …`).

**Linkage (`Linkage_data/`)** — **`linkage_data_new`** (83 cols, 224 MB): the master well↔lease↔owner↔operator↔survey linkage described in §2, including surface/bottom-hole coordinates (NAD27/NAD83), MWD/GYRO survey references, TVD/MD, spud/permit dates, and status.

**Mineral Owner 2025 (`mineral_owner_2025/`, ~1.3 GB)** — 312 per-batch shards of the in-progress 2025 mineral-owner dataset (the "Mineral Owner 2025 cleanup" work), same schema across shards.

## 5. Archive (historical snapshots, ~1.9 GB)
- **`Archive/public/`** — prior-year mineral owner & property snapshots (`archive_mineralowner_2018/2019/2021/2022`, `archive_mineralownerproperty_2018…2022`) and `archive_w1_permit_details` (68 cols); supports the bitemporal "don't lose an asset when RRC restates history" rule.
- **`Archive/gisdata/`** — GIS layers: `gis_rrc_wells, gis_surveylines_2024, gis_surveys, gis_surveystring_2024, gis_leases_centeriod, gis_districts, gis_grids`.
- **`Archive/scrapy_data/`** — raw scraped JSON: `w2_completions_jsondata` (292 MB), `w1form_jsondata`, `w1attachments/comments/exceptions`, `w1permitrestrictions`, etc.

## 6. Sensitivity & governance notes
- **PII present** (governed by `privacy-and-data-use-governance.md`, `security-governance.md`): `members_entity` holds names, emails, mailing addresses, phone numbers, and **`password`** (hashes) + reset tokens; `testusers` and `email_subscribe_users` hold real emails; payment tables hold Braintree references. This backup must be encrypted at rest, access-controlled, and the offsite (Google Drive) copy kept private — consistent with `database-backup-and-archive-governance.md`.
- **RRC-derived data** (`og_*`, `w1*`, `w2*`, wellbore, surveys) is public-record but inherits the **retroactive-restatement** caveat (`rrc-data-governance.md`) — the `dec_2025` suffix is the pull vintage; production values can change between pulls.
- **Backups include the crown-jewel production history (~22 GB)** — its loss/exposure is the top data risk; verify the automated PostgreSQL→Google Drive backup actually captures these `MviewDownload` trees, and periodically test-restore.

## 7. Largest tables
| Table | Size |
|---|---:|
| `rrc_og_production/og_lease_cycle_production_dec_2025` | 12.1 GB |
| `rrc_og_production/og_lease_cycle_disposition_dec_2025` | 8.7 GB |
| `public/mineralownerproperty_2024` | 864 MB |
| `Production/public/apilogs` | 858 MB |
| `public/directional_survey_child` | 762 MB |
| `public/mineralownerproperty_2023` | 357 MB |
| `scrapy_data/bottomlocation` | 337 MB |
| `public/new_wellbore_master` | 325 MB |
| `rrc_og_production/og_wellbore_ewa` | 322 MB |
| `public/w2_completionattachment` | 308 MB |

---

## 8. Full table index (by category, largest first)

### Production/public — 92 tables · 928.4 MB

| Table | Size | Cols |
|---|---:|---:|
| `apilogs` | 857.7 MB | 12 |
| `userbehavior` | 26.5 MB | 10 |
| `DailySyncLogs` | 6.9 MB | 6 |
| `spatial_ref_sys` | 6.8 MB | 5 |
| `operator_data` | 6.1 MB | 8 |
| `membersclaimedleases` | 5.5 MB | 17 |
| `user_activity` | 4.7 MB | 8 |
| `operator_data_shalexp` | 4.3 MB | 5 |
| `purchase_user_payment_emails` | 2.0 MB | 7 |
| `operator_directory` | 1.5 MB | 16 |
| `notification_history` | 1.2 MB | 6 |
| `purchase_purchaseDataRequest` | 948.6 KB | 67 |
| `purchase_insert_purchaseDataDetails` | 735.8 KB | 8 |
| `Request_order` | 494.0 KB | 14 |
| `subscriptionPayment` | 440.5 KB | 13 |
| `member_session` | 359.8 KB | 6 |
| `largesize_purchasedatarequest` | 355.4 KB | 10 |
| `members_entity` | 271.0 KB | 43 |
| `members_entity_backup` | 224.7 KB | 43 |
| `invitations` | 164.3 KB | 7 |
| `gp_county` | 160.8 KB | 11 |
| `exceptions` | 82.1 KB | 5 |
| `send_message` | 73.4 KB | 9 |
| `user_login_activity` | 71.1 KB | 3 |
| `operatorcountypages_metatitleanddescription` | 62.2 KB | 4 |
| `end_subscription_conversion_log` | 59.9 KB | 3 |
| `sub_subscription_cancellations` | 59.6 KB | 5 |
| `braintree_payment_response` | 57.2 KB | 7 |
| `landing_pages` | 54.7 KB | 8 |
| `subscriptionMemberdetails` | 49.1 KB | 8 |
| `memberleases` | 47.4 KB | 24 |
| `sub_subscription_plan_duration` | 45.9 KB | 7 |
| `notification_alert` | 43.8 KB | 13 |
| `blocked_ips` | 43.6 KB | 3 |
| `filter_combinations` | 40.2 KB | 7 |
| `enterprise_payment_checkout_track` | 37.5 KB | 29 |
| `sub_user_feature_access_records` | 37.3 KB | 10 |
| `notification_templates` | 33.9 KB | 4 |
| `error_log` | 30.4 KB | 4 |
| `usersearchhistory` | 30.4 KB | 10 |
| `member_googledrive_folder_id` | 28.8 KB | 8 |
| `pricing` | 26.9 KB | 23 |
| `claimed_owners` | 25.2 KB | 9 |
| `sub_subscription_plan_duration_new` | 23.3 KB | 7 |
| `subscription_checkout_logs` | 20.3 KB | 36 |
| `impersonation_audit` | 15.3 KB | 7 |
| `enterprise_plan_inquiries` | 14.6 KB | 18 |
| `subscription_tools` | 12.5 KB | 3 |
| `well_icons` | 12.5 KB | 4 |
| `sub_user_feature_access_count` | 11.7 KB | 9 |
| `sub_subscription_plan_feature_count` | 11.6 KB | 9 |
| `user_notification_settings` | 10.3 KB | 11 |
| `lease_claim_requests` | 9.1 KB | 16 |
| `email_subscribe_users` | 8.7 KB | 3 |
| `purchaseDataSentmailLog` | 8.4 KB | 3 |
| `packages` | 8.4 KB | 9 |
| `podcast_info` | 7.9 KB | 8 |
| `pricing_faq` | 7.1 KB | 4 |
| `professional_claimed_owners` | 6.8 KB | 7 |
| `notification_templates_temp` | 4.6 KB | 4 |
| `email_verification` | 4.6 KB | 11 |
| `countyplaytypes` | 4.4 KB | 3 |
| `county_discounts` | 3.7 KB | 7 |
| `sub_subfeatures` | 2.0 KB | 8 |
| `masters_entity` | 1.9 KB | 5 |
| `subscriptionplanfeatures` | 1.8 KB | 7 |
| `pricingmaster` | 1.6 KB | 5 |
| `mineral_review` | 1.5 KB | 5 |
| `sub_features` | 1.2 KB | 8 |
| `leasereportcontent` | 1.2 KB | 4 |
| `subscription_plan_request` | 1.1 KB | 10 |
| `sub_subscription_plan` | 724 B | 10 |
| `memberswatchlistleases` | 674 B | 8 |
| `subscription` | 650 B | 9 |
| `subscriptionfeatures` | 589 B | 5 |
| `enterprise_requirements` | 585 B | 12 |
| `subscriptionprices` | 495 B | 8 |
| `existing_user_claimed_mineral_owners` | 402 B | 3 |
| `sponsored_advertise` | 385 B | 10 |
| `sub_subscription_downgrade_requests` | 295 B | 13 |
| `notificationtypes` | 260 B | 3 |
| `sub_subscription_plan_price` | 260 B | 6 |
| `sub_user_payment` | 211 B | 17 |
| `enterprise_plan_change` | 192 B | 15 |
| `activity_summary` | 136 B | 11 |
| `testusers` | 123 B | 2 |
| `advisor_mineral_owner` | 102 B | 10 |
| `visitor_popups` | 78 B | 7 |
| `referral_bonus` | 77 B | 6 |
| `cerebro_users` | 67 B | 3 |
| `payment_cancel_process` | 38 B | 5 |
| `unlimited_access_members` | 35 B | 1 |

### MviewDownload/rrc_og_production — 5 tables · 20.6 GB

| Table | Size | Cols |
|---|---:|---:|
| `og_lease_cycle_production_dec_2025` | 11.8 GB | 32 |
| `og_lease_cycle_disposition_dec_2025` | 8.5 GB | 52 |
| `og_wellbore_ewa` | 321.7 MB | 60 |
| `gp_county` | 8.2 KB | 8 |
| `well_status_history` | 926 B | 61 |

### MviewDownload/public — 55 tables · 4.1 GB

| Table | Size | Cols |
|---|---:|---:|
| `mineralownerproperty_2024` | 864.2 MB | 16 |
| `directional_survey_child` | 762.3 MB | 11 |
| `mineralownerproperty_2023` | 357.1 MB | 15 |
| `new_wellbore_master` | 325.3 MB | 29 |
| `w2_completionattachment` | 308.3 MB | 6 |
| `mineralowner_2023` | 231.0 MB | 8 |
| `w1permits` | 186.6 MB | 28 |
| `w1wells` | 155.5 MB | 34 |
| `w1fields` | 154.1 MB | 16 |
| `w2_formationrecords` | 148.6 MB | 8 |
| `mineralowner_2024` | 125.0 MB | 8 |
| `completion_form_summary` | 80.4 MB | 25 |
| `w2_completion_informations` | 74.2 MB | 38 |
| `w2_permittypes` | 64.7 MB | 5 |
| `w2_completionwells` | 64.5 MB | 22 |
| `w2_completions` | 49.8 MB | 18 |
| `mineralownersdetailsbbycountysitemap` | 48.7 MB | 4 |
| `w1permit_latitude` | 21.5 MB | 5 |
| `w2_fillinginformations` | 21.3 MB | 6 |
| `w2_initialpotential_testdata` | 19.4 MB | 18 |
| `oilgasfuturepricingdata` | 17.1 MB | 14 |
| `master_leases` | 17.1 MB | 7 |
| `directional_survey_exceptions` | 15.4 MB | 5 |
| `w2_intervals` | 14.5 MB | 5 |
| `w2_formationrecordchild` | 10.4 MB | 5 |
| `directional_survey` | 5.7 MB | 8 |
| `mineralownerproperty_tyler_2023` | 3.5 MB | 15 |
| `gastestdata` | 2.8 MB | 15 |
| `master_fields` | 2.6 MB | 5 |
| `master_operators` | 2.4 MB | 5 |
| `dailyleases` | 2.3 MB | 29 |
| `mineralownerproperty_terry_2023` | 1.8 MB | 15 |
| `field_report` | 1.5 MB | 40 |
| `oilgashistorydata` | 868.7 KB | 14 |
| `field_rules` | 339.5 KB | 2 |
| `content_data` | 227.1 KB | 4 |
| `reservoir_playtypes` | 77.2 KB | 4 |
| `oil_gas_history_future` | 47.6 KB | 14 |
| `oilgaspricing` | 24.9 KB | 14 |
| `county_cities` | 19.8 KB | 7 |
| `countyspecific_mineralownerdata` | 19.3 KB | 9 |
| `purchase_county_years` | 16.8 KB | 4 |
| `countyplaytypes` | 12.5 KB | 4 |
| `well_count` | 12.1 KB | 11 |
| `well_count_new` | 9.6 KB | 8 |
| `master_county` | 8.4 KB | 8 |
| `playtypes` | 5.8 KB | 3 |
| `counties` | 3.1 KB | 2 |
| `og_lease_cycle_disposition_dec_2025` | 2.0 KB | 52 |
| `oil_gas_production_well_data` | 1.5 KB | 5 |
| `og_lease_cycle_production_dec_2025` | 1.3 KB | 32 |
| `marketupdates` | 1.1 KB | 8 |
| `attachment_type` | 467 B | 2 |
| `schema_mappings` | 187 B | 14 |
| `dblink_config` | 118 B | 7 |

### MviewDownload/scrapy_data — 27 tables · 967.8 MB

| Table | Size | Cols |
|---|---:|---:|
| `bottomlocation` | 337.0 MB | 19 |
| `surfacelocation` | 285.1 MB | 16 |
| `og_lease_cycle_production` | 114.8 MB | 33 |
| `w2_casingrecords` | 60.8 MB | 14 |
| `og_lease_cycle_disposition` | 28.8 MB | 53 |
| `w2_remarks` | 23.2 MB | 3 |
| `production_county_april` | 19.9 MB | 9 |
| `production_county` | 19.6 MB | 9 |
| `production_county_nov` | 19.5 MB | 9 |
| `w2_acidfracture` | 11.8 MB | 8 |
| `w2_fielddata_pressurecalculations` | 9.7 MB | 9 |
| `invalid_data` | 9.6 MB | 11 |
| `w2_tubingrecords` | 8.5 MB | 5 |
| `audit_w2completions` | 5.9 MB | 7 |
| `audit_w1permits` | 4.6 MB | 8 |
| `audit_surfacebottomlocation` | 3.4 MB | 8 |
| `scrape_session_log` | 2.6 MB | 7 |
| `w2_linearrecords` | 2.5 MB | 11 |
| `audit_productpricing` | 296.9 KB | 9 |
| `scraper_process_log` | 111.8 KB | 8 |
| `audit_marketdata` | 68.4 KB | 7 |
| `well_location` | 14.0 KB | 3 |
| `og_lease_cycle_disposition_dec_2025` | 1.1 KB | 52 |
| `og_lease_cycle_production_dec_2025` | 521 B | 32 |
| `scraper_exceptions` | 116 B | 10 |
| `scraper_exception_log` | 93 B | 8 |
| `scrapy_exceptions` | 58 B | 6 |

### MviewDownload/Linkage_data — 1 tables · 224.4 MB

| Table | Size | Cols |
|---|---:|---:|
| `linkage_data_new` | 224.4 MB | 83 |

### MviewDownload/mineral_owner_2025 — 312 tables · 1.2 GB

312 per-batch shards of the 2025 mineral-owner dataset (same schema). Total 1.2 GB.

### Archive/public — 11 tables · 133.2 MB

| Table | Size | Cols |
|---|---:|---:|
| `archive_mineralownerproperty_2019` | 62.3 MB | 12 |
| `archive_mineralownerproperty_2018` | 22.5 MB | 12 |
| `archive_w1_permit_details` | 17.5 MB | 68 |
| `archive_mineralowner_2019` | 10.7 MB | 6 |
| `spatial_ref_sys` | 6.8 MB | 5 |
| `archive_mineralownerproperty_2022` | 5.0 MB | 14 |
| `archive_mineralowner_2018` | 4.7 MB | 6 |
| `gis_leases_centeriod` | 1.7 MB | 9 |
| `archive_mineralownerproperty_2021` | 1.1 MB | 12 |
| `archive_mineralowner_2022` | 429.4 KB | 6 |
| `archive_mineralowner_2021` | 400.6 KB | 6 |

### Archive/gisdata — 7 tables · 399.1 MB

| Table | Size | Cols |
|---|---:|---:|
| `gis_surveylines_2024` | 174.3 MB | 4 |
| `gis_surveys` | 158.4 MB | 6 |
| `gis_surveystring_2024` | 48.1 MB | 10 |
| `gis_rrc_wells` | 8.7 MB | 8 |
| `gis_districts` | 7.3 MB | 5 |
| `gis_leases_centeriod` | 1.7 MB | 9 |
| `gis_grids` | 499.4 KB | 5 |

### Archive/scrapy_data — 16 tables · 1.2 GB

| Table | Size | Cols |
|---|---:|---:|
| `w2_completions_jsondata` | 292.5 MB | 2 |
| `w1attachments` | 221.9 MB | 7 |
| `w1comments` | 221.4 MB | 5 |
| `w1permitrestrictions` | 154.5 MB | 4 |
| `w1form_jsondata` | 136.1 MB | 2 |
| `w1legalinformations` | 52.7 MB | 13 |
| `w1fieldrestrictions` | 40.5 MB | 5 |
| `w1exceptions` | 30.8 MB | 6 |
| `w2_rrcremarks` | 30.2 MB | 9 |
| `w2_acidfracturechild` | 28.4 MB | 6 |
| `w2_operatorcertifications` | 21.2 MB | 6 |
| `marketupdatesarchive` | 13.6 MB | 8 |
| `gasmeasurement_data` | 7.4 MB | 6 |
| `gasmeasurementdatachild` | 7.2 MB | 13 |
| `w2_fielddata_pressurecalculationschild` | 2.6 MB | 7 |
| `w2completionurls` | 20 B | 3 |
