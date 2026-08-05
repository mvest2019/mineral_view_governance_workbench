# Migration Framework (dry-run + execute)

Production-ready **migration framework + execution layer** for moving Governance
Workbench data into `GovernanceDB`, per `docs/MONGODB_MIGRATION_DESIGN.md`.

> **`--dry-run`** reads sources, validates, builds documents in memory, detects
> duplicates + missing references, and reports. It **never connects to MongoDB**.
>
> **`--execute`** writes those documents into `GovernanceDB` (idempotent upserts,
> `metadata.migration.{runId,batchId}` on every doc, `importJobs` +
> `migrationErrors` logs, per-batch reconciliation). It connects **only** to
> `GovernanceDB` and requires `--confirm` + `MONGODB_URI`.
>
> **`--rollback <runId>`** deletes every document tagged with that run's id.
>
> The application is **not** switched to MongoDB by this tool — it is a
> standalone, isolated utility. GitHub + SQLite remain the source of truth.

## Modes & CLI

```bash
# read-only, writes nothing
npm run migrate:dry-run -- --all

# write to GovernanceDB (needs MONGODB_URI in .env.local + explicit --confirm)
npm run migrate:execute -- --all --confirm
npm run migrate:execute -- --collection employees --confirm

# undo a run
npm run migrate:rollback -- run-20260723-abcd12 --confirm
```

Execution order (dependency-safe): `employees → repositories → priorityQuestions
→ answers → taskTrackerEntries → meetings`. Answers back-fill synthesized
`priorityQuestions` (`Q-MIG-<hash>`) so no answer is orphaned.

### Execution-layer modules
- `lib/mongoWriter.mjs` — the ONLY module that connects/writes; bound to
  GovernanceDB; idempotent `$setOnInsert` upserts; `importJobs`/`migrationErrors`
  logging; `rollbackRun()`. Dynamically imported only in `--execute`/`--rollback`.
- `lib/finalize.mjs` — stamps the V1 base envelope + `metadata.migration` and
  assigns `_id` via the crossref (pure; no I/O).
- `executor.mjs` — runs mappers with a `sink`, finalizes, batch-upserts, logs,
  and emits a reconciliation snapshot after every batch.

## Guarantees

- **Zero writes.** Dry-run opens no MongoDB connection. The only MongoDB import is
  `ObjectId` (a pure BSON class used for in-memory id estimation). The runner
  *refuses* any non-`--dry-run` mode.
- **Only GovernanceDB is referenced** (by name, in config) — no other database is
  named, opened, or touched.
- **Sources are read-only.** GitHub markdown (`Governance_Files/**`), SQLite
  (`governance.db`, read-only), and `lib/config.ts` are read, never modified.
- **Idempotent.** Dry-run is pure/deterministic; re-running yields the same report.

## Folder structure

```
migration/
├── config.mjs              # paths, batch size, enums, supported collections
├── cli.mjs                 # CLI entry (arg parsing, report output)
├── runner.mjs              # orchestration + reference index; refuses non-dry-run
├── lib/
│   ├── utils.mjs           # slug, IST→UTC, enum upcasing, hashing, markdown parse
│   ├── report.mjs          # report model + console/JSON rendering
│   ├── logger.mjs          # structured logging
│   ├── validation.mjs      # validation pipeline (mirrors $jsonSchema/edge)
│   ├── duplicates.mjs      # duplicate detection
│   ├── crossref.mjs        # ObjectId cross-ref + reference index (in-memory)
│   ├── batch.mjs           # batch processing
│   ├── progress.mjs        # progress reporting
│   └── rollback.mjs        # rollback framework (planned; execution disabled)
├── readers/
│   ├── github.mjs          # GitHub markdown readers (read-only)
│   ├── sqlite.mjs          # SQLite readers (read-only; graceful if absent)
│   └── config.mjs          # lib/config.ts text extraction
├── mappers/
│   ├── employees.mjs
│   ├── taskTrackerEntries.mjs
│   ├── priorityQuestions.mjs
│   ├── answers.mjs
│   ├── meetings.mjs
│   └── repositories.mjs
└── reports/                # dry-run JSON reports (git-ignored)
```

## CLI

```bash
npm run migrate:dry-run -- --all
npm run migrate:dry-run -- --collection employees
npm run migrate:dry-run -- --collection taskTrackerEntries --collection meetings
node migration/cli.mjs --help
```

Supported collections: `employees, taskTrackerEntries, priorityQuestions,
answers, meetings, repositories`.

## Dry-run workflow

1. Read all source data (markdown + SQLite-if-present + config).
2. Validate every candidate document (enum/pattern/required checks).
3. Build MongoDB documents in memory (with `_legacy` provenance).
4. Detect duplicates (natural key / normalized title / content hash).
5. Detect missing references (employee roster, question codes).
6. Produce a report: records read, valid, invalid, duplicates, missing refs,
   warnings, errors, estimated documents per collection.

**No documents are inserted.** The report ends with `Documents inserted: 0`.

## Validation workflow

Each candidate passes the in-framework validation pipeline (`lib/validation.mjs`)
that mirrors the collection `$jsonSchema` + edge validators. During the future
execution phase, the database `$jsonSchema` is the additional final gate.

## Rollback workflow (designed; disabled here)

`lib/rollback.mjs` documents the strategy and can *plan* a rollback
(`deleteMany({'metadata.migration.runId': runId})`), but `executeRollback()`
throws — there is nothing to roll back because nothing is written in this phase.
