# Blueprint Review — MongoDB Architecture vs. Current Codebase

> **Status:** Review only · **Companion to:** `docs/MONGODB_ARCHITECTURE_BLUEPRINT.md`
> **Purpose:** Critically evaluate the blueprint against what the Governance Workbench *actually is*
> today, and recommend what to keep, cut, add, or simplify **before** implementation begins.
> **No code, schema, collections, or data are changed by this document.**

---

## 0. Headline verdict

The blueprint is **architecturally sound but over-scaled for the current reality**. It designs for a
multi-tenant SaaS with millions of documents and hundreds of tenants; the app is a **single-company,
~22-person internal governance tool** with **low-thousands of records total**. The domain modeling,
layering, audit, and API design are good and worth keeping. The **multi-tenant machinery, the AI
vector/RAG plane, the workflow/eventing infrastructure, and roughly a third of the collections are
premature** and should be deferred or cut.

**The single most important correction is a migration-risk finding, not a design one:** the blueprint
frames the migration as "from SQLite," but on Vercel the SQLite DB lives in **ephemeral `/tmp`**, so
the authoritative production data is overwhelmingly the **GitHub markdown + bundled corpus**. A
migration that reads SQLite as the source of truth would migrate almost nothing. See §H.1.

### Scale reality check (the lens for everything below)

| Entity | Real volume today | Blueprint assumed |
|---|---|---|
| Companies / tenants | **1** (`MView`, hardcoded, points at bundled files) | "hundreds of tenants," sharding |
| Employees | **~22** (config-driven) | large org, denormalized snapshots to avoid joins |
| Task Tracker entries | **~107** markdown files | high-volume, per-employee+date indexes |
| Priority answers | **~274** markdown files | unbounded, dedicated collection + author indexes |
| Meetings | **3** | timeline + attendee indexes |
| Governance corpus | **~102** markdown files | folded into `knowledgeBase` + vector embeddings |
| AI runs/conversations | small | uniform log + vector plane + prompt versioning |

At this scale, **a single MongoDB replica set with a handful of indexes serves every query in
single-digit milliseconds with no sharding, no read-replicas, no caching layer, and no vector
index.** That should recalibrate several "enterprise" recommendations to "later, if ever."

---

## 1. Collections that are unnecessary (cut or defer)

The blueprint specifies ~35 collections. The following are **premature** for the current app. "Defer"
= design is fine, don't build until a real trigger exists; "Cut" = fold into something simpler.

| Collection | Verdict | Why it's unnecessary now | Scalability impact of deferring | Complexity impact of deferring |
|---|---|---|---|---|
| `permissions` (as a collection) | **Cut** → constant | 22 users, ~5 roles. A permission *catalog collection* is enterprise IAM overkill; permissions are a fixed code enum. | None — promote to a collection only if permissions become tenant-customizable. | Removes a join and a seed/migration step; RBAC checks read a constant. |
| `apiKeys` | **Defer** | No programmatic/agent access exists. | None until external integrations authenticate. | −1 collection, −1 auth path, −1 hashing/rotation concern. |
| `emailQueue` | **Defer** | No outbound email today. | None until notifications go to email. | Removes a worker + retry/backoff surface. |
| `outbox` | **Defer** | No external event consumers; Change Streams need a persistent worker Vercel can't host (see §E.4). | Low — add when event fan-out is real. | Large: removes the whole transactional-outbox + worker infra. |
| `workflowDefinitions` / `workflowInstances` / `approvals` | **Defer** | Generalizes the intake→gate flow before a *second* workflow exists. Classic premature abstraction. | Low — the intake flow already works as a bespoke shape. | Large: three collections + an engine replaced by fields on `intakes`. |
| `teams` | **Defer** | `ASPECT_GROUP_RULES` group *repos*, not people. No people-team feature. | None — add when cross-dept teams are a feature. | −1 M:N relationship to maintain. |
| `projects` | **Defer** | No project concept in the UI/API. | None — `projectId` can be added to tasks later. | −1 collection, −1 optional FK. |
| `dailyTasks` | **Defer / reconsider** | The app hardcodes `daily_tasks: []` — the feature is **vestigial**. Building a full task board is *new product*, not migration. | Neutral. | Avoids building a feature the migration doesn't require. |
| `knowledgeBase` **+** `embeddings` **+** vector index | **Defer (whole AI-search plane)** | 102 corpus files are trivially served by text search; embeddings need an embedding pipeline + M10+ vector index + a re-embed worker. | Low — RAG is a future enhancement, not a storage need. | Very large: removes vector infra, chunking, staleness jobs, provider-cost management. |
| `aiDocuments` vs `aiSummaries` | **Merge** | Overlapping ("AI-generated content with a review lifecycle"). Two collections for one idea. | None. | One shape (`aiArtifacts` with a `kind`) instead of two. |
| `activityLogs` **+** `changeHistory` **+** `auditLogs` | **Collapse to two** | Three audit stores is heavy for a low-write app. `team_member_correspondence_log` is the only real activity feed today. | Fine — split later if volume/compliance demands. | Removes universal per-write diffing-in-transaction (write amplification, §E.3). |
| `reportSnapshots`, `savedViews`, `webhookDeliveries`, `rateLimitCounters`, `importJobs`, `featureFlags` | **Defer** (all "recommended additional") | None are needed for the core migration; `rateLimit` can be middleware-memory/Redis; `importJobs` is a migration-time concern, not a runtime collection. | None. | Keeps the surface small. |

