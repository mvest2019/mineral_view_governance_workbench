# Governance Workbench — MongoDB Migration Design Document

> **Status:** Design / planning only · **Companion to:** `MONGODB_V1_SPECIFICATION.md`,
> `MONGODB_V1_GAP_ANALYSIS.md`
> **Purpose:** Define exactly how existing data (GitHub markdown + SQLite + config) will be migrated
> into the provisioned `GovernanceDB` collections.
> **This document contains NO migration code.** Nothing here modifies application code, connects a
> migration into the app, or moves any data. GitHub + SQLite remain the source of truth until a
> separately-approved migration run is executed.

---

## 0. Migration principles

1. **GitHub-markdown-first.** On Vercel the SQLite DB lives in ephemeral `/tmp`, so for features that
   also write to GitHub (Task Tracker, Priority answers, generated questions, meeting uploads), the
   **GitHub markdown is the authoritative source**. SQLite is authoritative only where it is the sole
   store (intake, meetings DB, repo classification, team-member files/questions, AI runs).
2. **Sources are read-only.** The migration never mutates GitHub or SQLite. It reads, transforms, and
   writes to `GovernanceDB` only.
3. **Idempotent.** Every write is an upsert keyed on a natural key or a deterministic dedupe key, so a
   re-run repairs rather than duplicates.
4. **Validated twice.** Every candidate document passes the model edge-validator *and* the collection
   `$jsonSchema` before it is accepted.
5. **Batch + resumable.** Work is processed in bounded batches with progress persisted, so a failure
   resumes from the last committed batch.
6. **Auditable.** Every batch, skip, and error is logged; a reconciliation report proves completeness.

---

## 1. GitHub folders that contain data

All under the repository root `Governance_Files/` (plus `lib/config.ts` for config-derived data).

| # | Path | Contents | Format |
|---|---|---|---|
| G1 | `Governance_Files/task_tracker/*.md` | Task Tracker entries — `<date>_<time>_<slug>_task.md` | Heading blocks (`## Employee`, `## Task Description`, …) |
| G2 | `Governance_Files/Priority_Questions/<slug>_answers/*.md` | Priority-question answers per member | `Question:` / `Answer:` / `Answered By:` blocks |
| G3 | `Governance_Files/Priority_Questions/_answered_qids.md` | Ledger of answered question ids | one `Q-AI-####` per line |
| G4 | `Governance_Files/_GOVERNANCE/AI_GENERATED_PRIORITY_QUESTIONS.md` | AI-generated priority questions | `### Q-AI-#### — title` blocks w/ `**Employee:**`, `**Priority**`, `**Status:**` |
| G5 | `Governance_Files/Meetings/*.md` | Meeting-upload notes — `<date>_<Title>.md` | `Title:` / `Meeting Date:` / `Team Attendees:` / `Claude Generated Summary:` blocks |
| G6 | `Governance_Files/_GOVERNANCE/team_members/team-member-*.md` | Rich team-member governance profiles | Markdown tables + sections |
| G7 | `Governance_Files/_GOVERNANCE/` findings register (`F-####`), security register | Review findings | `parse_findings()`-style `F-\d+` blocks |
| G8 | `Governance_Files/_GOVERNANCE/repo_sheets/*.md` (+ repo maps) | Per-repo reference sheets | Numbered sections |
| G9 | `Governance_Files/_GOVERNANCE/DECISION_LOG.md`, `*_glossary`, playbooks, `00_MASTER_*`, non-negotiables | Governance corpus (decisions, glossary, playbooks) | Free markdown |
| G10 | `Governance_Files/_GOVERNANCE/_VOICE_MEMOS/*.webm` | Voice memos (binary) | Binary audio |

**Config-derived (from `lib/config.ts`):**

| # | Source | Contents |
|---|---|---|
| C1 | `TEAM_MEMBER_PROFILES` | Employee roster (role, purpose, departments, repos, operating_sources) |
| C2 | `DEPARTMENT_ARCHITECTURE` | Department definitions |
| C3 | `COMPANIES` | The single tenant (`MView`) |
| C4 | `ASPECT_GROUP_RULES` | Repo→aspect-group grouping |
| C5 | `REPO_CATEGORIES` | Classification category vocabulary |

