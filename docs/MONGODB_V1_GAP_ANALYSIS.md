# MongoDB V1 — Gap Analysis & Remaining Implementation Order

> **Status:** Review only · **Type:** Gap analysis + sequencing recommendation
> **Baseline:** `docs/MONGODB_V1_SPECIFICATION.md` (the approved 18-collection V1 design)
> **Scope:** What is built, what remains, and the recommended order for the rest.
> **No code was changed, no MongoDB was modified, no collection was provisioned, and no data was
> migrated by this document.** It is a planning artifact only.

---

## 1. V1 specification vs. current implementation

The approved V1 specification defines **18 collections**. **6 are implemented** (models, validators,
indexes, repositories, services, and idempotent provisioning scripts); **12 remain**.

| # | Collection | V1 spec | Implemented? | Phase built |
|---|---|---|---|---|
| 1 | `employees` | §3.1 | ✅ | Phase 2 |
| 2 | `roles` | §3.2 | ❌ | — |
| 3 | `departments` | §3.3 | ❌ | — |
| 4 | `taskTrackerEntries` | §3.4 | ✅ | Phase 3 |
| 5 | `priorityQuestions` | §3.5 | ✅ | Phase 4 |
| 6 | `answers` | §3.6 | ✅ | Phase 4 |
| 7 | `questionAssignments` | §3.7 | ❌ | — |
| 8 | `repoQuestions` | §3.8 | ❌ | — |
| 9 | `meetings` | §3.9 | ✅ | Phase 5 |
| 10 | `meetingFiles` | §3.10 | ✅ | Phase 5 |
| 11 | `repositories` | §3.11 | ❌ | — |
| 12 | `findings` | §3.12 | ❌ | — |
| 13 | `intakes` | §3.13 | ❌ | — |
| 14 | `aiRuns` | §3.14 | ❌ | — |
| 15 | `aiExchanges` | §3.15 | ❌ | — |
| 16 | `attachments` | §3.16 | ❌ | — |
| 17 | `auditLogs` | §3.17 | ❌ | — |
| 18 | `settings` | §3.18 | ❌ | — |

**Progress: 6 / 18 collections (33%).** All 6 are provisioned in `GovernanceDB` with 0 documents;
GitHub/SQLite remain the source of truth.

---

## 2. Remaining collections required for **today's** features

All 12 remaining collections belong to the V1 set, which was itself scoped to **features that exist
in the application today**. Each maps to a live route / data store, so **all 12 are current-feature
collections** — none is speculative. The mapping:

| # | Collection | Backs which current feature(s) | Today's storage it will model |
|---|---|---|---|
| 2 | `roles` | Access control for the app (foundational). **Auth is not yet a runtime feature** — this is the identity foundation the spec puts in V1 for soft-launch RBAC. | none (net-new; permissions stay a code constant) |
| 3 | `departments` | `/api/departments`, department tagging, employee↔department mapping | `DEPARTMENT_ARCHITECTURE` config + `team_member_department_tags` |
| 7 | `questionAssignments` | `/api/question_assignment` (who owns a question) | SQLite `question_assignment` |
| 8 | `repoQuestions` | `/api/repo_questions/**` (list/detail/generate/update/chat) | SQLite `repo_questions` |
| 11 | `repositories` | `/api/inventory`, `/api/classification`, `/api/aspect_groups` | SQLite `repo_classification` (embedded) + `ASPECT_GROUP_RULES` |
| 12 | `findings` | `/api/findings`, `/api/repo_understanding` | SQLite `finding_reviews` + `repo_understanding` + `F-####` register |
| 13 | `intakes` | `/api/intake/**` (upload → AI review → gates → advance) | SQLite `intake` + `intake_file` + `gate` + `workflow_event` + `link` |
| 14 | `aiRuns` | Every Claude/OpenAI call, file analysis, question generation | SQLite `ai_run` + `team_member_file_analysis` + `team_member_question_ai_run` |
| 15 | `aiExchanges` | `/api/exchanges`, `/api/intake/:id/exchange` (challenge loop) | SQLite `ai_exchange` |
| 16 | `attachments` | `/api/files`, member file uploads (`upload-with-purpose`, `analyze`) | SQLite `team_member_files` |
| 17 | `auditLogs` | Correspondence/activity log + new security audit | SQLite `team_member_correspondence_log` + net-new audit |
| 18 | `settings` | `/api/openai_settings`, app configuration | `openai_settings` + `local_settings.json` |

