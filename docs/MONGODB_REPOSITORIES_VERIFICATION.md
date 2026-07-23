# Repositories Migration — Source Verification Report

> **Status:** Verification (dry-run) only · **Target DB:** `GovernanceDB` (referenced by name only)
> **Scope:** Verify the `repositories` migration source, field mappings, and relationships.
> **No data migrated, no MongoDB documents inserted, no collections created/modified, no GitHub
> markdown modified.** Real sources untouched.

---

## 1. Environment status (read first)

The authoritative source for `repositories` is the SQLite table **`repo_classification`** in
`governance.db`. That database is **ephemeral** (it lives at the repo root locally and in `/tmp` on
Vercel; it is git-ignored) and is **NOT present in this verification environment** — a filesystem
search (repo root, `/tmp`, whole-disk) found no `governance.db`, and `WORKBENCH_DB_PATH` is unset.

Therefore this report verifies the **migration logic** (readers, field mappings, enum transforms,
relationships, duplicate handling) against a **schema-accurate synthetic fixture** built from the
exact `repo_classification` DDL. It does **not** — and cannot, here — read the real production rows.
The final step (§9) is to run the identical command where the real `governance.db` exists.

`better-sqlite3` is available and the SQLite reader path is confirmed functional (it opened and read
the fixture read-only).

---

## 2. Source schema (`repo_classification`, from `lib/db.ts`)

```sql
CREATE TABLE IF NOT EXISTS repo_classification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    observed_purpose TEXT,
    proposed_category TEXT,
    confidence TEXT,
    canonical_status TEXT,
    evidence TEXT,
    finding_link TEXT,
    question_link TEXT,
    approval_status TEXT DEFAULT 'PENDING',
    updated_at TEXT,
    UNIQUE(company, repo_name)
);
```

Supplementary source: `ASPECT_GROUP_RULES` in `lib/config.ts` (repo → aspect-group membership).

---

## 3. Field mapping (verified)

Target collection: `repositories` (V1 spec §3.11) — classification is **embedded**.

| Source (`repo_classification`) | → Target field | Transform | Verified |
|---|---|---|---|
| `company` | `companyKey` | fixed `"MView"` | ✅ |
| `repo_name` | `name` (unique per company) | verbatim | ✅ |
| `observed_purpose` | `classification.observedPurpose` | verbatim / `undefined` if empty | ✅ |
| `proposed_category` | `classification.proposedCategory` | verbatim (free label from `REPO_CATEGORIES`) | ✅ |
| `confidence` | `classification.confidence` | **upcase → enum** `LOW·MEDIUM·HIGH`; unknown → dropped + warning | ✅ |
| `canonical_status` | `classification.canonicalStatus` | verbatim | ✅ |
| `evidence` | `classification.evidence` | verbatim | ✅ |
| `approval_status` | `classification.approvalStatus` | **upcase → enum** `PENDING·APPROVED·REJECTED`; null → `PENDING` | ✅ |
| `finding_link` | `classification.findingCode` | **extract** `F-####` from the link string | ✅ |
| `question_link` | `classification.questionCode` | **extract** `Q-…` from the link string | ✅ |
| `updated_at` | `classification.updatedAt` | verbatim | ✅ |
| *(config)* `ASPECT_GROUP_RULES` | `aspectGroup` | repo→group lookup | ✅ |
| — | `departmentKeys` | `[]` (repo↔dept comes later from `repo_understanding`) | ✅ |
| — | `isArchived` | `false` default | ✅ |
| `id` | `metadata.legacy.{sqliteTable,id}` | provenance | ✅ |

**Actual mapped output from the fixture** (proves the transforms):

```jsonc
// full row — links + aspect group resolved, confidence upcased
{ "name": "MineralView-Portal-Next", "aspectGroup": "Portal and Customer Experience",
  "classification": { "proposedCategory": "Web / Storefront", "confidence": "HIGH",
    "approvalStatus": "APPROVED", "findingCode": "F-0012", "questionCode": "Q-REPO-0007",
    "canonicalStatus": "CANONICAL", "updatedAt": "2026-07-20 10:00" } }

// unknown confidence "VERY_HIGH" → dropped + warned; aspect group still resolved
{ "name": "CompletionScraper", "aspectGroup": "Data Ingestion and Scrapers",
  "classification": { "proposedCategory": "Vendor Feeds", "approvalStatus": "PENDING" } }

// minimal row → approvalStatus defaults to PENDING
{ "name": "mvestimateAPI", "aspectGroup": "Analytics, Estimation, and Modeling",
  "classification": { "approvalStatus": "PENDING" } }
```
(A 4th row with lowercase `confidence:"low"` / `approval_status:"rejected"` upcased correctly to
`LOW` / `REJECTED`.)

---

## 4. Relationship mapping (verified)