**Migration disposition of the corpus (G6–G10):** For V1, **G7 (findings)** is migrated into
`findings`; **G6 (profiles)** enriches `employees.profile`. **G9/G8 (decisions, glossary, playbooks,
repo sheets)** and **G10 (voice memos not attached to a meeting)** stay file-based in V1 (they map to
future-only collections — see V1 §7); the migration records them in a manifest but does not ingest
them. This is called out so they are not mistaken for missed data.

---

## 2. SQLite tables that contain data

From `lib/db.ts` (file `governance.db`). 24 tables.

| # | Table | Purpose |
|---|---|---|
| S1 | `users` | Vestigial auth table (unused) |
| S2 | `intake` | Intake workflow header |
| S3 | `intake_file` | Files attached to an intake |
| S4 | `workflow_event` | Intake stage-transition events |
| S5 | `gate` | Intake approval gates |
| S6 | `link` | Intake external links |
| S7 | `repo_classification` | Repo classification rows |
| S8 | `ai_run` | AI invocations for intake |
| S9 | `ai_exchange` | AI challenge-loop exchanges |
| S10 | `question_assignment` | Question → assignee |
| S11 | `repo_understanding` | Repo review status/notes |
| S12 | `finding_reviews` | Finding review decisions |
| S13 | `repo_questions` | Repository-scoped questions |
| S14 | `team_member_department_tags` | Member ↔ department tags |
| S15 | `meetings` | Meetings header (+ summary migration cols) |
| S16 | `meeting_attendees` | Meeting attendees |
| S17 | `meeting_action_items` | Meeting action items |
| S18 | `team_member_files` | Uploaded member files |
| S19 | `team_member_file_analysis` | AI analysis of member files |
| S20 | `team_member_questions` | Member-directed questions |
| S21 | `team_member_question_answers` | Answers to member questions |
| S22 | `team_member_question_packets` | Exported question bundles |
| S23 | `team_member_correspondence_log` | Per-member activity log |
| S24 | `team_member_question_ai_run` | AI runs for member questions |

---

## 3. Source → MongoDB collection map

| MongoDB collection | Primary source(s) | Notes |
|---|---|---|
| `tenants`* (future) | C3 `COMPANIES` | Single `MView`; V1 uses `companyKey` string, not a collection |
| `roles` | — (net-new seed) | Seed 5 system roles; no source data |
| `departments` | C2 `DEPARTMENT_ARCHITECTURE` (+ S14 tags) | Tags also feed `employees.departmentKeys` |
| `employees` | C1 `TEAM_MEMBER_PROFILES` + G6 profiles (+ S14 tags) | `memberKey` canonical; removed-employee list → `status:OFFBOARDED` |
| `taskTrackerEntries` | **G1** | GitHub authoritative |
| `priorityQuestions` | **G4** + S20 `team_member_questions` | Dedupe by `questionCode` + `normalizedTitle` |
| `answers` | **G2** + G3 ledger + S21 `team_member_question_answers` | Lossy link — see §7 |
| `questionAssignments` | S10 `question_assignment` | `qid → questionCode` |
| `repoQuestions` | S13 `repo_questions` | 1:1 columns |
| `repositories` | S7 `repo_classification` + C4 aspect groups | Classification **embedded** |
| `findings` | S12 `finding_reviews` + S11 `repo_understanding` + G7 register | Merge three sources |
| `meetings` | S15 + S16 + S17 + **G5** | Attendees/action-items **embedded** |
| `meetingFiles` | S15 `notes_file_path` + G5 uploaded file + G10 memos (meeting-linked) | Bytes → object store |
| `intakes` | S2 + S3 + S4 + S5 + S6 | Files/links/gates/stageHistory **embedded** |
| `aiRuns` | S8 `ai_run` + S19 `team_member_file_analysis` + S24 `team_member_question_ai_run` | Unified |
| `aiExchanges` | S9 `ai_exchange` | Preserves challenge-loop fields |
| `attachments` | S18 `team_member_files` | Bytes → object store; `checksum` dedupe |
| `auditLogs` | S23 `team_member_correspondence_log` | Category `ACTIVITY` |
| `settings`* | `openai_settings` + `local_settings.json` | Secrets → secret manager (not DB) |

