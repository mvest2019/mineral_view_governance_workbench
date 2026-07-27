# MongoDB Migration Readiness Report

> **Status:** Review only · **Companion to:** `MONGODB_MIGRATION_DESIGN.md`, the migration framework
> (`migration/`), and the dry-run report.
> **Purpose:** Evaluate the dry-run findings, resolve open data questions, identify remaining risks,
> and decide whether the project is ready to execute the migration.
> **No code was written, no data inserted, no MongoDB/GitHub/SQLite/app modified by this document.**
> Target database remains **GovernanceDB** only.

---

## 0. Dry-run result recap (`--dry-run --all`)

| Collection | read | valid | invalid | duplicates | missing refs | est. docs | source |
|---|---|---|---|---|---|---|---|
| employees | 23 | 23 | 0 | 0 | 0 | 23 | markdown + config ✅ |
| taskTrackerEntries | 107 | 107 | 0 | 0 | 0 | 107 | GitHub markdown ✅ |
| priorityQuestions | 337 | 337 | 0 | 0 | 0 | 337 | GitHub markdown ✅ (4 `CRITICAL` warnings) |
| answers | 273 | 242 | 5 | 15 | 11 | 242 | GitHub markdown ⚠ (see §2–§4) |
| meetings | 3 | 3 | 0 | 0 | 0 | 3 | GitHub markdown ✅ |
| repositories | 0 | 0 | 0 | 0 | 0 | 0 | SQLite **absent here** ⚠ |
| **Totals** | **743** | **712** | **5** | **15** | **11** | **712** | Documents inserted: **0** |

**Headline finding:** the `answers` "invalid" and "duplicate" counts are **framework parser
artifacts, not source-data defects** (proven in §2–§3). Once the reader is hardened, `answers`
becomes materially cleaner. Everything else is genuinely clean.

---

## 1. `CRITICAL` priority values

**Finding.** 4 AI-generated questions carry `**6. Priority** — CRITICAL`
(`Q-AI-0081`, `Q-AI-0082`, `Q-AI-0087`, `Q-AI-0135`). The V1 `PRIORITY` enum is
`LOW · MEDIUM · HIGH · URGENT` — `CRITICAL` is not a member, so the dry-run defaulted them to `MEDIUM`
and warned. Defaulting a *critical* item down to *medium* is the wrong outcome and must be fixed
before execution.

### Option A — Map `CRITICAL → URGENT` (recommended)
- **Pros:** No schema change; no re-provisioning of already-live validators; `URGENT` is already the
  top severity, so the *intent* (highest priority) is preserved; smallest blast radius (touches one
  transform rule in one mapper). Lossless if the original value is preserved in
  `metadata.sourcePriority`.
- **Cons:** Collapses a `CRITICAL`/`URGENT` distinction the source author (Claude) implied; if the app
  later adopts a formal 5-level scheme, the mapping must be revisited.

### Option B — Extend the enum to add `CRITICAL`
- **Pros:** Preserves source fidelity exactly; future-proofs a 5-level scheme.
- **Cons:** Touches `PRIORITY` everywhere it is used — `enums.ts` + the `priorityQuestions` and
  `repoQuestions` `$jsonSchema` validators + their provisioning scripts — and requires a `collMod`
  re-provision of two **already-provisioned** collections; larger surface for a 4-record issue;
  diverges from the approved V1 spec (which fixed the 4-level scale).

### Recommendation
**Option A — map `CRITICAL → URGENT`, preserving `metadata.sourcePriority: "CRITICAL"`** on those
documents. It is lossless (reversible), zero-schema-change, and semantically correct (highest tier).
Revisit Option B only if/when the product formally adopts a 5-level priority scale — at which point
adding `CRITICAL` is a clean, additive change guided by the preserved metadata.

---

## 2. Duplicate answers

**Finding.** The dry-run reported **15 duplicate** answer records (dedupe key = `answeredByKey` +
content-hash of the parsed answer). **Root cause: these are NOT genuine duplicates.** An exact
file-content check found **0** identical answer files. The 15 collisions arise because the dry-run's
**generic markdown parser mis-splits some answer bodies**, producing empty/identical parsed answers
that then collide on the hash (see §3).

**Why apparent duplicates exist.** The priority-answer template is:
```
Answer:
<free-text answer, which may itself contain "Some phrase: …">
```
The framework's `parseLabeledBlocks()` treats any `Capitalized phrase:` line as a *new* label, so an
answer beginning `Based on what flows in: …` is truncated to empty. Multiple empty parses by the same
author collide → false duplicates.

**How to handle during migration.**
1. **Fix the reader first** (§5 R-1): parse priority-answer files with the *fixed field schema*
   (`Question` / `Answer` / `Answered By` / `Answered Date` / `Answered Time` / `Created At`), taking
   the answer as everything between `Answer:` and `Answered By:`. This eliminates the artifact.
