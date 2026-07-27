# `src/models/` — Document types & schemas

`base.ts` (implemented in Phase 1) defines the shared **base envelope**
(`BaseDocument`) and audit helpers that every V1 collection reuses.

**Future phases:** one file per V1 collection (`employee.model.ts`,
`priorityQuestion.model.ts`, …) defining that collection's TypeScript document
type (extending `BaseDocument`) plus its edge-validation schema. No document
type here creates a collection — collections are created lazily on first write.