\* `tenants` is future-only; `settings` is the one V1 collection still pending implementation.
`team_member_question_packets` (S22) has no dedicated V1 collection — it is migrated as `metadata`
on the exported answers / recorded in `auditLogs`, per V1 §1.

---

## 4. Field-level mapping

Legend: `→` maps to; `⇒` transformed (see §13). The base envelope
(`companyKey, createdAt, createdBy, updatedAt, updatedBy, isDeleted=false, version=1`) is stamped on
every document and is not repeated below. `companyKey = "MView"` for all rows.

### 4.1 `employees` ← C1 `TEAM_MEMBER_PROFILES` (+ G6, S14)
| Source | → Field | Transform |
|---|---|---|
| profile key (e.g. `Ajay_Landge`) | `memberKey` | ⇒ canonicalize to lowercase slug `ajay_landge`; original kept in `aliases[]` |
| `role` | `title` | — |
| `purpose` | `purpose` | — |
| `departments[]` | `departmentKeys[]` | union with S14 tags for the member |
| `repos[]` | `repoScopes[]` | — |
| G6 profile body | `profile.{snapshot,priorities,workCompleted,…}` | ⇒ parse markdown sections |
| (derived name) | `fullName` | ⇒ de-slug / from profile heading |
| removed-employee list | `status` | `OFFBOARDED` if listed, else `ACTIVE` |
| — | `roleKeys` | default `["EMPLOYEE"]` (RBAC enforcement deferred) |

### 4.2 `roles` ← seed
| Seed | → Field |
|---|---|
| `SUPER_ADMIN·ADMIN·MANAGER·EMPLOYEE·VIEWER` | `key`, `name`, `permissionKeys`, `isSystem:true` |

### 4.3 `departments` ← C2 `DEPARTMENT_ARCHITECTURE`
| Source | → Field |
|---|---|
| department key (`DATA_SCIENCE`) | `key` |
| name/description | `name`, `description` |
| (config) | `repoScopes[]`, `parentKey?`, `leadEmployeeKey?` |

### 4.4 `taskTrackerEntries` ← G1
| Markdown label | → Field | Transform |
|---|---|---|
| `## Employee` | `employeeKey` | ⇒ slug |
| `## Created At` | `entryDate`, `createdAt` | ⇒ IST string → UTC `Date` |
| `## Created By` | `createdBy` | ⇒ slug or `"Unknown"→system` |
| `## Task Description` | `bodyMarkdown` | — |
| (parsed sections) | `sections[]` | ⇒ split headings/bullets |
| file path + blob sha | `githubRef.{path,sha}` | reconciliation anchor |
| — | `status` | `SUBMITTED` |

### 4.5 `priorityQuestions` ← G4 + S20
| Source | → Field | Transform |
|---|---|---|
| `### Q-AI-####` id / `question_code` | `questionCode` | dedupe key |
| title | `title`, `normalizedTitle` | ⇒ `normalizeTitle()` |
| `**Employee:**` / `team_member_key` | `targetEmployeeKey` | ⇒ slug |
| body / `body_markdown` | `bodyMarkdown` | — |
| `**1. Short Question**` / `short_question` | `shortQuestion` | — |
| `**6. Priority**` / `priority` | `priority` | ⇒ upper enum |
| `**Status:**` / `status` | `status` | ⇒ enum |
| generator / `generated_by` | `source`, `generatedBy` | `AI_GENERATED`/`MANUAL` |
| `source_file_id` (S20) | `sourceRef` | ⇒ `{collection:'attachments', id}` |
| (computed) | `answerCount` | ⇒ count of linked answers |

### 4.6 `answers` ← G2 + G3 + S21
| Source | → Field | Transform |
|---|---|---|
| question text (G2) / `question_id` (S21) | `questionCode` | ⇒ resolve via ledger/text match (§7) |
| `Answer:` / `answer_markdown` | `answerMarkdown` | — |
| `Answered By:` | `answeredByKey` | ⇒ slug |
| `Answered By:` (raw) | `answeredByName` | snapshot |
| `Created At:` / `created_at` | `answeredAt` | ⇒ IST → UTC |
| `match_confidence` (S21) | `questionMatch.confidence` | else derived (§7) |
| link method | `questionMatch.strategy` | `QID`/`FUZZY_TITLE`/`MANUAL`/`UNLINKED` |
| `accepted_by_ryan` (S21) | `acceptedByKey`, `acceptedAt` | ⇒ if accepted |
| `source_file_id` | `sourceFileId` | ⇒ ObjectId of migrated attachment |
| — | `questionKind` | `PRIORITY` |