**Net:** a realistic MVP is **~12–15 collections**, not 35. See §G for the recommended set.

---

## 2. Collections / areas that are missing or under-modeled

The blueprint over-invests in generic infrastructure and **under-invests in the actual governance
domain** — which is the corpus in `_GOVERNANCE/**` and a few real entities the app exposes.

| Gap | Why it matters | Scalability impact | Complexity impact |
|---|---|---|---|
| **Governance corpus is under-modeled.** It was collapsed into `knowledgeBase`, but the app exposes **distinct, queried entities**: `decisions` (`/api/decisions`, DECISION_LOG), `findings` (`F-\d+` register), a **security register**, a **glossary** (`/api/glossary`), **repo sheets**, and **playbooks**. | These have real API routes and parse logic today; lumping them into one KB loses their structure and endpoints. | Neutral. | Needs an explicit decision: model `decisions`, `findings` (already present), `glossary`, `securityRegister` as small first-class collections **or** consciously keep the corpus file-based. Silence here is a migration gap. |
| **`customers` / `customer_source` not modeled at all.** There are `/api/customers` and `/api/customer_source` routes backed by `customer_sources_for_company`. | It's a real, exposed concept the blueprint omits entirely. | Low. | Add a small `customerSources` collection or document why it stays config. |
| **`ai_exchange` fidelity lost.** The intake **challenge-loop** (`ai_exchange`: `agreement_status`, `next_action`, source/target engine outputs) was folded into generic `aiConversations`, dropping its workflow fields. | This is a genuinely distinct entity (two engines debating), not a chat thread. | Neutral. | Keep `aiExchanges` as its own shape, or add the fields explicitly — otherwise data is lost in migration. |
| **The answered-qid ledger + write-only answers.** Answers are currently **written to GitHub but never read back**; only the qid is tracked in `_answered_qids.md`. | The blueprint assumes a clean question↔answer link, but the markdown answer files **don't carry the qid** — only the question text. Reconstructing links is lossy. | Neutral. | This is a data-mapping gap that becomes a migration risk (§H.3); it needs a matching strategy, not a schema. |
| **Two member-key formats.** Config uses `Ryan_Cochran` (Title_Case); markdown/slugs use `ajay_landge` (lower_snake). | `memberKey` is the natural key joining everything; two formats will silently split or collide identities. | Neutral. | Requires a canonicalization rule **before** any employee migration (§C, §H.2). |
| **`removed employees` list.** `lib/helpers.ts` hardcodes removed employees. | Affects which employees migrate and their `status`. | None. | Small: seed those as `status: OFFBOARDED`. |

---

## 3. Fields to add or remove

### 3.1 Remove / simplify

