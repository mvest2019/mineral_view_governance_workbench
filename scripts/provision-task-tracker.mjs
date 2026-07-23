#!/usr/bin/env node
// Provision GovernanceDB.taskTrackerEntries: create the collection with its
// $jsonSchema validator and its indexes. IDEMPOTENT and WRITE-FREE — it inserts
// NO records and migrates NO GitHub data; it only sets up structure. Safe to
// run repeatedly.
//
// Targets ONLY the GovernanceDB database (from MONGODB_DB_NAME, default
// GovernanceDB) and never any other database in the cluster.
//
// MIRRORS the canonical TypeScript definitions:
//   - src/db/validators/taskTrackerEntries.validator.ts
//   - src/db/indexes/taskTrackerEntries.indexes.ts
//   - src/db/provision.ts
// Keep this mirror in sync with those files.
//
// Usage (local dev only): npm run db:provision:task-tracker

import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'taskTrackerEntries';

const TASK_STATUS = ['DRAFT', 'SUBMITTED', 'REVIEWED'];

const TASK_TRACKER_ENTRIES_JSON_SCHEMA = {
  bsonType: 'object',
  required: [
    'companyKey', 'employeeKey', 'entryDate', 'title', 'sections', 'status',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    employeeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    employeeName: { bsonType: 'string' },
    entryDate: { bsonType: 'date' },
    title: { bsonType: 'string', minLength: 1 },
    bodyMarkdown: { bsonType: 'string' },
    sections: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['heading', 'items'],
        properties: {
          heading: { bsonType: 'string' },
          items: { bsonType: 'array', items: { bsonType: 'string' } },
        },
      },
    },
    status: { enum: TASK_STATUS },
    githubRef: {
      bsonType: 'object',
      properties: {
        path: { bsonType: 'string' },
        sha: { bsonType: 'string' },
        commitUrl: { bsonType: 'string' },
      },
    },
    createdAt: { bsonType: 'date' },
    createdBy: { bsonType: 'string' },
    updatedAt: { bsonType: 'date' },
    updatedBy: { bsonType: 'string' },
    isDeleted: { bsonType: 'bool' },
    deletedAt: { bsonType: ['date', 'null'] },
    deletedBy: { bsonType: ['string', 'null'] },
    version: { bsonType: 'int', minimum: 1 },
    metadata: { bsonType: 'object' },
  },
};

const TASK_TRACKER_ENTRIES_INDEXES = [
  { key: { companyKey: 1, employeeKey: 1, entryDate: -1 }, name: 'ix_tasktracker_company_employee_date' },
  { key: { companyKey: 1, entryDate: -1 }, name: 'ix_tasktracker_company_date' },
  { key: { companyKey: 1, bodyMarkdown: 'text', title: 'text' }, name: 'tx_tasktracker_company_fulltext' },
];

async function main() {
  const uri = (process.env.MONGODB_URI || '').trim();
  const dbName = (process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB_NAME;
  if (!uri) {
    console.error('✖ MONGODB_URI is not set. Put it in .env.local and retry.');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    appName: 'governance-workbench-provision',
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`→ Provisioning "${COLLECTION}" in database "${dbName}" (no data will be inserted) ...`);

    const existing = await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray();
    if (existing.length === 0) {
      await db.createCollection(COLLECTION, {
        validator: { $jsonSchema: TASK_TRACKER_ENTRIES_JSON_SCHEMA },
        validationLevel: 'strict',
        validationAction: 'error',
      });
      console.log(`  ✔ Created collection "${COLLECTION}" with $jsonSchema validator.`);
    } else {
      await db.command({
        collMod: COLLECTION,
        validator: { $jsonSchema: TASK_TRACKER_ENTRIES_JSON_SCHEMA },
        validationLevel: 'strict',
        validationAction: 'error',
      });
      console.log(`  ✔ Updated validator on existing collection "${COLLECTION}".`);
    }

    const names = await db.collection(COLLECTION).createIndexes(TASK_TRACKER_ENTRIES_INDEXES);
    console.log(`  ✔ Ensured ${TASK_TRACKER_ENTRIES_INDEXES.length} indexes: ${names.join(', ')}`);

    const count = await db.collection(COLLECTION).countDocuments({});
    console.log(`  ℹ Document count in "${COLLECTION}": ${count} (unchanged — nothing was inserted).`);
    console.log('✔ Provisioning complete.');
  } catch (err) {
    console.error('✖ Provisioning FAILED.');
    console.error(`  ${err && err.message ? err.message : err}`);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
