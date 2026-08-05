#!/usr/bin/env node
// Provision GovernanceDB.sourceMaterials: create the collection with its
// $jsonSchema validator and indexes. IDEMPOTENT and WRITE-FREE — inserts NO
// documents. Targets ONLY GovernanceDB. Safe to run repeatedly.
//
// MIRRORS the canonical TypeScript definitions:
//   - src/db/validators/sourceMaterials.validator.ts
//   - src/db/indexes/sourceMaterials.indexes.ts
//   - src/db/provision.ts (provisionSourceMaterials)
//
// Usage:  npm run db:provision:source-materials
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'sourceMaterials';
const SOURCE_MATERIAL_STATUS = ['active', 'archived', 'deleted'];

const SOURCE_MATERIALS_JSON_SCHEMA = {
  bsonType: 'object',
  required: [
    'companyKey', 'employeeKey', 'employeeName', 'fileName', 'originalFileName',
    'content', 'contentBytes', 'uploadedAt', 'uploadedBy', 'status',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    employeeKey: { bsonType: 'string', minLength: 1 },
    employeeName: { bsonType: 'string', minLength: 1 },
    fileName: { bsonType: 'string', pattern: '\\.md$' },
    originalFileName: { bsonType: 'string', minLength: 1 },
    content: { bsonType: 'string' },
    contentBytes: { bsonType: 'int', minimum: 0 },
    uploadedAt: { bsonType: 'date' },
    uploadedBy: { bsonType: 'string', minLength: 1 },
    status: { enum: SOURCE_MATERIAL_STATUS },
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

const SOURCE_MATERIALS_INDEXES = [
  { key: { companyKey: 1, uploadedAt: -1 }, name: 'ix_sourceMaterials_company_uploadedAt' },
  { key: { companyKey: 1, employeeKey: 1, uploadedAt: -1 }, name: 'ix_sourceMaterials_company_employee_uploadedAt' },
];

function resolveUri() {
  return (process.env.MONGODB_URI || process.env.CLAUDE_BRIDGE_MONGODB_URI || process.env.MONGO_BRIDGE_URI || '').trim();
}
function resolveDb() {
  return (process.env.MONGODB_DB_NAME || process.env.CLAUDE_BRIDGE_MONGODB_DB || process.env.MONGO_BRIDGE_DB || '').trim() || DEFAULT_DB_NAME;
}

async function main() {
  const uri = resolveUri();
  const dbName = resolveDb();
  if (!uri) {
    console.error('✖ No connection string. Set MONGODB_URI (or CLAUDE_BRIDGE_MONGODB_URI) and retry.');
    process.exit(1);
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000, appName: 'governance-workbench-provision' });
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`→ Provisioning "${COLLECTION}" in database "${dbName}" (no data will be inserted) ...`);

    const existing = await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray();
    const opts = { validator: { $jsonSchema: SOURCE_MATERIALS_JSON_SCHEMA }, validationLevel: 'strict', validationAction: 'error' };
    if (existing.length === 0) {
      await db.createCollection(COLLECTION, opts);
      console.log(`  ✔ Created collection "${COLLECTION}" with $jsonSchema validator.`);
    } else {
      await db.command({ collMod: COLLECTION, ...opts });
      console.log(`  ✔ Updated validator on existing collection "${COLLECTION}".`);
    }

    const names = await db.collection(COLLECTION).createIndexes(SOURCE_MATERIALS_INDEXES);
    console.log(`  ✔ Ensured ${SOURCE_MATERIALS_INDEXES.length} indexes: ${names.join(', ')}`);

    const count = await db.collection(COLLECTION).countDocuments({});
    console.log(`  ℹ Document count in "${COLLECTION}": ${count} (unchanged — nothing was inserted).`);
    console.log('✔ Provisioning complete. Uploads from the Source Material tab will now be stored here.');
  } catch (err) {
    console.error('✖ Provisioning FAILED.');
    console.error(`  ${err && err.message ? err.message : err}`);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
