#!/usr/bin/env node
// Step-9 live verification for the undefined->null fix (run where GovernanceDB
// is reachable). Targets ONLY GovernanceDB.taskTrackerEntries.
//
//   npm run verify:tasktracker            -> insert one entry, report _id + counts
//   npm run verify:tasktracker -- --count -> read-only: report counts + latest entry
//                                            (use after creating an entry from the UI)
//
// The insert path mirrors the shipped app pipeline byte-for-byte:
//   src/db/client.ts options (ignoreUndefined:true) + newBaseDocument
//   + toTaskTrackerEntryFields (optionals omitted) + stripUndefined.
// A successful insert here proves the live validator accepts the document the
// app now produces. GitHub is never touched by this script.
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'taskTrackerEntries';
const COMPANY = 'MView';
const readOnly = process.argv.includes('--count');

// --- mirror of src/models/base.ts stripUndefined ---
function stripUndefined(value) {
  if (Array.isArray(value)) return value.map((v) => stripUndefined(v));
  if (value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out = {};
    for (const [k, v] of Object.entries(value)) { if (v === undefined) continue; out[k] = stripUndefined(v); }
    return out;
  }
  return value;
}
// --- mirror of src/models/base.ts newBaseDocument ---
function newBaseDocument(actor = 'system') {
  const now = new Date();
  return { companyKey: COMPANY, createdAt: now, createdBy: actor, updatedAt: now, updatedBy: actor,
    isDeleted: false, deletedAt: null, deletedBy: null, version: 1 };
}
// --- mirror of the refactored src/models/taskTrackerEntry.model.ts toTaskTrackerEntryFields ---
function toTaskTrackerEntryFields(input) {
  const fields = {
    employeeKey: input.employeeKey, entryDate: input.entryDate,
    title: input.title ?? 'Task Tracker', sections: input.sections ?? [], status: input.status ?? 'SUBMITTED',
  };
  if (input.employeeName !== undefined) fields.employeeName = input.employeeName;
  if (input.bodyMarkdown !== undefined) fields.bodyMarkdown = input.bodyMarkdown;
  if (input.githubRef !== undefined) fields.githubRef = input.githubRef; // absent in the UI flow
  return fields;
}

async function main() {
  const uri = (process.env.MONGODB_URI || '').trim();
  const dbName = (process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB_NAME;
  if (!uri) { console.error('✖ MONGODB_URI is not set. Put it in .env.local and retry.'); process.exit(1); }

  // EXACT client options from src/db/client.ts (note ignoreUndefined:true).
  const client = new MongoClient(uri, {
    maxPoolSize: 20, minPoolSize: 0, maxIdleTimeMS: 60_000, serverSelectionTimeoutMS: 10_000,
    retryWrites: true, retryReads: true, ignoreUndefined: true, appName: 'governance-workbench-verify',
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection(COLLECTION);
    console.log(`→ ${dbName}.${COLLECTION} (${readOnly ? 'read-only' : 'insert'} mode)`);

    const countBefore = await col.countDocuments({ companyKey: COMPANY, isDeleted: false });
    console.log(`  count before: ${countBefore}`);

    if (!readOnly) {
      // The exact document the UI Task Tracker flow now produces (no githubRef).
      const fields = toTaskTrackerEntryFields({
        employeeKey: 'ajay_landge',
        employeeName: 'Ajay Landge',
        entryDate: new Date(),
        title: 'Task Tracker',
        bodyMarkdown: '# Task Tracker\n\nStep-9 verification entry (safe to delete).',
      });
      const doc = stripUndefined({
        ...newBaseDocument('system'),
        ...fields,
        metadata: { verification: 'undefined-null-fix', createdByScript: 'verify-tasktracker-insert' },
      });
      const res = await col.insertOne(doc);
      console.log(`  ✔ inserted _id: ${res.insertedId}`);
      console.log(`  inserted keys: ${Object.keys(doc).join(', ')}`);
      console.log(`  githubRef present in stored doc? ${Object.prototype.hasOwnProperty.call(doc, 'githubRef')}`);
    }

    const countAfter = await col.countDocuments({ companyKey: COMPANY, isDeleted: false });
    const total = await col.estimatedDocumentCount();
    const latest = await col.find({ companyKey: COMPANY }).sort({ createdAt: -1 }).limit(1).toArray();
    console.log(`  count after (MView, live): ${countAfter}`);
    console.log(`  collection total (all): ${total}`);
    if (latest[0]) {
      console.log(`  latest entry _id: ${latest[0]._id} | employeeKey: ${latest[0].employeeKey} | createdAt: ${latest[0].createdAt?.toISOString?.() ?? latest[0].createdAt}`);
    }
    console.log('✔ Verification complete.');
  } catch (err) {
    console.error('✖ Verification FAILED.');
    console.error(`  name: ${err?.name} code: ${err?.code}`);
    console.error(`  message: ${err?.message}`);
    if (err?.errInfo) console.error(`  errInfo: ${JSON.stringify(err.errInfo, null, 2)}`);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}
main();
