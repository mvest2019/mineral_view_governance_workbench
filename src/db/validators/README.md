# `src/db/validators/` — `$jsonSchema` validators (Phase 2+)

Empty in Phase 1 by design. Will hold the per-collection MongoDB `$jsonSchema`
validators (from V1 spec §6), generated from the same enum sets as the edge
validators so the two never drift. Applied via `collMod`/`createCollection` when
each collection is provisioned.
