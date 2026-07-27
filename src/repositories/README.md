# `src/repositories/` — Data access (one per collection)

`base.repository.ts` (Phase 1) is the generic foundation: companyKey injection,
audit stamping, soft-delete filtering, optimistic-concurrency updates. It is
defined but not bound to any real collection yet.

**Future phases:** one repository per V1 collection extends `BaseRepository`
(e.g. `class EmployeeRepository extends BaseRepository<EmployeeDoc>`), adding
only collection-specific queries. All MongoDB access goes through repositories;
services never touch the driver directly.
