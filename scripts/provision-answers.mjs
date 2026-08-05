#!/usr/bin/env node
// Provision GovernanceDB.answers: create the collection with its $jsonSchema
// validator and its indexes. IDEMPOTENT and WRITE-FREE — it inserts NO records
// and migrates NO GitHub data. Safe to run repeatedly.
//
// Targets ONLY the GovernanceDB database (MONGODB_DB_NAME, default GovernanceDB)
// and never any other database in the cluster.
//
// MIRRORS the canonical TypeScript definitions:
//   - src/db/validators/answers.validator.ts
//   - src/db/indexes/answers.indexes.ts
// Keep this mirror in sync with those files.
//
// Usage (local dev only): npm run db:provision:answers

import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'answers';

const QUESTION_KIND = ['PRIORITY', 'REPO'];
const CONFIDENCE = ['LOW', 'MEDIUM', 'HIGH'];
const ANSWER_MATCH_STRATEGY = ['QID', 'FUZZY_TITLE', 'MANUAL', 'UNLINKED'];

const JSON_SCHEMA = {
  bsonType: 'object',
  required: [
    'companyKey', 'questionCode', 'questionKind', 'answerMarkdown', 'answeredAt',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    questionCode: { bsonType: 'string', minLength: 1 },
    questionKind: { enum: QUESTION_KIND },
    answerMarkdown: { bsonType: 'string', minLength: 1 },
    answeredByKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    answeredByName: { bsonType: 'string' },
    answeredAt: { bsonType: 'date' },
    questionMatch: {
      bsonType: 'object',
      required: ['strategy', 'confidence'],
      properties: {
        strategy: { enum: ANSWER_MATCH_STRATEGY },
        confidence: { enum: CONFIDENCE },
      },
    },
    acceptedByKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    acceptedAt: { bsonType: ['date', 'null'] },
    sourceFileId: { bsonType: 'objectId' },
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

const INDEXES = [
  { key: { companyKey: 1, questionCode: 1, answeredAt: -1 }, name: 'ix_answers_company_question_answeredAt' },
  { key: { companyKey: 1, answeredByKey: 1, answeredAt: -1 }, name: 'ix_answers_company_author_answeredAt' },
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