| Relationship | Direction | Handling | Verified |
|---|---|---|---|
| `repositories.name` ← `repoQuestions.repoName` | 1-to-many | `name` is the referenced natural key (unique) | ✅ (key emitted) |
| `repositories.name` ← `findings.repoName` | 1-to-many | same | ✅ |
| `classification.findingCode` → `findings.findingCode` | many-to-one | extracted from `finding_link`; resolves against `findings` when that collection is in the run | ✅ (extraction + ref-check) |
| `classification.questionCode` → `repoQuestions.questionCode` | many-to-one | extracted from `question_link`; resolves against `repoQuestions` | ✅ |
| `repositories.aspectGroup` ← `ASPECT_GROUP_RULES` | many-to-one | config lookup by repo name | ✅ |

> In an isolated `--collection repositories` run, `findings` and `repoQuestions` are not loaded, so the
> reference index reports `findingCode`/`questionCode` as **not resolved** (a warning, not an error) —
> exactly as observed. In a full `--all` run (or when those SQLite tables are present), the crosswalk
> resolves them. This is correct, expected behavior.

---

## 5. Enum & transform verification

| Case | Input | Output | Result |
|---|---|---|---|
| Confidence upcase | `"low"` | `LOW` | ✅ |
| Confidence enum guard | `"VERY_HIGH"` | dropped + warning | ✅ |
| Approval upcase | `"rejected"` | `REJECTED` | ✅ |
| Approval default | `null` | `PENDING` | ✅ |
| Finding code extract | `"See F-0012"` | `F-0012` | ✅ |
| Question code extract | `"Q-REPO-0007"` | `Q-REPO-0007` | ✅ |
| Aspect group lookup | `CompletionScraper` | `Data Ingestion and Scrapers` | ✅ |

---

## 6. Duplicate handling

- The source enforces **`UNIQUE(company, repo_name)`**, so duplicate repositories **cannot exist** in
  `repo_classification` — a strong integrity guarantee at the source.
- The mapper additionally dedupes on `repo_name` (idempotent) and the target `repositories` collection
  has a **unique partial index** `{companyKey, name}` — so re-runs upsert, never duplicate.
- Fixture result: **0 duplicates** (as expected).

---

## 7. Edge cases covered by the fixture

1. Fully-populated row (all fields + both links + aspect group + APPROVED).
2. Unknown `confidence` value → dropped with a warning (not defaulted silently).
3. Minimal row (only `company` + `repo_name`) → `approvalStatus` defaults to `PENDING`; empty fields
   omitted.
4. Lowercase enum values (`low`, `rejected`) → upcased.
5. `finding_link` embedded in prose (`"See F-0012"`) → code correctly extracted.
6. Repos present in `ASPECT_GROUP_RULES` (portal / scrapers / analytics) → `aspectGroup` resolved.

---

## 8. Dry-run verification result (fixture)

```
▶ repositories
    records read ......... 4
    valid ................ 4
    invalid .............. 0
    duplicates ........... 0
    missing references ... 0
    warnings ............. 3   (findingCode/questionCode unresolved in isolated run; 1 unknown confidence)
    errors ............... 0
    estimated documents .. 4
  READINESS: READY
  Documents inserted: 0
  Database referenced: GovernanceDB
```

The mapping logic is **verified correct**. No blocking issues in the repositories transform.

---

## 9. Final step (run against the real database)

When run where the real `governance.db` exists, the identical command produces the production
verification report — no code change needed:

```bash
# point the framework at the real SQLite DB (read-only) and dry-run:
WORKBENCH_DB_PATH=/path/to/governance.db npm run migrate:dry-run -- --collection repositories

# or, to also resolve findingCode/questionCode relationships in one pass:
WORKBENCH_DB_PATH=/path/to/governance.db npm run migrate:dry-run -- --all
```

Expected: `records read` = the real repo_classification row count; `invalid` should be 0 (watch for
any real `confidence` values outside `LOW·MEDIUM·HIGH` and any `approval_status` outside the enum —
those would warn and are the only realistic data risks, given the source's `UNIQUE` and `NOT NULL`
constraints on `repo_name`).

---

## 10. Confirmations

- **No documents inserted** — dry-run report shows `Documents inserted: 0`; the framework never opens
  a MongoDB connection (only the pure `ObjectId` class is imported).
- **Only GovernanceDB referenced** — by name in config; no other database named, opened, or touched.
- **No collections created or modified.**
- **Real sources untouched** — the real `governance.db` is not present and was neither created nor
  modified; GitHub markdown and `lib/config.ts` were read-only; the synthetic fixture was created in
  a scratch directory purely to exercise the mapper and was **deleted** after the run.
- **GitHub + SQLite remain the source of truth**; the application was not changed.

**Verdict:** the `repositories` migration source, field mappings, and relationships are **verified and
ready**. The only remaining action is a confirmatory dry-run against the real `governance.db` in an
environment where it exists (§9) — a data check, not a code change.