### 4.7 `questionAssignments` ← S10
| Column | → Field |
|---|---|
| `qid` | `questionCode` |
| `assignee` | `assigneeKey` ⇒ slug |
| `note` | `note` |
| `updated_at` | `updatedAt` |
| — | `questionKind` (`PRIORITY`/`REPO` by code lookup) |

### 4.8 `repoQuestions` ← S13
`repo_name→repoName`, `question_code→questionCode`, `title→title`, `body_markdown→bodyMarkdown`,
`short_question→shortQuestion`, `priority→priority`⇒enum, `status→status`⇒enum, `source→source`,
`source_ref→sourceRef`, `source_excerpt→sourceExcerpt`, `primary_assignee→primaryAssigneeKey`⇒slug,
`answer_markdown→answerMarkdown`, `review_note→reviewNote`, `reviewed_by→reviewedByKey`,
`created_by→createdBy`, `created_at/updated_at→createdAt/updatedAt`.

### 4.9 `repositories` ← S7 `repo_classification` + C4
| Column | → Field |
|---|---|
| `repo_name` | `name` |
| `observed_purpose` | `classification.observedPurpose` |
| `proposed_category` | `classification.proposedCategory` |
| `confidence` | `classification.confidence` ⇒ enum |
| `canonical_status` | `classification.canonicalStatus` |
| `evidence` | `classification.evidence` |
| `approval_status` | `classification.approvalStatus` ⇒ enum (default `PENDING`) |
| `finding_link` | `classification.findingCode` ⇒ extract code |
| `question_link` | `classification.questionCode` ⇒ extract code |
| `updated_at` | `classification.updatedAt` |
| C4 aspect group | `aspectGroup` |

### 4.10 `findings` ← S12 `finding_reviews` + S11 `repo_understanding` + G7
| Source | → Field |
|---|---|
| `fid` (S12) / `F-####` (G7) | `findingCode` |
| `decision` (S12) | `decision` ⇒ enum |
| `reviewer` | `reviewerKey` ⇒ slug |
| `note`/`review_note` | `reviewNote` |
| `reviewed_at` | `reviewedAt` |
| `repo_name` (S11) | `repoName` |
| `department_key` (S11) | `departmentKey` |
| `next_questions_note` (S11) | `nextQuestionsNote` |
| G7 title/body | `title`, `bodyMarkdown`, `severity` |

> S11 and S12 are merged on `(company, repo_name/fid)`; where only understanding exists, `decision`
> defaults from S11 `status`.

### 4.11 `meetings` ← S15 + S16 + S17 + G5
| Column | → Field |
|---|---|
| `title` | `title` |
| `meeting_type` | `meetingType` |
| `organizer` | `organizerKey` ⇒ slug |
| `meeting_date` | `meetingAt` ⇒ Date |
| `note` | `note` |
| `summary_text/status/engine/generated_at` | `summary.{text,status,engine,generatedAt}` ⇒ enums |
| `priority_questions_json` | `priorityQuestionCodes[]` ⇒ parse JSON |
| S16 rows | `attendees[]` (embedded) ⇒ `{employeeKey,externalName,externalEmail,attended,followUpDone,followUpNote}` |
| S17 rows | `actionItems[]` (embedded) ⇒ `{ownerKey,description,status,dueAt}` |
| migrated meetingFiles | `fileIds[]` ⇒ ObjectIds |

### 4.12 `meetingFiles` ← S15 `notes_file_path` + G5 uploaded file + G10 (meeting-linked)
`notes_file_path/uploaded file → originalFilename` + `storageRef` (⇒ object store upload),
`kind`⇒`NOTES|TRANSCRIPT|AUDIO`, `meetingId`⇒resolved ObjectId, transcript text→`transcriptText`.

