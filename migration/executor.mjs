// Migration executor (--execute mode).
//
// Reuses the framework's mappers as document PRODUCERS: each mapper is run with a
// `sink` that captures every valid candidate (mappers still never write). The
// executor then finalizes each candidate (envelope + metadata.migration) and
// upserts it into GovernanceDB in batches, logging importJobs + migrationErrors
// and emitting a reconciliation snapshot after every batch.
//
// Writes ONLY to GovernanceDB (via mongoWriter). Idempotent (upsert on natural/
// dedupe keys). Nothing here is wired into the application.

import { MIGRATION_CONFIG } from './config.mjs';
import { MAPPERS, EXECUTION_ORDER, buildReferenceIndex } from './runner.mjs';
import { createCrossRef } from './lib/crossref.mjs';
import { finalizeDocument } from './lib/finalize.mjs';
import { chunk } from './lib/batch.mjs';

/** Order the requested collections by the dependency-safe execution order. */
function orderCollections(collections) {
  return EXECUTION_ORDER.filter((c) => collections.includes(c));
}

/**
 * Execute the migration for the given collections.
 * @param {string[]} collections
 * @param {{ runId: string, quiet?: boolean }} options
 * @param {object} writer  the mongoWriter (already connected to GovernanceDB)
 * @returns run summary (also mirrored into importJobs)
 */
export async function runExecute(collections, options, writer) {
  const { runId } = options;
  const log = (m) => { if (!options.quiet) console.log(m); };

  const crossref = createCrossRef();
  const titleIndex = new Map();
  buildReferenceIndex(crossref, titleIndex);

  const summary = { runId, database: writer.dbName, collections: [], documentsInserted: 0, totalFailed: 0 };

  for (const collection of orderCollections(collections)) {
    log(`\n── execute: ${collection} ──`);

    // 1) Produce candidates via the mapper + a capturing sink.
    const buffer = []; // { coll, candidate, idempotency }
    const sink = (coll, candidate, idempotency) => buffer.push({ coll, candidate, idempotency });
    const report = await MAPPERS[collection]({ crossref, titleIndex, sink });

    // 2) Group by target collection (answers may also emit priorityQuestions).
    const byTarget = new Map();
    for (const item of buffer) {
      if (!byTarget.has(item.coll)) byTarget.set(item.coll, []);
      byTarget.get(item.coll).push(item);
    }

    // 3) Finalize + batch-upsert each target.
    for (const [target, items] of byTarget) {
      let batchIndex = 0;
      let insertedForTarget = 0;
      let failedForTarget = 0;
      const batches = chunk(items, MIGRATION_CONFIG.batchSize);

      for (const batch of batches) {
        const batchId = `${runId}:${target}:${batchIndex}`;
        const docs = batch.map((b) => ({
          doc: finalizeDocument(target, b.candidate, {
            runId,
            batchId,
            crossref,
            naturalKey: Object.values(b.idempotency).join('|'),
          }),
          filter: b.idempotency,
        }));

        const res = await writer.upsertBatch(target, docs);
        insertedForTarget += res.upserted;
        failedForTarget += res.failed;

        // Quarantine write errors.
        if (res.errors.length) {
          await writer.logMigrationErrors(res.errors.map((e) => ({
            runId,
            collection: target,
            batchId,
            stage: 'SCHEMA',
            reason: e.message,
            code: e.code,
            at: new Date(),
          })));
        }

        // Reconciliation snapshot after every batch (persisted to importJobs).
        const runningTotal = await writer.count(target, { 'metadata.migration.runId': runId });
        await writer.logImportJob({
          runId,
          collection: target,
          batchId,
          batchIndex,
          attempted: batch.length,
          upserted: res.upserted,
          matched: res.matched,
          failed: res.failed,
          runningTotalForRun: runningTotal,
          at: new Date(),
        });

        log(`   ${target} batch ${batchIndex}: attempted ${batch.length}, upserted ${res.upserted}, matched ${res.matched}, failed ${res.failed} (run total ${runningTotal})`);
        batchIndex += 1;
      }

      summary.documentsInserted += insertedForTarget;
      summary.totalFailed += failedForTarget;
      summary.collections.push({
        collection: target,
        sourceValid: report.collection === target ? report.validRecords : undefined,
        inserted: insertedForTarget,
        failed: failedForTarget,
        batches: batches.length,
      });
    }

    if (!report.sourceAvailable) {
      log(`   (source unavailable for ${collection} — skipped)`);
      summary.collections.push({ collection, skipped: 'source-unavailable' });
    }
  }

  return summary;
}
