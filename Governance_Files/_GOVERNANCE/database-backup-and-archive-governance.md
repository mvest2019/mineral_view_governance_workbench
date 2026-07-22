# Database Backup & Archive Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Final approver:** Ryan Cochran · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on each backup · **Companion:** `security-governance.md`, `privacy-and-data-use-governance.md`, `database-source-inventory.md`.

---

## 1. Purpose & scope
Govern how PostgreSQL and MongoDB backups are **created, named, stored, restored, and protected**. Backups are the highest-density risk artifact on the platform: a single dump can contain millions of PII rows and live credentials.

## 2. Backup security (MUST)
- Backups containing PII or credentials are **encrypted at rest** and **access-controlled**.
- **Do not** place backups in shared/uploads or public storage. (The 2026-06 Postgres backup `MviewDownload` contained PII **and** the `dblink_config` plaintext credentials — the exact pattern to prevent.)
- `dblink_config` and any credential-bearing artifact are **excluded** from exports (backup deny-list).
- Treat any backup that ever held secrets as compromised until those secrets are rotated.

## 3. Naming & vintage
Names encode store + date (e.g., `June_2026_Mongo_DB_Backup`, `MviewDownload` Postgres). Multi-part splits document the reassembly method (this Postgres backup = raw 3-part split, reassembled via `cat part1 part2 part3 > combined.zip`; part 1 carries the `PK\x03\x04` header).

## 4. Restoration documentation
Each backup has restore steps + a post-restore validation checklist. Restores into non-prod **must not** expose real PII without controls.

## 5. Retention
Define retention windows for PII-bearing backups and a disposal schedule. **Not confirmed from the uploaded files** — Ryan/legal to set the policy.

## 6. Post-restore validation
☐ Row counts match expected (e.g., Postgres ~28M+ rows / 85 tables) ☐ Keys join across stores ☐ No corruption ☐ PII access restricted ☐ Secrets excluded/rotated.

## 7. What must never be published
Bulk PII; credentials; internal config; raw backups. Public surfaces serve only governed, provenance-labeled aggregates/estimates.

## 8. Anti-patterns
Backups in shared/uploads; exporting `dblink_config`; unencrypted PII dumps; undocumented split/reassembly; restoring real PII into open staging.

## 9. Evidence notes & gaps
Postgres backup shape (3-part split, 85 tables, ~4.75 GB, ~28M+ rows) confirmed this session; Mongo backup from prior session. Retention policy not yet defined.

---

## Confirmed backup mechanism (from team work, 2026-06)
An **automated PostgreSQL backup solution** is in place (built by Vaishnavi): scheduled backup
generation with storage management, and **backup uploads to Google Drive** for offsite storage,
reducing manual intervention and improving recovery readiness.

Governance implications (MUST):
- Because the PostgreSQL backup contains **PII at scale** (~4.1M owner identities) and previously
  contained the `dblink_config` plaintext credentials, any backup uploaded to Google Drive **must**
  be encrypted, access-restricted, and stored in a controlled (non-public, non-shared) Drive
  location — and `dblink_config`/credentials **must** be excluded from the dump (F-DB-014).
- Confirm the Drive account/folder access scope, retention window, and encryption for these offsite
  backups (still to be set by Ryan/Nikhil).

---

## Deep context (2026-06-30) — automated backup & recovery (implemented)

An **automated PostgreSQL backup** solution is in place (built by the backend/infra team): **scheduled** backup generation, local storage management, and **offsite upload to Google Drive** for disaster recovery — reducing manual intervention and improving recovery readiness and backup monitoring.

**Rules (MUST):**
- **Scope:** Postgres is the system of record — its backup is the critical path; Mongo (derived/serving) and any GIS file geodatabases are backed up per their rebuild cost.
- **Schedule & retention:** backups run on a defined schedule with a stated retention window; the **offsite (Google Drive)** copy is the disaster-recovery anchor and must remain access-controlled (no public links).
- **Monitoring:** backup success/failure is monitored and **alerts on failure** — a silent missed backup is a governance incident.
- **Restore drills:** periodically **test-restore** to prove recoverability (a backup that has never been restored is unproven).
- **Security:** backup artifacts may contain owner/financial data — encrypt/restrict per `privacy-and-data-use-governance.md` and `security-governance.md`; never commit backup credentials to code.
- **Governance data:** the governance corpus + `governance.db` (Workbench reviews/approvals) are included in backup scope so the approval trail survives recovery.

---

## Addendum (2026-07-02) — verified backup scope from the June export

The June 2026 backup confirms the real shape of what must be protected (see `database-and-schema-governance.md` / `database-schema-reference.md`): **~30 GB across ~526 tables**, dominated by **`MviewDownload/rrc_og_production` (~22 GB)** — the RRC production/disposition history (the crown jewels).

**MUST (scope checks):**
- The automated PostgreSQL → Google Drive backup must capture the **entire `MviewDownload` warehouse (~28.5 GB)**, not just the small `public` schema — confirm the dump includes it.
- The backup contains **PII + password hashes** (`members_entity`) and payment references (Braintree) — the offsite copy stays **encrypted and access-controlled** (no public Drive links).
- Include the **governance corpus + `governance.db`** so the approval trail survives recovery.
- **Test-restore** at ~30 GB scale periodically and record restore time as a DR metric.
- **MongoDB and Redis** (serving/cache) are not in this PostgreSQL backup — confirm their DR coverage separately.