### 4.13 `intakes` ← S2 + S3 + S4 + S5 + S6
| Column | → Field |
|---|---|
| `employee` | `employeeKey` ⇒ slug |
| `source_type` | `sourceType` |
| `ai_engines` | `aiEngines[]` ⇒ split |
| `note`, `stage`, `blocker` | `note`, `stage`, `blocker` |
| S3 rows | `files[]` ⇒ `{filename, storageRef, sizeBytes}` |
| S6 rows | `links[]` ⇒ `{kind, ref}` |
| S5 rows | `gates[]` ⇒ `{name,status,approverKey,decidedAt,note}` |
| S4 rows | `stageHistory[]` ⇒ `{stage,at,actorKey,note}` |

### 4.14 `aiRuns` ← S8 + S19 + S24
| Source | → Field |
|---|---|
| `engine` | `engine` ⇒ enum |
| `status` | `status` ⇒ enum |
| `action_type` (S24) / derived (S8/S19) | `actionType` ⇒ enum |
| `started_at/completed_at` | `startedAt/completedAt` |
| `prompt_text/output_text` | `promptText/outputText` |
| `output_path` | `outputStorageRef` ⇒ object store |
| `error_text` | `errorText` |
| `intake_id` (S8) / `member_file_id` (S19) / `team_member_key` (S24) | `subject` ⇒ `{collection,id}` |
| S8 exchange link | `exchangeId` ⇒ ObjectId |

### 4.15 `aiExchanges` ← S9
`intake_id→intakeId`⇒ObjectId, `topic→topic`, `source_engine/target_engine→sourceEngine/targetEngine`,
`status→status`, `source_run_id→sourceRunId`⇒ObjectId, `source_prompt/output→sourcePrompt/Output`,
`target_prompt/output→targetPrompt/Output`, `agreement_status→agreementStatus`,
`next_action→nextAction`, `error_text→errorText`. (`*_output_path` ⇒ object store if present.)

### 4.16 `attachments` ← S18 `team_member_files`
| Column | → Field |
|---|---|
| `original_filename` | `originalFilename` |
| `saved_path` | `storageRef` ⇒ object store key |
| `member_key` | `target` ⇒ `{collection:'employees', id:<memberKey/ObjectId>}` |
| `file_purpose` | `filePurpose` |
| `ai_preference` | `aiPreference` ⇒ enum |
| `size_bytes` | `sizeBytes` |
| `uploaded_by` | `uploadedByKey` ⇒ slug |
| (computed) | `checksum` ⇒ hash of bytes |
| S19 analysis run ids | `analysisRunIds[]` ⇒ ObjectIds |

### 4.17 `auditLogs` ← S23 `team_member_correspondence_log`
| Column | → Field |
|---|---|
| `event_type` | `action` |
| `event_summary` | `summary`, `verb` |
| `actor` | `actorKey` ⇒ slug |
| `team_member_key` | `target` ⇒ `{collection:'employees', id}` |
| `linked_file_id/question_id/packet_id` | `context.{fileId,questionId,packetId}` |
| `created_at` | `at` |
| — | `category` = `ACTIVITY` |

### 4.18 `settings` ← `openai_settings` + `local_settings.json`
`OPENAI_MODEL/keys → settings{scope:'APP', key, value}`; **secret values are NOT stored** — `isSecret:true`
with `value` pointing to the secret manager reference.

---

## 5. Relationship mapping

Legacy stores use integer primary keys and string natural keys; V1 uses **string natural keys** for
cross-aggregate references and **ObjectId** only where the target has no natural key.

