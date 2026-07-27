#!/usr/bin/env node
// Provision GovernanceDB.aiRuns. IDEMPOTENT, WRITE-FREE. Targets ONLY
// GovernanceDB. Mirrors aiRuns.validator.ts + aiRuns.indexes.ts.
// Usage: npm run db:provision:ai-runs
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'aiRuns';
const AI_ENGINE = ['CLAUDE', 'OPENAI', 'HEURISTIC'];
const AI_STATUS = ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED'];
const AI_ACTION_TYPE = ['SUMMARY', 'ANALYSIS', 'GENERATE_QUESTIONS', 'PARSE_ANSWERS', 'CHAT', 'CLASSIFY', 'FOLLOW_UP'];

const JSON_SCHEMA = {
  bsonType: 'object',
  required: ['companyKey', 'engine', 'actionType', 'subject', 'status', 'startedAt',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version'],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    engine: { enum: AI_ENGINE },
    model: { bsonType: 'string' },
    actionType: { enum: AI_ACTION_TYPE },
    subject: {
      bsonType: 'object', required: ['collection', 'id'],
      properties: { collection: { bsonType: 'string' }, id: { bsonType: ['objectId', 'string'] }, field: { bsonType: 'string' } },
    },
    status: { enum: AI_STATUS },
    startedAt: { bsonType: 'date' },
    completedAt: { bsonType: ['date', 'null'] },
    promptText: { bsonType: 'string' },
    outputText: { bsonType: 'string' },
    outputStorageRef: { bsonType: 'object', properties: { provider: { bsonType: 'string' }, bucket: { bsonType: 'string' }, key: { bsonType: 'string' } } },
    errorText: { bsonType: 'string' },
    exchangeId: { bsonType: 'objectId' },
    createdAt: { bsonType: 'date' }, createdBy: { bsonType: 'string' },
    updatedAt: { bsonType: 'date' }, updatedBy: { bsonType: 'string' },
    isDeleted: { bsonType: 'bool' }, deletedAt: { bsonType: ['date', 'null'] },
    deletedBy: { bsonType: ['string', 'null'] }, version: { bsonType: 'int', minimum: 1 },
    metadata: { bsonType: 'object' },
  },
};
const INDEXES = [
  { key: { companyKey: 1, 'subject.collection': 1, 'subject.id': 1, startedAt: -1 }, name: 'ix_aiRuns_company_subject_started' },
  { key: { companyKey: 1, engine: 1, status: 1 }, name: 'ix_aiRuns_company_engine_status' },
  { key: { companyKey: 1, startedAt: -1 }, name: 'ix_aiRuns_company_started' },
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
