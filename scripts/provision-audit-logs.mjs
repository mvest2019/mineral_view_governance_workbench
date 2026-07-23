#!/usr/bin/env node
// Provision GovernanceDB.auditLogs. IDEMPOTENT, WRITE-FREE. Targets ONLY
// GovernanceDB. Mirrors auditLogs.validator.ts + auditLogs.indexes.ts.
// Usage: npm run db:provision:audit-logs
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'auditLogs';
const AUDIT_CATEGORY = ['SECURITY', 'ACTIVITY'];
const AUDIT_OUTCOME = ['SUCCESS', 'DENIED', 'ERROR'];

const JSON_SCHEMA = {
  bsonType: 'object',
  required: ['companyKey', 'category', 'actorKey', 'action', 'at',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version'],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    category: { enum: AUDIT_CATEGORY },
    actorKey: { bsonType: 'string', minLength: 1 },
    action: { bsonType: 'string', minLength: 1 },
    verb: { bsonType: 'string' },
    target: {
      bsonType: 'object', required: ['collection', 'id'],
      properties: { collection: { bsonType: 'string' }, id: { bsonType: ['objectId', 'string'] }, field: { bsonType: 'string' } },
    },
    summary: { bsonType: 'string' },
    outcome: { enum: AUDIT_OUTCOME },
    context: { bsonType: 'object' },
    at: { bsonType: 'date' },
    createdAt: { bsonType: 'date' }, createdBy: { bsonType: 'string' },
    updatedAt: { bsonType: 'date' }, updatedBy: { bsonType: 'string' },
    isDeleted: { bsonType: 'bool' }, deletedAt: { bsonType: ['date', 'null'] },
    deletedBy: { bsonType: ['string', 'null'] }, version: { bsonType: 'int', minimum: 1 },
    metadata: { bsonType: 'object' },
  },
};
const INDEXES = [
  { key: { companyKey: 1, at: -1 }, name: 'ix_auditLogs_company_at' },
  { key: { companyKey: 1, 'target.collection': 1, 'target.id': 1, at: -1 }, name: 'ix_auditLogs_company_target_at' },
  { key: { companyKey: 1, actorKey: 1, at: -1 }, name: 'ix_auditLogs_company_actor_at' },
  { key: { companyKey: 1, category: 1, at: -1 }, name: 'ix_auditLogs_company_category_at' },
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
