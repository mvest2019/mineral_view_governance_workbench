#!/usr/bin/env node
// Provision GovernanceDB.departments. IDEMPOTENT, WRITE-FREE. Targets ONLY
// GovernanceDB. Mirrors departments.validator.ts + departments.indexes.ts.
// Usage: npm run db:provision:departments
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'departments';

const JSON_SCHEMA = {
  bsonType: 'object',
  required: ['companyKey', 'key', 'name', 'repoScopes',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version'],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    key: { bsonType: 'string', pattern: '^[A-Z][A-Z0-9_]*$' },
    name: { bsonType: 'string', minLength: 1 },
    description: { bsonType: 'string' },
    leadEmployeeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    parentKey: { bsonType: 'string', pattern: '^[A-Z][A-Z0-9_]*$' },
    repoScopes: { bsonType: 'array', items: { bsonType: 'string' } },
    createdAt: { bsonType: 'date' }, createdBy: { bsonType: 'string' },
    updatedAt: { bsonType: 'date' }, updatedBy: { bsonType: 'string' },
    isDeleted: { bsonType: 'bool' }, deletedAt: { bsonType: ['date', 'null'] },
    deletedBy: { bsonType: ['string', 'null'] }, version: { bsonType: 'int', minimum: 1 },
    metadata: { bsonType: 'object' },
  },
};
const INDEXES = [
  { key: { companyKey: 1, key: 1 }, name: 'ux_departments_company_key', unique: true, partialFilterExpression: { isDeleted: false } },
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
