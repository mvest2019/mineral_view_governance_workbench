#!/usr/bin/env node
// Provision GovernanceDB.aiExchanges. IDEMPOTENT, WRITE-FREE. Targets ONLY
// GovernanceDB. Mirrors aiExchanges.validator.ts + aiExchanges.indexes.ts.
// Usage: npm run db:provision:ai-exchanges
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'aiExchanges';

const JSON_SCHEMA = {
  bsonType: 'object',
  required: ['companyKey', 'intakeId', 'status', 'agreementStatus', 'nextAction',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version'],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    intakeId: { bsonType: 'objectId' },
    topic: { bsonType: 'string' },
    sourceEngine: { bsonType: 'string' },
    targetEngine: { bsonType: 'string' },
    status: { bsonType: 'string', minLength: 1 },
    sourceRunId: { bsonType: 'objectId' },
    sourcePrompt: { bsonType: 'string' },
    sourceOutput: { bsonType: 'string' },
    targetPrompt: { bsonType: 'string' },
    targetOutput: { bsonType: 'string' },
    agreementStatus: { bsonType: 'string' },
    nextAction: { bsonType: 'string' },
    errorText: { bsonType: 'string' },
    createdAt: { bsonType: 'date' }, createdBy: { bsonType: 'string' },
    updatedAt: { bsonType: 'date' }, updatedBy: { bsonType: 'string' },
    isDeleted: { bsonType: 'bool' }, deletedAt: { bsonType: ['date', 'null'] },
    deletedBy: { bsonType: ['string', 'null'] }, version: { bsonType: 'int', minimum: 1 },
    metadata: { bsonType: 'object' },
  },
};
const INDEXES = [
  { key: { companyKey: 1, intakeId: 1 }, name: 'ix_aiExchanges_company_intake' },
  { key: { companyKey: 1, status: 1, updatedAt: -1 }, name: 'ix_aiExchanges_company_status_updated' },
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