| Legacy relationship | V1 representation | Resolution during migration |
|---|---|---|
| `meeting_attendees.meeting_id → meetings.id` | **embedded** in `meetings.attendees[]` | join in-process before writing the meeting |
| `meeting_action_items.meeting_id` | **embedded** in `meetings.actionItems[]` | same |
| `intake_file/gate/link/workflow_event.intake_id` | **embedded** in `intakes.{files,gates,links,stageHistory}` | group child rows by `intake_id`, embed |
| `ai_exchange.intake_id → intake` | `aiExchanges.intakeId` (ObjectId) | via **id crosswalk** (§6): legacy `intake.id` → new `_id` |
| `ai_exchange.source_run_id → ai_run` | `aiExchanges.sourceRunId` (ObjectId) | via aiRuns crosswalk |
| `ai_run.intake_id` | `aiRuns.subject={collection:'intakes',id}` | via crosswalk |
| `team_member_file_analysis.member_file_id` | `aiRuns.subject={collection:'attachments',id}` + `attachments.analysisRunIds[]` | two-pass (files first, then runs, then back-link) |
| `team_member_question_answers.question_id → team_member_questions` | `answers.questionCode` | resolve `question_id → question_code` from S20, then use code |
| `question_assignment.qid` | `questionAssignments.questionCode` | direct |
| `repo_classification.finding_link/question_link` | `repositories.classification.{findingCode,questionCode}` | extract codes from the link strings |
| employee ↔ department | `employees.departmentKeys[]` (+ `departments`) | union config + S14 tags |
| `*.member_key/assignee/reviewer/organizer` | `*Key` string fields | ⇒ slug-canonicalize (single alias map) |

**Crosswalk tables** (built in memory / persisted to `importJobs`): one per collection that others
reference — `intakes`, `aiRuns`, `attachments`, `meetings` — mapping **legacy id → new ObjectId**.
Migration runs in dependency order (§11) so a crosswalk is always populated before a referrer needs it.

---

## 6. ObjectId generation

- **Every migrated document gets a fresh server-standard `ObjectId` `_id`** (generated by the driver
  at insert, or pre-generated in code so references can be wired before insert). ObjectIds are **not**
  derived from legacy ids — they are new, globally-unique, and monotonic-ish by creation time.
- **Legacy identifiers are preserved** for traceability and idempotency: each document carries its
  origin under `metadata.legacy` (e.g. `metadata.legacy.sqliteTable`, `metadata.legacy.id`,
  `metadata.legacy.githubPath`, `metadata.legacy.sha`). This is the audit trail and the re-run key.
- **Reference wiring uses a crosswalk** (`legacyKey → ObjectId`), not id reuse. Two-pass where needed:
  1. Pass 1 — insert parent collections, capturing `legacyId → _id`.
  2. Pass 2 — insert/patch referrers using the crosswalk (e.g. `aiExchanges.intakeId`,
     `meetings.fileIds`, `attachments.analysisRunIds`).
- **Deterministic option (not default):** for strict re-run stability some teams derive a deterministic
  ObjectId from a stable natural key hash. We **do not** do this in V1 — idempotency is achieved by
  upserting on the natural/dedupe key (§7), and the crosswalk is persisted so re-runs reuse prior
  ObjectIds rather than minting new ones.

---

## 7. Duplicate handling

| Mechanism | Applies to | Rule |
|---|---|---|
| **Natural-key upsert** | employees(`memberKey`), roles/departments(`key`), priority/repoQuestions(`questionCode`), repositories(`name`), findings(`findingCode`), questionAssignments(`questionCode`), settings(composite) | `updateOne({key}, {$setOnInsert:…}, {upsert:true})`; re-run updates, never duplicates |
| **Normalized-title dedupe** | `priorityQuestions` | if `questionCode` absent, match on `normalizedTitle`; collision → keep earliest, record merge in log |
| **Answered-qid ledger** | `answers` | G3 `_answered_qids.md` + `question_id` (S21) give the qid where available → `questionMatch.strategy=QID` |
| **Fuzzy title match** | `answers` (G2, write-only markdown carries only question *text*) | normalized-text match to a `priorityQuestions.bodyMarkdown/shortQuestion`; store `questionMatch.confidence`; **low-confidence → leave `questionCode` unset, `strategy=UNLINKED`** for human review (never guess) |
| **Content checksum** | `attachments` | `checksum` of bytes; identical checksum within a target → skip duplicate file record |
| **Crosswalk presence** | all referenced collections | a legacy id already in the crosswalk is not re-inserted |
| **`metadata.legacy` guard** | all | before insert, check no existing doc with the same `metadata.legacy` origin |

Idempotency invariant: **re-running any batch converges to the same document set.**

---

## 8. Validation before insert

