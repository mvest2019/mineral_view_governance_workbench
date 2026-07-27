# MongoDB Final Cutover — Runbook & Status

> **Status:** BLOCKED on live execution + verification (see §0). This document is the gated runbook
> for making MongoDB the single source of truth. **The destructive cutover (removing GitHub markdown,
> dual-write, and fallback) has NOT been performed** — it is explicitly gated on a successful,
> verified migration, which cannot be run from the build environment. Target DB: `GovernanceDB` only.

---

## 0. Why the cutover is not yet executed (must read)

Two hard gates are unmet, and the phase's own rules forbid proceeding past them:

1. **MongoDB is unreachable from the build/sandbox environment.** `npm run migrate:execute -- --all
   --confirm` fails with `Server selection timed out` (outbound Mongo TCP is egress-blocked here, as
   in every prior phase). Migration cannot be executed or verified here. The phase says *stop
   immediately if verification fails* and *only remove markdown after successful verification* —
   removing the GitHub/dual-write/fallback safety net on **unverified** data is precisely the
   data-loss scenario the gate prevents.
2. **Migration mappers exist for only 6 of the implemented collections** — `employees`,
   `taskTrackerEntries`, `priorityQuestions`, `answers`, `meetings`, `repositories`. The remaining
   implemented collections (`departments`, `roles`, `settings`, `aiRuns`, `aiExchanges`, `findings`,
   `repoQuestions`, `questionAssignments`, `intakes`, `attachments`, `auditLogs`, `meetingFiles`)
   have **no mappers**, and most of their sources are SQLite tables that are **absent** in this
   environment. "Migrate every historical record for every feature" is therefore not yet buildable
   or verifiable.

**Consequence:** the removal steps (§3) are deferred until (1) the migration is executed **where
GovernanceDB is reachable** and passes verification, and (2) mappers are added for the remaining
collections (or those features are consciously scoped out of the cutover).

What **has** been delivered safely in this phase (additive, non-destructive):
- All-collection verification (`--verify --all`) with stop-on-failure across the 6 mapped collections.
- A one-command gated cutover: `npm run migrate:cutover` (execute-all → verify-all; aborts on failure).
- The mandatory-mode **startup health check** (`lib/mongo_required.ts`) + `/api/health/mongo` route,
  **gated behind `MONGO_REQUIRED`** (off by default) so it ships without breaking anything.
- This runbook + the final-report template (§6).

---

## 1. Prerequisites (run where GovernanceDB is reachable)

- `.env.local`: `MONGODB_URI=…`, `MONGODB_DB_NAME=GovernanceDB`. Recommended:
  `MONGODB_SERVER_SELECTION_TIMEOUT_MS=3000`.
- SQLite `governance.db` present (for SQLite-backed collections) or `WORKBENCH_DB_PATH` pointing at it.
- Provision all collections (idempotent):
  ```bash
  for c in employees roles departments task-tracker priority-questions answers \
           meetings meeting-files repositories repo-questions findings intakes \
           ai-runs ai-exchanges attachments audit-logs question-assignments; do
    npm run db:provision:$c 2>/dev/null || true
  done
  npm run mongo:health          # expect ✔ Connected
  ```

## 2. Execute + verify (gated)

```bash
# one command: executes all mapped collections, then verifies; aborts on any failure
npm run migrate:cutover
```
Or step-by-step (record the runId printed by execute):
```bash
npm run migrate:execute -- --all --confirm
npm run migrate:verify  -- --all --run-id <runId>
```
`--verify` reports per collection: **source count · MongoDB count · missing · duplicates ·
validation (indexes + $jsonSchema) · relationship** and a `VERIFIED` / `DISCREPANCIES_FOUND` verdict.
The process exits non-zero if any collection is not `VERIFIED` — **do not proceed if it does.**

> Before this is a *complete* cutover, add migration mappers for the 12 remaining collections
> (§0.2) and include them in `EXECUTION_ORDER` + verification `EXPECTED_INDEXES`/`COMPARE`.

## 3. Remove GitHub/dual-write/fallback — ONLY after §2 reports VERIFIED for every feature

Apply these edits (kept out of the repo until verification passes):
- `lib/mongo_bridge.ts` → convert reads to Mongo-only (drop the `?? fallback`) and make writes
  Mongo-authoritative (surface errors instead of swallowing).
- `app/api/employees/route.ts` → return Mongo result only (remove `list_employees` fallback).
- `app/api/task_tracker/route.ts`, `priority_questions/answer/route.ts`, `meetings/analyze/route.ts`,
  `priority_questions/generate/route.ts` → remove the `commitUniqueMarkdown` / GitHub write calls;
  keep the response shape identical (return the persisted doc's fields mapped to the current JSON).
- `GET /api/questions` and other read feeds → switch to the Mongo repositories.
- **Keep** `lib/github.ts` slug/timestamp helpers if still referenced; remove only the persistence
  writes. **Keep** the migration framework and rollback utilities (do not delete `migration/**`).

## 4. Make MongoDB mandatory (final switch)

```bash
# in the deployment environment, after §2 + §3:
MONGO_REQUIRED=true
```
With this set, `assertMongoReady()` / `/api/health/mongo` fail fast (503) if GovernanceDB is
unreachable — no silent fallback. Wire `assertMongoReady()` at the top of the API handlers (or a
shared wrapper) as part of §3 so every request enforces it.

## 5. Post-cutover functional verification (per feature)

For employees, task tracker, priority questions, answers, meetings — exercise and confirm against
MongoDB only: **create · update · delete (soft) · search · filters · relationships · pagination ·
history · audit metadata** (`createdBy/At`, `updatedBy/At`, `version`, `metadata.migration`). Confirm
`/api/health/mongo` returns `{ ok: true, required: true }` and that no new GitHub markdown files are
written.

## 6. Final migration report (fill from the live run)

```
Cutover run: <runId>            Date: <…>            Executed by: <…>
Database: GovernanceDB          Execution time: <…>

Collection            Source  Mongo  Missing  Dup  Validation  Relationship  Verdict
employees             …       …      0        0    PASS        PASS          VERIFIED
taskTrackerEntries    …       …      0        0    PASS        n/a           VERIFIED
priorityQuestions     …       …      0        0    PASS        PASS          VERIFIED
answers               …       …      0        0    PASS        PASS          VERIFIED
meetings              …       …      0        0    PASS        n/a           VERIFIED
repositories          …       …      0        0    PASS        PASS          VERIFIED
<remaining 12>        —       —      —        —    NO MAPPER   —             NOT MIGRATED

Validation summary: <…>        Unresolved issues: <…>
Files removed:      <list once §3 applied>
APIs modified:      <none in contract; persistence only>
Repositories modified: <list>     Services modified: <list>
```

---

## 7. Guarantees preserved by this phase

- **Only GovernanceDB** is referenced.
- **No destructive change made** — GitHub markdown, dual-write, and fallback remain in place; the app
  still runs exactly as today (and byte-identically when `MONGODB_URI` is unset).
- Migration framework + rollback utilities are **kept** in the repo (`migration/**`).
- The mandatory-mode health check ships **off by default** (`MONGO_REQUIRED` unset), so nothing
  fails until you deliberately flip it as the last cutover step.
