// Rollback framework.
//
// This module DESIGNS and PLANS rollback but does NOT execute anything in this
// phase — the migration framework is dry-run only and writes nothing, so there
// is nothing to roll back. The execute* functions are intentionally disabled
// and will throw if called, until the (separately-approved) execution phase
// wires them to a real MongoDB connection.
//
// Rollback strategy (per docs/MONGODB_MIGRATION_DESIGN.md §9):
//   1. Sources are never modified — the ultimate rollback is "keep using
//      GitHub + SQLite".
//   2. Take an Atlas PITR snapshot immediately before an execution run.
//   3. Every inserted document (future) carries metadata.migration.runId; a run
//      is reversed by deleteMany({ 'metadata.migration.runId': runId }) per
//      collection (collections were empty pre-migration, so this is exact).
//   4. Idempotent re-run repairs partial state (upserts converge).
//   5. Per-collection drop + re-provision + re-migrate in isolation.

export const ROLLBACK_DISABLED_MESSAGE =
  'Rollback execution is disabled in the framework (dry-run) phase. Nothing has '
  + 'been written to MongoDB, so there is nothing to roll back.';

/** Build the deterministic filter that a future rollback would use. Pure. */
export function planRollback(runId) {
  if (!runId) throw new Error('planRollback requires a runId');
  return {
    description: `Delete every document tagged with migration runId ${runId}`,
    filterPerCollection: { 'metadata.migration.runId': runId },
    note: 'Safe because target collections were empty before migration.',
  };
}

/** Execution guard — refuses to run in this phase. */
export async function executeRollback() {
  throw new Error(ROLLBACK_DISABLED_MESSAGE);
}
