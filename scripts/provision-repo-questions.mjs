#!/usr/bin/env node
// Provision GovernanceDB.repoQuestions. IDEMPOTENT, WRITE-FREE. Targets ONLY
// GovernanceDB. Mirrors repoQuestions.validator.ts + repoQuestions.indexes.ts.
// Usage: npm run db:provision:repo-questions
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'repoQuestions';
const PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const QUESTION_STATUS = ['NEW', 'OPEN', 'ANSWERED', 'ACCEPTED', 'CLOSED'];
const QUESTION_SOURCE = ['MANUAL', 'AI_GENERATED', 'FILE', 'MEETING'];

const JSON_SCHEMA = {
  bsonType: 'object',
  required: ['companyKey', 'questionCode', 'repoName', 'bodyMarkdown', 'priority', 'status', 'source',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version'],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    questionCode: { bsonType: 'string', minLength: 1 },
    repoName: { bsonType: 'string', minLength: 1 },
    title: { bsonType: 'string' },
    bodyMarkdown: { bsonType: 'string', minLength: 1 },
    shortQuestion: { bsonType: 'string' },
    sourceExcerpt: { bsonType: 'string' },
    priority: { enum: PRIORITY },
    status: { enum: QUESTION_STATUS },
    source: { enum: QUESTION_SOURCE },
    sourceRef: { bsonType: 'string' },
    primaryAssigneeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    answerMarkdown: { bsonType: 'string' },
    reviewNote: { bsonType: 'string' },
    reviewedByKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    createdAt: { bsonType: 'date' }, createdBy: { bsonType: 'string' },
    updatedAt: { bsonType: 'date' }, updatedBy: { bsonType: 'string' },
    isDeleted: { bsonType: 'bool' }, deletedAt: { bsonType: ['date', 'null'] },
    deletedBy: { bsonType: ['string', 'null'] }, version: { bsonType: 'int', minimum: 1 },
    metadata: { bsonType: 'object' },
  },
};
const INDEXES = [
  { key: { companyKey: 1, questionCode: 1 }, name: 'ux_repoQuestions_company_code', unique: true, partialFilterExpression: { isDeleted: false } },
  { key: { companyKey: 1, repoName: 1 }, name: 'ix_repoQuestions_company_repo' },
  { key: { companyKey: 1, priority: 1, updatedAt: -1 }, name: 'ix_repoQuestions_company_priority_updated' },
  { key: { companyKey: 1, bodyMarkdown: 'text', title: 'text' }, name: 'tx_repoQuestions_company_fulltext' },
];

async function main() {
  const uri = (process.env.MONGODB_URI || '').trim();
  const dbName = (process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB_NAME;
  if (!uri) { console.error('✖ MONGODB_URI is not set. Put it in .env.local and retry.'); process.exit(1); }
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
    console.error('✖ Provisioning FAILED.'); console.error(`  ${err && err.message ? err.message : err}`); process.exitCode = 1;
  } finally { await client.close(); }
}
main();
