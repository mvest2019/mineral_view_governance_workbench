#!/usr/bin/env node
// Provision GovernanceDB.meetings: create the collection with its $jsonSchema
// validator and its indexes. IDEMPOTENT and WRITE-FREE — it inserts NO records
// and migrates NO GitHub data. Safe to run repeatedly.
//
// Targets ONLY the GovernanceDB database (MONGODB_DB_NAME, default GovernanceDB)
// and never any other database in the cluster.
//
// MIRRORS the canonical TypeScript definitions:
//   - src/db/validators/meetings.validator.ts
//   - src/db/indexes/meetings.indexes.ts
// Keep this mirror in sync with those files.
//
// Usage (local dev only): npm run db:provision:meetings

import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'meetings';

const ACTION_ITEM_STATUS = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
const MEETING_SUMMARY_STATUS = ['NONE', 'DRAFT', 'FINAL'];
const AI_ENGINE = ['CLAUDE', 'OPENAI', 'HEURISTIC'];

const JSON_SCHEMA = {
  bsonType: 'object',
  required: [
    'companyKey', 'title', 'meetingType', 'meetingAt', 'attendees', 'actionItems',
    'priorityQuestionCodes', 'fileIds',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    title: { bsonType: 'string', minLength: 1 },
    meetingType: { bsonType: 'string' },
    organizerKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    meetingAt: { bsonType: 'date' },
    note: { bsonType: 'string' },
    attendees: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['attended', 'followUpDone'],
        properties: {
          employeeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
          externalName: { bsonType: 'string' },
          externalEmail: { bsonType: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
          attended: { bsonType: 'bool' },
          followUpDone: { bsonType: 'bool' },
          followUpNote: { bsonType: 'string' },
        },
      },
    },
    actionItems: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['description', 'status'],
        properties: {
          ownerKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
          description: { bsonType: 'string', minLength: 1 },
          status: { enum: ACTION_ITEM_STATUS },
          dueAt: { bsonType: ['date', 'null'] },
        },
      },
    },
    summary: {
      bsonType: 'object',
      properties: {
        text: { bsonType: 'string' },
        status: { enum: MEETING_SUMMARY_STATUS },
        engine: { enum: AI_ENGINE },
        generatedAt: { bsonType: ['date', 'null'] },
      },
    },
    priorityQuestionCodes: { bsonType: 'array', items: { bsonType: 'string' } },
    fileIds: { bsonType: 'array', items: { bsonType: 'objectId' } },
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

const INDEXES = [
  { key: { companyKey: 1, meetingAt: -1 }, name: 'ix_meetings_company_meetingAt' },
  { key: { companyKey: 1, 'attendees.employeeKey': 1 }, name: 'ix_meetings_company_attendee' },
  { key: { companyKey: 1, title: 'text', note: 'text', 'summary.text': 'text' }, name: 'tx_meetings_company_fulltext' },
];

async function main() {
  const uri = (process.env.MONGODB_URI || '').trim();
  const dbName = (process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB_NAME;
  if (!uri) {
    console.error('✖ MONGODB_URI is not set. Put it in .env.local and retry.');
    process.exit(1);
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000, appName: 'governance-workbench-provision' });
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`→ Provisioning "${COLLECTION}" in database "${dbName}" (no data will be inserted) ...`);
    const existing = await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray();
    if (existing.length === 0) {
      await db.createCollection(COLLECTION, { validator: { $jsonSchema: JSON_SCHEMA }, validationLevel: 'strict', validationAction: 'error' });
      console.log(`  ✔ Created collection "${COLLECTION}" with $jsonSchema validator.`);
    } else {
      await db.command({ collMod: COLLECTION, validator: { $jsonSchema: JSON_SCHEMA }, validationLevel: 'strict', validationAction: 'error' });
      console.log(`  ✔ Updated validator on existing collection "${COLLECTION}".`);
    }
    const names = await db.collection(COLLECTION).createIndexes(INDEXES);
    console.log(`  ✔ Ensured ${INDEXES.length} indexes: ${names.join(', ')}`);
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