Three gates, in order — a candidate that fails any gate is quarantined (§10), never silently dropped:

1. **Transform validation.** Parsers assert required source fields are present (e.g. a task file has an
   `## Employee` and `## Task Description`); malformed source → quarantine with reason `PARSE`.
2. **Edge (DTO) validation.** Each candidate is run through the collection's model validator
   (`validateCreate<Entity>Input`) — the same function the service layer uses — catching enum,
   pattern, and required-field violations with human-readable messages before touching the DB.
3. **Database `$jsonSchema`.** The collection validator (`validationLevel:strict, validationAction:error`)
   is the final gate; because inserts run against the provisioned collection, any transform that
   diverges from the schema is rejected by MongoDB itself.

A **dry-run mode** runs gates 1–2 (and a `$jsonSchema`-only test insert into a throwaway
`*_dryrun` collection, then drops it) across the entire dataset and produces a validation report
**before** any real write — so schema mismatches surface up front, not mid-migration.

---

## 9. Rollback strategy

Layered, from cheapest to strongest:

1. **Sources are untouched.** The ultimate rollback is "keep using GitHub + SQLite" — they are never
   modified, so aborting a migration loses nothing.
2. **Pre-migration snapshot.** Take an Atlas backup / enable PITR immediately before the run;
   restore-to-timestamp reverts `GovernanceDB` wholesale.
3. **Batch tagging.** Every inserted document carries `metadata.migration.batchId` and `runId`. Rollback
   of a run = `deleteMany({ 'metadata.migration.runId': <id> })` per collection (collections were
   empty pre-migration, so this is exact and safe).
4. **Idempotent re-run.** A partial/failed run is corrected by **re-running** (upserts converge) rather
   than manual surgery.
5. **Per-collection drop.** Because provisioning is idempotent, a collection can be dropped and
   re-provisioned + re-migrated in isolation without affecting others.
6. **Feature-flagged cutover.** The app is not switched to read MongoDB until after verification; a
   regression reverts by flipping the flag back to GitHub/SQLite — no data rollback needed.

A documented **decommission gate** (all §12 checks pass, signed off) must be cleared before any source
data is ever deleted.

---

## 10. Logging

| Artifact | Content |
|---|---|
| `importJobs` (collection) | one doc per (collection, batch): `runId`, `collection`, `batchIndex`, `attempted`, `inserted`, `upserted`, `skipped`, `quarantined`, `startedAt`, `finishedAt`, `crosswalkSize` |
| `migrationErrors` (collection) | one doc per rejected record: `runId`, `collection`, `stage` (`PARSE`/`DTO`/`SCHEMA`), `reason`, `sourceRef` (path/table+id), `rawSnapshot` |
| Structured stdout logs | per-batch progress line: processed/succeeded/failed/quarantined + rate |
| Reconciliation report | final: per collection source-count vs. migrated-count, dedupe merges, unlinked answers, quarantine totals |
| `metadata.legacy` on each doc | in-document provenance (source table/path, legacy id, sha) |

All logging is **append-only** and carries the `runId` so a run is fully traceable and diffable
against a prior run. No secrets or full file bytes are written to logs.

---

## 11. Migration order

Strict dependency order so every crosswalk/reference target exists before its referrer:

```
Phase A — Reference data (no dependencies)
  1. (companyKey constant — no collection)   2. roles (seed)
  3. departments                             4. employees   ← needs departments
Phase B — Repository intelligence
  5. repositories        ← needs (aspect groups)            6. findings   ← refs repoName
Phase C — Q&A
  7. priorityQuestions   ← refs targetEmployeeKey
  8. repoQuestions       ← refs repoName
  9. answers             ← refs questionCode (7,8)
 10. questionAssignments ← refs questionCode (7,8)
Phase D — Meetings
 11. meetingFiles (object-store upload) → 12. meetings (embeds attendees/items, refs fileIds)
Phase E — Intake & AI  (two-pass id wiring)
 13. intakes            → 14. aiRuns (subject→intakes/attachments) → 15. aiExchanges (intakeId, sourceRunId)
Phase F — Content & audit
 16. attachments        ← target→employees; back-link analysisRunIds
 17. auditLogs          ← target→employees/questions
Phase G — Platform
 18. settings           (secrets → secret manager)
```