> **One nuance on `roles` (#2):** the app has **no authentication today** (identity is a
> self-asserted employee picker). `roles` is in V1 as the *foundation* for soft-launch RBAC, not
> because a login feature exists now. It is still worth building early because `employees.roleKeys`
> already references it and it is trivially small — but its *enforcement* stays deferred (V1 §6.5).

---

## 3. Current-feature vs. future-only

### 3.1 Current-feature (in scope — all 12 remaining)
Every remaining collection above (§2). These complete the V1 model of today's application.

### 3.2 Future-only (explicitly OUT of scope — do NOT build)
These were deferred in **V1 spec §7** and remain deferred. They are listed here only to confirm they
are **not** part of the remaining work, so no one mistakes them for a gap:

`tenants` · separate `users` / `sessions` / `apiKeys` · `permissions` (as a collection) · `teams` ·
`projects` · `dailyTasks` board · workflow engine (`workflowDefinitions` / `workflowInstances` /
`approvals`) · AI vector plane (`embeddings`, `knowledgeBase`, vector search, RAG, `promptHistory`,
`aiSummaries` / `aiDocuments`) · corpus-as-collections (`decisions`, `glossary`, `securityRegister`) ·
`changeHistory` / separate `activityLogs` · `notifications` · `emailQueue` / `outbox` ·
`reportSnapshots` · `systemConfig` / `modules` / `integrations` · `questionPackets` as its own
collection · sharding · field-level encryption.

Each remains additive behind a concrete trigger (V1 §7) and requires **no rework** of any V1
collection when eventually built.

---

## 4. Dependency analysis

Only a few hard ordering constraints exist (a reference should exist before the collection that
points at it). Everything else is independent and can be sequenced by value.

```
repositories ──▶ repoQuestions        (repoQuestions.repoName → repositories.name)
repositories ──▶ findings              (findings.repoName → repositories.name)
priorityQuestions ✅ + repoQuestions ──▶ questionAssignments   (assigns either kind)
intakes ──▶ aiExchanges                (aiExchanges.intakeId → intakes)
aiRuns  ──▶ aiExchanges                (aiExchanges.sourceRunId → aiRuns)
aiRuns  ◀── attachments / meetingFiles ✅   (…​.analysisRunId → aiRuns; soft, id only)

Independent / no hard dependency:
  roles, departments, settings, auditLogs, attachments, aiRuns
```

Notes:
- Cross-collection references in V1 are **string/ObjectId pointers**, not enforced foreign keys, so
  "before" means *logical* correctness (data lands in the right order), not a compile/runtime block.
- `auditLogs`, `settings`, `attachments`, `aiRuns` are cross-cutting and dependency-free; building
  them earlier lets later modules log, attach files, and record AI activity against them.

---

## 5. Recommended implementation order

Grouped into four sequenced phases. Within a phase, collections are independent and could be built
in one pass. Each entry notes **complexity** (S/M/L) and **primary risk**.

### Phase 6 — Access & reference foundation
Completes the identity/reference layer the Employees module already points at. Small, dependency-free.

| Order | Collection | Complexity | Why here / risk |
|---|---|---|---|
| 1 | `roles` | **S** | Employees already reference `roleKeys`; seed 5 system roles. Enforcement stays deferred (V1 §6.5). Risk: none. |
| 2 | `departments` | **S** | Reference data employees point at (`departmentKeys`); backs `/api/departments`. Risk: reconcile config keys vs. `team_member_department_tags`. |

### Phase 7 — Platform & cross-cutting foundation
Dependency-free, cross-cutting collections that later modules will use. Building them now means
Repository Intelligence and the AI plane can attach files, settings, and audit from day one.

