# `src/` — MongoDB data layer (Phase 1 foundation)

This tree is the new, **isolated** MongoDB data layer for the Governance
Workbench, built to the approved `docs/MONGODB_V1_SPECIFICATION.md`.

> **Phase 1 status:** foundation only. This layer establishes and health-checks a
> connection to the **GovernanceDB** database on the MView-Staging cluster and
> provides reusable base utilities. It creates **no collections**, writes **no
> data**, implements **no business logic**, and is **not imported by any existing
> application code** — so current behavior (including GitHub-based storage,
> which remains the source of truth) is completely unchanged.

## Layout

```
src/
├── config/         env loading + validation (MONGODB_URI, GovernanceDB)   [Phase 1]
├── constants/      collection-name registry + enum value sets             [Phase 1]
├── db/             connection, GovernanceDB handle, health check          [Phase 1]
│   ├── indexes/    per-collection index definitions                       [Phase 2+]
│   └── validators/ per-collection $jsonSchema validators                  [Phase 2+]
├── models/         base envelope (Phase 1) + per-collection doc types      [Phase 2+]
├── repositories/   BaseRepository (Phase 1) + per-collection repos         [Phase 2+]
├── services/       business logic                                          [Phase 2+]
├── validators/     shared edge-validation helpers                          [Phase 2+]
└── utils/          pure helpers (ObjectId, …)                             [Phase 1]
```

## Guardrails

- **Only GovernanceDB.** `src/db/connection.ts` always resolves the database from
  config (default `GovernanceDB`). Feature code cannot reach another database in
  the cluster.
- **No collection creation.** Obtaining a `Db`/`Collection` handle does nothing on
  the server; MongoDB creates a collection lazily on first write. Phase 1 never
  writes.
- **Singleton connection.** `src/db/client.ts` caches one connected client on
  `globalThis` so Next.js HMR and Vercel serverless reuse it instead of opening a
  new connection per request/invocation.

## Verifying the connection

```bash
# Requires MONGODB_URI in the environment (or .env.local).
npm run mongo:health
```

The script pings GovernanceDB and lists existing collections (read-only). It
creates nothing.

## How a future phase adds a V1 collection

1. Add its document type in `src/models/<name>.model.ts` (extends `BaseDocument`).
2. Add its `$jsonSchema` validator in `src/db/validators/` and indexes in
   `src/db/indexes/` (from the V1 spec §5–§6).
3. Add `class <Name>Repository extends BaseRepository<...>` in
   `src/repositories/`.
4. Add business logic in `src/services/` and wire it behind the API route.

The collection name already exists in `src/constants/collections.ts`.