| Field | Recommendation | Why | Scalability impact | Complexity impact |
|---|---|---|---|---|
| `tenantId: ObjectId` (everywhere) | **Replace with `companyKey: string`** (indexed), or keep but don't build the ObjectId lookup layer | One company. An ObjectId FK forces a `tenants` lookup to resolve the legacy `"MView"` string on every read/write. A string discriminator is simpler and equally future-proof at N=1. | Negligible — a string key still shards/promotes later. | Removes a mandatory join and the tenant-resolution middleware complexity. |
| `Decimal128` money fields | **Remove** from base/sub-doc templates | No finance module exists. | None. | Removes a type nobody uses. |
| `schemaVersion` on every doc | **Drop** (keep `version` for concurrency only) | Per-document schema versioning is for large, long-lived, multi-writer datasets. At this scale, a validator change + lazy fix is enough without a per-doc marker. | Low. | One fewer field/branch on every read. |
| Denormalized `employeeName` / `actor.displayName` snapshots | **Make optional, not universal** | Snapshots exist to avoid joins at scale; with 22 employees a lookup (or a cached roster map) is free. Snapshots add write-time sync burden and staleness bugs. | Neutral. | Fewer fields to keep in sync; simpler updates. |
| Universal `changeHistory` diff-in-transaction | **Make opt-in per collection** | Writing a diff doc inside every write transaction is write amplification for a low-write app; most collections don't need field-level history. | Fine — enable per collection when needed. | Removes transaction overhead from the hot path. |

### 3.2 Add / tighten

| Field | Recommendation | Why | Scalability impact | Complexity impact |
|---|---|---|---|---|
| `employees.memberKeyCanonical` + `aliases[]` | **Add** | Reconcile the two key formats (§2) and preserve legacy links from both markdown and config. | Positive — stable joins. | Small, one-time. |
| `taskTrackerEntries.githubRef`, `answers.githubRef`, `meetings.githubRef` | **Keep and make first-class** | During dual-run, and if markdown export is retained, the Git blob sha/path is the reconciliation anchor. | Neutral. | Small; already in the blueprint for some — apply consistently. |
| `answers.questionMatch` (`{strategy, confidence}`) | **Add** | Because answers→questions linkage is lossy (§2), record *how* each link was derived so low-confidence links are reviewable. | Neutral. | Small; turns a silent risk into an auditable field. |
| `priorityQuestions.normalizedTitle` | **Add (indexed)** | The current dedup key is a normalized title; storing it makes dedup deterministic and indexable instead of recomputed. | Positive. | Small. |
| `aiRuns.engine` includes a **heuristic/none** path | **Add** | Meeting summaries fall back Claude → OpenAI → **local heuristic**; the enum omits the non-AI fallback. | Neutral. | Prevents unrepresentable states. |

---

## 4. Relationships that could be improved