2. **Then dedupe on a real key.** Genuine duplicates (should be ~0) are handled by an **idempotent
   upsert** keyed on a deterministic natural key: `sha256(questionCode + answeredByKey + answeredAt +
   answerMarkdown)` stored as `metadata.legacy.dedupeKey`. Re-inserting the same source answer updates
   rather than duplicates.

**Idempotency guarantee.** Because each answer upserts on its content-derived `dedupeKey`, re-running
the migration (in whole or in part) converges to the same set — no duplicate documents, ever.

---

## 3. Empty answer files

**Finding.** The dry-run flagged **5 answers as invalid** (`missing required field: answerMarkdown`).
**These files are not empty** — inspection shows each contains a complete answer (e.g. the
`ajay_landge` 10:54 file has a full multi-sentence answer). They are **false positives from the same
parser limitation** as §2: the answer body began with a `Phrase: …` line and was truncated to empty.
**16 of 273** answer files (~6%) start with a colon-phrase and are at risk of this mis-parse.

### Recommendation: none are truly empty → fix the parser, then re-classify
- **Do not skip and do not quarantine based on the current numbers** — that would drop real answers.
- **Fix the reader** (§5 R-1) and re-run the dry-run. After the fix, re-evaluate:
  - **Genuinely empty** answer files (no text between `Answer:` and `Answered By:`) → **quarantine**
    to `migrationErrors` (reason `EMPTY_ANSWER`) for human review; do **not** insert a blank answer.
  - **Non-empty** (the current 5 + any others) → **migrate normally**.
- **Policy going forward:** truly-empty answers are **quarantined, not skipped silently** — every
  source record is accounted for in the reconciliation report (§ verification), so nothing is lost.

---

## 4. Answers that cannot be linked to a Priority Question

**Finding.** **11 answers** could not be matched to an AI-generated priority question by normalized
title.

**Why they cannot be matched.** Priority-answer markdown files store the **question text**, not its
`Q-AI-####` code. Linking is therefore by normalized-text match against
`AI_GENERATED_PRIORITY_QUESTIONS.md`. The 11 unmatched answers respond to **older/corpus questions
that are not in the AI-generated set** (or whose wording drifted), so no title match exists. (Note:
the true unlinked count may shift after the §5 R-1 parser fix, which also affects the `Question:`
block extraction.)

### Recommendation: back-fill the question from the answer file (no data loss)
Every priority-answer file **contains its own `Question:` block.** So an "unlinked" answer is never
truly orphaned:

1. **Primary — synthesize the question.** For an unmatched answer, create a `priorityQuestions`
   document from the file's `Question:` text with `source: FILE`, a generated `questionCode`
   (e.g. `Q-MIG-####`), `normalizedTitle`, and `metadata.legacy.githubPath`. Dedupe against existing
   questions by `normalizedTitle` (so re-runs don't create clones). The answer then links to that
   `questionCode` with `questionMatch.strategy: MANUAL` (back-filled) or `FUZZY_TITLE`.
2. **Store the answer normally**, carrying `questionMatch: { strategy, confidence }` so the *quality*
   of the link is queryable. Low-confidence links get `confidence: LOW` and a `metadata.reviewNeeded:
   true` flag.
3. **Reviewable later without losing data.** The `answers` collection query
   `{ 'questionMatch.confidence': 'LOW' }` (or `metadata.reviewNeeded: true`) is the review queue.
   Nothing is dropped — every answer is stored and linked (to a real or synthesized question), and its
   link confidence is explicit and auditable.

This is superior to "hold unlinked answers out of the DB" (the design's fallback): it preserves 100%
of the data, makes every answer queryable, and turns "unlinked" into a reviewable attribute rather
than a missing record.

---

## 5. Additional migration risks by collection

| # | Collection | Risk | Severity | Mitigation |
|---|---|---|---|---|
| R-1 | **answers** | Generic markdown parser mis-splits answer bodies containing `Phrase:` (16/273 at risk) → false empties/duplicates | **High (blocker)** | Rewrite the priority-answer reader to the fixed field schema; re-run dry-run before execution |
| R-2 | **repositories** | SQLite `governance.db` is **absent** in this environment (ephemeral `/tmp`), so this collection was **not evaluated** | **High (blocker)** | Run the dry-run in an environment where `governance.db` exists (or point `WORKBENCH_DB_PATH` at a copy); evaluate before execution |
| R-3 | **priorityQuestions** | `CRITICAL` priority (4) — §1 | Medium | Map→URGENT + preserve metadata |
| R-4 | **all** | Slug/alias collisions — two config keys canonicalizing to the same `memberKey`, or answer author names not in roster | Medium | Build the single alias map first (design §13); verify every `*Key` resolves; unresolved authors → `externalName`/review |
| R-5 | **employees** | Roster completeness — 23 from markdown+config; the config `TEAM_MEMBER_PROFILES` count and any `removed-employees` list must reconcile | Medium | Cross-check config vs. markdown; seed removed members as `OFFBOARDED` |
| R-6 | **taskTrackerEntries** | `createdBy` often `"Unknown"`; entries with unparseable IST dates | Low | Map `Unknown → system`; quarantine unparseable dates (none seen in dry-run) |
| R-7 | **meetings** | Only 3 records; attendee names free-text → `externalName` when not in roster (expected, not an error) | Low | Accept; verify attendee slugging |
| R-8 | **answers/priorityQuestions** | The two question families (`team_member_questions` in SQLite) are **not** represented in the markdown-only dry-run environment | Medium | Include SQLite-backed sources when running where the DB exists |
| R-9 | **cross-collection** | Object-store not yet provisioned (attachments/meetingFiles bytes) | Medium (later phases) | Stand up object storage before migrating file-bearing collections |
| R-10 | **execution layer** | Not built — no Mongo writer, `$jsonSchema` gate, `importJobs`/`migrationErrors`, or `rollback.executeRollback()` wiring | Expected | Build in the (next) execution phase, per §Execution Plan |

---

## 6. Migration Readiness Checklist

| # | Item | Status |
|---|---|---|
| 1 | All 18 V1 collections provisioned (validators + indexes) | ✅ (17 provisioned; `settings` pending — not in the 6 dry-run set) |
| 2 | Migration design approved | ✅ |
| 3 | Migration framework built (readers, mappers, validation, dedupe, crossref, report, rollback plan) | ✅ |
| 4 | Dry-run executes with zero writes | ✅ (Documents inserted: 0) |
| 5 | `employees` dry-run clean | ✅ 23/23 |
| 6 | `taskTrackerEntries` dry-run clean | ✅ 107/107 |
| 7 | `priorityQuestions` dry-run clean | ⚠ 337/337 pending `CRITICAL` decision (§1) |
| 8 | `meetings` dry-run clean | ✅ 3/3 |
| 9 | `answers` reader hardened (fixed-field parse) + re-dry-run | ❌ **blocker (R-1)** |
| 10 | `repositories` evaluated where SQLite exists | ❌ **blocker (R-2)** |
| 11 | `CRITICAL → URGENT` mapping (+metadata) implemented in mapper | ❌ pending (§1) |
| 12 | Unlinked-answer back-fill strategy implemented (§4) | ❌ pending |
| 13 | Alias map / slug-collision check | ❌ pending (R-4) |
| 14 | Object storage provisioned (for file-bearing collections) | ❌ pending (R-9, later phases) |
| 15 | Execution layer (writer, `$jsonSchema` gate, `importJobs`/`migrationErrors`, rollback wiring) | ❌ not built (expected) |
| 16 | Pre-migration Atlas PITR snapshot procedure agreed | ❌ pending |

---

## 7. Readiness verdict

**Conditionally ready — NOT yet ready to execute a full migration.**

- **Green (ready to execute as-is):** `employees`, `taskTrackerEntries`, `meetings`, and
  `priorityQuestions` (the last pending only the trivial `CRITICAL→URGENT` mapping).
- **Blocked (must clear before executing that collection):**
  - **`answers` (R-1)** — the reader must be hardened to the fixed-field schema and the dry-run
    re-run; current invalid/duplicate numbers are parser artifacts, not trustworthy.
  - **`repositories` (R-2)** — must be dry-run in an environment where `governance.db` exists; it was
    unevaluable here.
- **Cross-cutting prerequisites before *any* execution:** build the execution layer (item 15), agree
  the pre-migration snapshot (item 16), and finalize the alias map (item 13).

### Still missing (clear list)
1. Fixed-field priority-answer reader + re-dry-run of `answers` (R-1).
2. A dry-run of `repositories` (and other SQLite-backed sources) where SQLite is present (R-2).
3. `CRITICAL→URGENT` mapping with metadata preservation in the priorityQuestions mapper (§1).
4. Unlinked-answer back-fill (synthesize question from the file's `Question:` block) (§4).
5. Alias map / slug-collision verification (R-4).
6. Object storage for file-bearing collections (R-9) — needed before `attachments`/`meetingFiles`.
7. The **execution layer** itself (writer + `$jsonSchema` gate + `importJobs`/`migrationErrors` +
   `rollback.executeRollback()` wiring) — deliberately not built yet.
8. `settings` collection (V1 §3.18) — still unimplemented.

---

## 8. Migration Execution Plan (to apply once §7 items clear)

> Design only — no code, no insert logic. This is the runbook the execution phase will implement and
> follow. Target database: **GovernanceDB** exclusively.

### 8.1 Migration order (dependency-safe)
```
A. roles (seed) → departments → employees
B. repositories → findings
C. priorityQuestions → repoQuestions → answers → questionAssignments
D. meetingFiles (object store) → meetings
E. intakes → aiRuns → aiExchanges
F. attachments → auditLogs
G. settings
```
The 6 dry-run collections slot in as: employees (A), repositories (B), priorityQuestions + answers
(C), meetings (D). Reference targets always precede referrers so crosswalks are populated first.

### 8.2 Batch size recommendations
- **Default 500 documents/batch** (framework default) via ordered:false `bulkWrite`.
- **Small collections** (`employees` 23, `meetings` 3, `repositories`) — single batch.
- **Larger collections** (`priorityQuestions` 337, `answers` ~242, `taskTrackerEntries` 107) — 500 is
  one batch each today; the size matters for future growth, not current volume.
- **File-bearing collections** (`attachments`, `meetingFiles`) — smaller batches (**50–100**) because
  each record triggers an object-store upload; cap concurrency to respect storage/API limits.

### 8.3 Logging strategy
- Per-batch docs in **`importJobs`**: `runId`, `collection`, `batchIndex`, attempted/inserted/
  upserted/skipped/quarantined, timings, crosswalk size.
- Per-rejected-record docs in **`migrationErrors`**: `runId`, `collection`, `stage`
  (`PARSE`/`DTO`/`SCHEMA`), reason, `sourceRef`, raw snapshot.
- In-document provenance: `metadata.legacy.*` and `metadata.migration.{runId,batchId}` on every
  inserted doc.
- Final **reconciliation report** (source-count vs migrated-count per collection, dedupe merges,
  unlinked/quarantined totals). No secrets or file bytes in logs.

### 8.4 Retry strategy
- **Idempotent upserts** on natural/dedupe keys → a failed batch is safely retried whole.
- **Transient errors** (network, election): retry the batch up to **4×** with exponential backoff
  (2s/4s/8s/16s).
- **Per-record isolation** (ordered:false): one bad record quarantines to `migrationErrors`; the batch
  continues.
- **Resumability:** progress persisted to `importJobs` → a re-run resumes from the last committed
  batch rather than restarting.

### 8.5 Rollback strategy
- Sources untouched (ultimate fallback = keep GitHub/SQLite).
- **Atlas PITR snapshot** immediately before the run.
- Per-run reversal: `deleteMany({ 'metadata.migration.runId': <runId> })` per collection (exact,
  since collections start empty).
- Idempotent re-run repairs partial state; per-collection drop + re-provision + re-migrate in
  isolation if needed.
- **Feature-flagged cutover** — app stays on GitHub/SQLite until verification passes; revert = flip
  the flag.

### 8.6 Verification steps after migration
1. **Counts** — source(deduped) == migrated per collection; deltas itemized.
2. **Referential integrity** — every `questionCode`, `repoName`, `intakeId`, `subject.id`,
   `target.id`, `fileIds` resolves; `UNLINKED`/synthesized-question counts within agreed thresholds.
3. **Business invariants** — `priorityQuestions.answerCount == count(answers by code)`; every meeting
   attendee/action-item present.
4. **Spot-content diffs** — sample N/collection; diff normalized source vs migrated (title, body,
   IST⇒UTC dates).
5. **Uniqueness** — zero duplicate-key errors in `migrationErrors`.
6. **Object-store integrity** — every `storageRef` resolves to an object of the recorded size/checksum.
7. **Shadow-read diff** — app still on legacy storage; diff new-repository read paths vs old API
   responses for a sample.
8. **Quarantine triage** — `migrationErrors` reviewed to zero blocking items; exceptions signed off.

### 8.7 Estimated execution workflow
```
1. Freeze a source baseline (pin Git commit + snapshot SQLite if used).
2. Provision `settings` + object storage; take Atlas PITR snapshot.
3. Run execution in DRY-RUN once more (post-fixes) → verify green report.
4. Execute Phase A (roles→departments→employees), verify §8.6 for A.
5. Execute Phases B→G in order, verifying after each phase.
6. Run full reconciliation report; triage quarantine to zero blockers.
7. Enable the read feature-flag for one module; shadow-read diff; expand.
8. After all modules verified + signed off, open the decommission gate.
```

---

## 9. Sign-off

The migration framework and dry-run are complete and **wrote nothing** to MongoDB (Documents
inserted: 0; GovernanceDB only). Four collections are execution-ready; **`answers` and `repositories`
are blocked** pending a parser fix + re-dry-run and a SQLite-present dry-run respectively, and the
execution layer is intentionally not yet built. Once the §7 "still missing" items clear, the §8
Execution Plan is the approved runbook. **GitHub + SQLite remain the source of truth; no code, data,
database, or application was changed by this review.**
