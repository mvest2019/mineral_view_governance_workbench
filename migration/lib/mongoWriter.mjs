// MongoDB writer for the EXECUTION phase.
//
// This is the ONLY module that connects to MongoDB and writes. It connects to
// GovernanceDB exclusively (name from MONGODB_DB_NAME, default GovernanceDB) and
// touches no other database. Used only in --execute / --rollback modes; --dry-run
// never constructs a writer.
//
// Idempotency: upserts use $setOnInsert keyed on a natural/dedupe filter, so a
// re-run never duplicates (existing docs are matched and left unchanged).

import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';

/** Names of collections the migration is allowed to write to (V1 + logs). */
export const WRITABLE_COLLECTIONS = new Set([
  'employees', 'taskTrackerEntries', 'priorityQuestions', 'answers', 'meetings',
  'repositories', 'departments', 'roles', 'questionAssignments', 'repoQuestions',
  'findings', 'intakes', 'aiRuns', 'aiExchanges', 'attachments', 'auditLogs', 'settings',
  'importJobs', 'migrationErrors',
]);

/** Create a writer bound to GovernanceDB. Throws if MONGODB_URI is missing. */
export async function createWriter() {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) {
    throw new Error('MONGODB_URI is not set — execution requires a connection to GovernanceDB.');
  }
  const dbName = (process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB_NAME;
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    retryWrites: true,
    appName: 'governance-migration',
  });
  await client.connect();
  const db = client.db(dbName);

  function guard(collection) {
    if (!WRITABLE_COLLECTIONS.has(collection)) {
      throw new Error(`Refusing to write to non-migration collection "${collection}".`);
    }
  }

  return {
    dbName,

    /**
     * Idempotent batch upsert. `items` = [{ doc, filter }]. `filter` is the
     * natural/dedupe key (companyKey is added). Uses $setOnInsert so existing
     * documents are matched and left unchanged. ordered:false → one bad doc does
     * not abort the batch; write errors are returned for quarantine.
     */
    async upsertBatch(collection, items) {
      guard(collection);
      if (!items.length) return { upserted: 0, matched: 0, failed: 0, errors: [] };
      const ops = items.map((it) => ({
        updateOne: {
          filter: { companyKey: it.doc.companyKey, ...it.filter },
          update: { $setOnInsert: it.doc },
          upsert: true,
        },
      }));
      try {
        const res = await db.collection(collection).bulkWrite(ops, { ordered: false });
        return { upserted: res.upsertedCount, matched: res.matchedCount, failed: 0, errors: [] };
      } catch (err) {
        const writeErrors = (err && err.writeErrors) || [];
        const result = err && err.result;
        return {
          upserted: result ? (result.nUpserted || result.upsertedCount || 0) : 0,
          matched: result ? (result.nMatched || result.matchedCount || 0) : 0,
          failed: writeErrors.length || 1,
          errors: writeErrors.length
            ? writeErrors.map((w) => ({ index: w.index, code: w.code, message: w.errmsg }))
            : [{ index: -1, code: err.code, message: err.message }],
        };
      }
    },

    /** Append one importJobs log document. */
    async logImportJob(doc) {
      guard('importJobs');
      await db.collection('importJobs').insertOne(doc);
    },

    /** Append migrationErrors quarantine documents. */
    async logMigrationErrors(docs) {
      if (!docs.length) return;
      guard('migrationErrors');
      await db.collection('migrationErrors').insertMany(docs, { ordered: false });
    },

    /** Count documents (used for reconciliation). */
    async count(collection, filter) {
      guard(collection);
      return db.collection(collection).countDocuments(filter || {});
    },

    /**
     * Roll back a run: delete every document tagged with the given migration
     * runId across the writable business collections. Returns per-collection
     * deleted counts. Never touches importJobs/migrationErrors history.
     */
    async rollbackRun(runId, collections) {
      const out = {};
      for (const c of collections) {
        guard(c);
        const res = await db.collection(c).deleteMany({ 'metadata.migration.runId': runId });
        out[c] = res.deletedCount;
      }
      return out;
    },

    async close() { await client.close(); },
  };
}
