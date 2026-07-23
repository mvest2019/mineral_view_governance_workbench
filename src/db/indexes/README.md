# `src/db/indexes/` — Index definitions (Phase 2+)

Empty in Phase 1 by design. Will hold idempotent `createIndexes` definitions per
collection (from V1 spec §5), applied by a provisioning step as each collection
is implemented. Creating an index is deferred until its collection exists.
