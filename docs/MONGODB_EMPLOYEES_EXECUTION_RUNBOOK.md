# Employees Migration — Execution & Verification Runbook

> **Status:** Runbook · **Scope:** execute + verify the `employees` collection only.
> **Why a runbook:** the execution/verification tooling is complete and offline-verified, but the
> MView-Staging cluster is **not reachable from the build/sandbox environment** (outbound TCP to the
> Mongo port is egress-blocked — a real `--execute` attempt returns `Server selection timed out`).
> Run the steps below **where GovernanceDB is reachable** (a machine whose network can reach the
> cluster, with `MONGODB_URI` in `.env.local`). Only `GovernanceDB` is ever touched.

---

## 0. Preconditions

- `.env.local` contains `MONGODB_URI=…` (MView-Staging) and `MONGODB_DB_NAME=GovernanceDB`.
- The `employees` collection is provisioned (validator + indexes):
  ```bash
  npm run db:provision:employees
  ```
- Confirm connectivity:
  ```bash
  npm run mongo:health      # expect: ✔ Connected and pinged GovernanceDB
  ```

## 1. Dry-run once more (safety, writes nothing)

```bash
npm run migrate:dry-run -- --collection employees
```
Expect: `employees … read 23 · valid 23 · invalid 0`, `Documents inserted: 0`.

## 2. Execute (employees only)

```bash
npm run migrate:execute -- --collection employees --confirm
```
- Prints a **runId** (e.g. `run-20260723HHMMSS-xxxxxx`) — **record it** (needed for verify/rollback).
- Idempotent: safe to re-run; upserts on `memberKey`, never duplicates.
- Expected summary: `documents inserted: 23  failed: 0`.

## 3. Verify (count · indexes · validators · source-vs-DB reconciliation)

```bash
npm run migrate:verify -- --collection employees
# or scope strictly to this run:
npm run migrate:verify -- --collection employees --run-id <runId>
```

The command performs and reports all four required checks and writes a JSON reconciliation report to
`migration/reports/` (git-ignored). Expected output:

```
  1) COUNT      source 23 · db(run) 23 · db(total) 23 → MATCH ✔
  2) INDEXES    all present ✔
                present: _id_, ux_employees_company_memberKey,
                ix_employees_company_departmentKeys, ix_employees_company_status,
                tx_employees_company_fulltext
  3) VALIDATOR  $jsonSchema present ✔ (strict/error)
  4) DOCUMENTS  compared 23 · missingInDb 0 · extraInDb 0 · mismatches 0 → MATCH ✔
  VERDICT: VERIFIED
```

### What each check proves
1. **Count** — `countDocuments` for the run == source valid count (23).
2. **Indexes** — the 4 employees indexes (unique `memberKey`, department, status, full-text) all exist.
3. **Validators** — the collection carries a `$jsonSchema` validator (`validationLevel: strict`,
   `validationAction: error`).
4. **Documents vs source** — every source employee is fetched by `memberKey` and its
   `fullName, title, status, departmentKeys, roleKeys, aliases` are field-compared; reports
   `missingInDb`, `extraInDb`, and `mismatches` (all expected 0).

## 4. Manual spot-checks (optional, in `mongosh`)

```js
use GovernanceDB
db.employees.countDocuments({})                                   // 23
db.employees.getIndexes().map(i => i.name)                        // the 4 + _id_
db.getCollectionInfos({ name: 'employees' })[0].options.validator // $jsonSchema
db.employees.findOne({ memberKey: 'ajay_landge' })                // envelope + metadata.migration
db.importJobs.find({ collection: 'employees' }).sort({ at: 1 })   // per-batch reconciliation log
db.migrationErrors.find({ collection: 'employees' })              // expect empty
```

## 5. If verification fails

- **Do not proceed to other collections.**
- Roll back this run and investigate:
  ```bash
  npm run migrate:rollback -- <runId> --confirm
  ```
  (Deletes only docs tagged `metadata.migration.runId == <runId>` from GovernanceDB.)
- Re-run `--dry-run` to inspect, fix, then `--execute` again (idempotent).

## 6. Gate to the next collection

Proceed to the next collection (`repositories`, then `priorityQuestions → answers → …`, per
`EXECUTION_ORDER`) **only after** `employees` verification reports `VERDICT: VERIFIED`.

---

## Guarantees

- **Only GovernanceDB** is referenced (writer is bound to it + a collection allow-list).
- **Idempotent** — re-running `--execute` never duplicates (`$setOnInsert` on `memberKey`).
- **Reversible** — `--rollback <runId>` removes exactly this run.
- **Isolated** — the migration CLI is standalone; the application still reads GitHub/SQLite and its
  APIs/behavior are unchanged. No other database is touched.

> **Please paste the `--execute` summary and the `--verify` output back here.** I'll confirm the
> reconciliation and give the go/no-go for the next collection — I cannot read your cluster from this
> environment, so those two outputs are how we verify.