Notes:
- **attachments vs aiRuns ordering:** file-analysis runs (S19) reference `member_file_id`. Insert
  `attachments` first (Phase F precedes the aiRuns back-link), OR run aiRuns in Phase E for intake
  runs and defer file-analysis runs until attachments exist — the crosswalk makes either safe. The
  recommended sequence inserts attachments, then patches `aiRuns.subject`/`attachments.analysisRunIds`.
- Corpus items (G8/G9/G10-unlinked) are **not** migrated in V1 (recorded in the manifest only).

---

## 12. Verification after migration

Run automatically at the end of a run; must all pass before cutover.

1. **Count reconciliation.** For each mapping, `source count (deduped) == migrated count`; deltas
   itemized (with expected dedupe merges reconciled).
2. **Referential integrity.** Every reference resolves:
   - `answers.questionCode` (where set) → a live question; `questionMatch.strategy=UNLINKED` count is
     within the pre-agreed threshold and listed for review.
   - `aiExchanges.intakeId/sourceRunId`, `aiRuns.subject.id`, `meetings.fileIds`,
     `attachments.analysisRunIds`, `repoQuestions.repoName`, `findings.repoName` all resolve.
   - no dangling polymorphic `target`/`subject` pointers.
3. **Business invariants.** `priorityQuestions.answerCount == count(answers by code)`; every meeting
   attendee/action-item present; every finding with a decision has a reviewer where required.
4. **Spot-content checks.** Random-sample N documents per collection and diff normalized source vs.
   migrated field values (title, body, dates round-tripped through IST⇒UTC).
5. **Uniqueness.** No duplicate natural keys (unique indexes already enforce this at insert — verify 0
   duplicate-key errors landed in `migrationErrors`).
6. **Object-store integrity.** Every `storageRef` resolves to a stored object of the recorded
   `sizeBytes`/`checksum`.
7. **Shadow-read diff (pre-cutover).** With the app still on GitHub/SQLite, run the new repository
   read paths in a read-only harness and diff API-shaped responses (old vs. new) for a sample of
   employees/meetings/questions.
8. **Quarantine review.** `migrationErrors` is triaged to zero blocking items; accepted exceptions are
   signed off.

Only after all checks pass and are signed off does the **cutover / decommission gate** open.

---

## 13. Appendix — shared transformation rules

- **Slug canonicalization (`⇒ slug`).** `Title_Case` / `"Pooja Wable"` → `pooja_wable` (lowercase,
  spaces/hyphens→`_`, strip specials). The *original* form is retained in `employees.aliases[]`. A
  single **alias map** built during employee migration resolves every `*Key` reference across all
  collections — the fix for the two-key-format risk.
- **IST timestamp parsing (`⇒ Date`).** Markdown timestamps like `2026-07-20 06:57 PM IST` and
  `20 July 2026` / `06:57 PM IST` are parsed in `Asia/Kolkata` and stored as UTC BSON `Date`.
- **Enum upcasing (`⇒ enum`).** Legacy free/lower values (`open`, `medium`, `Claude`, `PENDING`) →
  V1 enums (`OPEN`, `MEDIUM`, `CLAUDE`, `PENDING`); unknown values → quarantine, not silent default.
- **Markdown section parsing.** Task/meeting/question bodies are parsed with the same block/heading
  conventions the current `lib/helpers.ts` parsers use, preserving `bodyMarkdown` verbatim alongside
  the structured fields.
- **Object-store offload.** File bytes (`saved_path`, `notes_file_path`, `output_path`, `.webm`) are
  uploaded to the object store; only `{provider,bucket,key}` + `sizeBytes` + `checksum` are stored in
  the document (never the bytes — 16 MB cap).

---

## 14. Sign-off

This document is the approved **design** for migrating Governance Workbench data into `GovernanceDB`.
It defines sources, field-level mappings, relationship/ObjectId strategy, duplicate handling,
validation, rollback, logging, order, and verification. **No migration code is written, no data is
moved, and nothing is wired into the application by this document.** A separate, explicitly-approved
implementation step will build the migration against this design, run it in dry-run first, and only
cut over after §12 verification passes.