| Relationship | Issue | Recommendation | Scalability impact | Complexity impact |
|---|---|---|---|---|
| `users` ↔ `employees` (1:1 split) | Two identity collections for 22 people, while the app has **no real auth** today (identity is a self-asserted dropdown). | **Merge into `employees`** (auth fields — `passwordHash`, `roleKeys`, `status` — live on the employee). Split out a `users` collection only when SSO / non-employee accounts / external users arrive. | Neutral — a later split is a mechanical extract. | Halves the identity surface; removes a mandatory back-reference to keep in sync. |
| Polymorphic `target: {collection, id}` everywhere | Flexible but gives **no DB integrity** and awkward `$lookup`; over-applied. | Keep for genuinely cross-cutting stores (`comments`, `attachments`, `auditLogs`), but use **typed references** for high-value, fixed relationships (`answers.questionId`, `meetingFiles.meetingId`). | Neutral. | Typed refs are easier to index, validate, and query. |
| `repositories` ↔ `repoClassifications` (1:1 via separate collection) | Splitting a strict 1:1 into two collections adds a join for no benefit. | **Embed the classification** into the `repositories` document (it's bounded and always read together). | Neutral. | One fewer collection and join. |
| `answers` as a separate collection | Correct at scale, but with 274 answers and a strong parent, worth stating the trade-off. | **Keep separate** (this one is right — answers are independently authored/accepted and queried by author). Noted here to confirm, not change. | Positive. | None. |
| `meetings` embedding attendees/action-items | **Correct.** Confirm. | Keep embedded. | Fine (meetings are tiny). | None. |

---

## 5. Potential performance issues

| # | Issue | Reality | Recommendation |
|---|---|---|---|
| E.1 | **Vector search / embeddings** | Atlas Vector Search needs a dedicated M10+ tier and an embedding pipeline; the corpus is ~102 files. | Defer entirely. Use a **text index / Atlas Search** first. Revisit RAG when there's a real assistant feature and larger corpus. |
| E.2 | **Index over-provisioning** | The blueprint lists many compound + text indexes per collection. At low-thousands of docs, most queries are covered by 2–3 indexes; extra indexes only slow writes and cost RAM. | Start with the **unique natural-key index + one board index (`{companyKey, status, updatedAt}`) + one date index** per collection. Add others when a slow query is observed, guided by Atlas Performance Advisor. |
| E.3 | **Audit write amplification** | Every write in a transaction also writing `changeHistory` + `activityLog` triples write volume and adds transaction latency. | Inline audit envelope always; `auditLogs` for privileged actions; **`changeHistory` opt-in** per collection (§3.1). |
| E.4 | **Background workers on Vercel** | Change Streams, outbox dispatch, embedding refresh, email queue **all require a persistent process**. Vercel serverless has none — the app already hit this wall (that's why the **remote Claude bridge** exists). The blueprint's event backbone silently assumes infra that isn't there. | Call this out as an infra prerequisite. For now, do side effects **inline** or via scheduled functions; defer the event backbone until a worker host exists. |
| E.5 | **Connection pooling on serverless** | This one the blueprint gets right and it's the **real** performance concern — per-invocation connections would exhaust Atlas. | Keep the pooled singleton guidance; it's the highest-value performance item here. |
| E.6 | **Transactions require a replica set** | Fine on Atlas, but every multi-doc transaction adds latency and failure modes. | Use transactions only for the few genuine multi-collection invariants; prefer single-document atomicity (embedding helps here). |

---

## 6. Over-engineering summary

Ranked by how much complexity they add relative to current value:

1. **The event-driven backbone** (outbox + Change Streams + workers) — infra the platform can't host yet (§E.4). *Highest over-engineering.*
2. **The AI vector/RAG plane** (embeddings, knowledgeBase, vector index, re-embed jobs) — a future feature modeled as core storage.
3. **The workflow engine** (definitions/instances/approvals) — abstraction over a single existing flow.
4. **Full multi-tenant machinery** (ObjectId `tenantId`, tenant-promotion, hashed shard keys) for one hardcoded company.
5. **Three-tier audit** (history + activity + audit) with universal in-transaction diffing.
6. **IAM depth** (separate `users`, `permissions` collection, `apiKeys`) for 22 self-asserted identities.
7. **Denormalization + schemaVersion + Decimal128** micro-optimizations for scale that isn't present.

None of these are *wrong* — they're **right for later**. The risk is spending the migration budget
building infrastructure instead of moving the data.

---

## 7. Recommended simplifications (the MVP collection set)

Build these **~14 collections** first; everything else is a later, triggered addition.

```
Identity/Access   employees (with auth fields + roleKeys), roles
Work              taskTrackerEntries
Q&A               priorityQuestions, answers, questionAssignments, repoQuestions
Meetings          meetings (embedded attendees/action-items), meetingFiles
Repos             repositories (embedded classification), findings
AI                aiRuns, aiExchanges (keep intake challenge-loop fidelity)
Corpus            knowledgeItems  (decisions/glossary/playbooks/security register; OR keep file-based)
Cross-cutting     attachments, auditLogs, notifications, settings
```

Compared to the blueprint this **cuts/defers**: `tenants`(→`companyKey`), `users`(→merged),
`permissions`(→constant), `teams`, `projects`, `dailyTasks`, `workflow*`, `approvals`, `apiKeys`,
`sessions`(use a session store/JWT, not a modeled collection unless server-side revocation is
required), `promptHistory`, `aiSummaries`+`aiDocuments`(→one `aiArtifacts` or inline), `embeddings`,
`knowledgeBase`(→`knowledgeItems` if kept), `activityLogs`+`changeHistory`(→opt-in), `emailQueue`,
`outbox`, `systemConfig`(→`settings`), `modules`(→config), `integrations`(→`settings`+secrets), and
all "recommended additional" collections.

**Scalability impact:** none of these cuts blocks a future upgrade — each deferred collection is an
additive change, not a remodel. **Complexity impact:** roughly a **60% reduction** in collections,
validators, repositories, indexes, and migration steps for Phase 1–6.

### Keep as-is (the blueprint got these right)
- Layered architecture (controller → service → repository → model) and the `BaseRepository`.
- Soft-delete + inline audit envelope.
- Cursor pagination, projection discipline, pooled connection singleton.
- Embedding attendees/action-items in `meetings`; `answers` as a separate collection.
- JSON Schema validators + edge DTO validation.
- Natural keys (`memberKey`, `questionCode`, `repoName`) with unique indexes.

---

## 8. Migration risks (ranked)

| # | Risk | Severity | Why | Mitigation |
|---|---|---|---|---|
| H.1 | **Wrong source of truth.** Blueprint migrates "from SQLite," but SQLite is **ephemeral `/tmp` on Vercel** — prod data lives in **GitHub markdown + bundled corpus**. | **Critical** | Reading SQLite as authoritative could migrate an almost-empty DB and silently lose the real records. | Treat GitHub markdown + `Governance_Files/**` as the **primary** source; use SQLite only where it's the genuine store (locally/where durable). Inventory each entity's *real* source first. |
| H.2 | **Member-key format split** (`Ryan_Cochran` vs `ajay_landge`). | **High** | `memberKey` joins tasks, answers, meetings, questions to people; two formats fracture or merge identities incorrectly. | Define one canonical form + alias map **before** migrating employees; validate every FK resolves post-migration. |
| H.3 | **Lossy question↔answer linking.** Answer markdown files carry the question *text*, not the qid; answers are write-only today. | **High** | Rebuilding the link is fuzzy text-matching; wrong links corrupt Q&A history. | Match on qid where present (`_answered_qids`), else fuzzy-match with a stored `questionMatch.confidence`; leave low-confidence links unlinked for human review rather than guessing. |
| H.4 | **AI-question dedup by normalized title** is fuzzy. | Medium | Title collisions merge distinct questions; near-duplicates slip through. | Store `normalizedTitle`, dedupe deterministically, and reconcile against `questionCode` sequence; report merges. |
| H.5 | **Introducing auth to an open app.** | Medium | The app has no login today; adding a gate changes behavior and user habit. | Soft-launch: seed a user per employee, keep the picker UX during transition, enforce the gate only after adoption. |
| H.6 | **Background-worker infra gap** (§E.4) surfaces at migration time (embedding jobs, outbox). | Medium | Migration steps that assume workers won't run on Vercel. | Run migration as **offline batch jobs** (local/CI), not app endpoints; defer anything needing a persistent worker. |
| H.7 | **Corpus decision unmade** (`_GOVERNANCE/**` file-based vs ingested). | Medium | ~100 files with live parse logic and endpoints (`decisions`, `findings`, `glossary`); an ambiguous plan risks half-migrating them. | Make an explicit keep-file-based vs. ingest decision per corpus type before Phase 7. |
| H.8 | **Dual-write drift** during the shadow period. | Low–Med | Writing to Mongo + GitHub can diverge under partial failures. | Idempotent upserts on natural keys; a reconciliation report; treat one store as authoritative per module at any moment. |

---

## 9. Recommended phasing adjustment

The blueprint's 10 phases are reasonable, but re-sequence to **de-risk data first and defer infra**:

- **Phase 0 (new): Source-of-truth inventory & key canonicalization.** Resolve H.1/H.2/H.3 on paper
  before touching Mongo. Cheapest possible place to catch the costly risks.
- **Phase 1–2:** Foundation + `employees`/`roles` (auth merged into employees; `companyKey` string).
- **Phase 3–6:** Task Tracker → Priority Q&A → Meetings → Repos/Findings, each migrating from its
  *real* source (mostly GitHub), dual-run, verify, cut over.
- **Defer to explicitly-triggered later phases:** the AI vector/RAG plane, workflow engine,
  notifications/email/outbox, multi-tenant promotion, and the `changeHistory`/activity split.
- **Auth gate** enforced only after employee adoption (H.5).

**Scalability impact:** identical end-state; the deferred pieces remain additive. **Complexity
impact:** Phases 1–6 get materially smaller and the two migration-killing risks (H.1, H.3) are
retired before any code is written.

---

## 10. Decisions requested

1. **Scale posture:** build the lean ~14-collection MVP (recommended) or the full 35-collection
   enterprise design now?
2. **Company discriminator:** `companyKey: string` (recommended) or `tenantId: ObjectId` + `tenants`?
3. **Identity:** merge auth into `employees` (recommended) or keep separate `users`?
4. **Governance corpus:** ingest into `knowledgeItems` or keep file-based (with which entities
   promoted — `decisions`, `findings`, `glossary`, `securityRegister`)?
5. **AI plane:** defer embeddings/vector/RAG (recommended) or build now?
6. **Source of truth:** confirm GitHub-markdown-first migration (recommended) given ephemeral SQLite.

None of these change the blueprint's *end-state* vision — they change **how much is built now vs.
later**, and they retire the migration risks up front. Once decided, the blueprint and roadmap can be
annotated accordingly (no code changes implied by this review).