| Order | Collection | Complexity | Why here / risk |
|---|---|---|---|
| 3 | `settings` | **S** | Standalone; replaces `openai_settings` + `local_settings.json`. Risk: secrets must resolve to a secret manager, never stored raw (V1 §10.6). |
| 4 | `auditLogs` | **M** | Cross-cutting (`SECURITY`\|`ACTIVITY`), append-only; unblocks activity/audit for every later module. Risk: keep append-only (no update/delete grant). |
| 5 | `attachments` | **M** | Polymorphic `target`; referenced by `answers.sourceFileId`. Bytes live in object storage. Risk: object-store `storageRef` contract + `checksum` dedupe. |

### Phase 8 — Repository Intelligence
`repositories` first (others reference `repoName`), then the two dependents, then assignments.

| Order | Collection | Complexity | Why here / risk |
|---|---|---|---|
| 6 | `repositories` | **M** | Prerequisite for `repoQuestions` + `findings`; embeds classification (V1 §3.11). Risk: repo registry currently discovered from GitHub at runtime — model the canonical shape. |
| 7 | `findings` | **M** | `findings.repoName → repositories`; `F-####` register + review decisions. Risk: merge `finding_reviews` + `repo_understanding` faithfully. |
| 8 | `repoQuestions` | **M** | `repoQuestions.repoName → repositories`; mirrors the priorityQuestions family. Risk: shares the `answers` collection (`questionKind = REPO`) — confirm answer linkage. |
| 9 | `questionAssignments` | **S** | Needs both question families to exist (priority ✅ + repo). Thin join, unique per `questionCode`. Risk: none. |

### Phase 9 — Intake & AI plane
`aiRuns` and `intakes` before `aiExchanges` (which references both).

| Order | Collection | Complexity | Why here / risk |
|---|---|---|---|
| 10 | `aiRuns` | **M** | Unifies `ai_run` + file analysis + question-AI runs; polymorphic `subject`; referenced by `aiExchanges`, `attachments`, `meetingFiles`. Risk: large prompt/output fields — plan `outputStorageRef` offload. |
| 11 | `intakes` | **L** | Embeds files/links/gates/stageHistory (V1 §3.13); parent of `aiExchanges`. Risk: faithfully collapse 5 SQLite tables into one embedded document; workflow-stage fidelity. |
| 12 | `aiExchanges` | **M** | `intakeId → intakes`, `sourceRunId → aiRuns`; preserves the challenge-loop fields (`agreementStatus`, `nextAction`). Risk: don't lose the two-engine semantics. |

### 5.1 One-line order
`roles → departments → settings → auditLogs → attachments → repositories → findings → repoQuestions
→ questionAssignments → aiRuns → intakes → aiExchanges`

### 5.2 Rationale summary
- **Foundations first** (roles, departments, settings, auditLogs, attachments): dependency-free,
  small–medium, and used by everything downstream.
- **Repository Intelligence next** (repositories → findings → repoQuestions → questionAssignments):
  a self-contained cluster with a clear internal order.
- **Intake & AI last** (aiRuns → intakes → aiExchanges): the most complex, and the AI plane
  references the rest — so it benefits from `attachments`/`auditLogs`/`aiRuns` already existing.

---

## 6. Sizing & closing notes

- **Remaining work:** 12 collections. Rough complexity mix: **5 small**, **6 medium**, **1 large**
  (`intakes`). Each follows the now-established module pattern (model + `$jsonSchema` validator +
  indexes + repository + service + idempotent provisioning script + npm script), so per-collection
  effort is predictable.
- **No V1 rework required.** The 6 built collections need no changes; the remaining 12 slot in
  additively.
- **Constraints unchanged.** All future work stays inside `GovernanceDB`, inserts no data, migrates
  no GitHub markdown, adds no API routes, and keeps the `src/` layer isolated from the running app
  until a later, separately-approved integration phase — exactly as the phases so far.

**Recommendation:** proceed with **Phase 6 (`roles` + `departments`)** next, as the smallest,
dependency-free step that completes the identity/reference foundation the Employees module already
references.
