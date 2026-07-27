#!/usr/bin/env node
// Provision GovernanceDB.intakes. IDEMPOTENT, WRITE-FREE. Targets ONLY
// GovernanceDB. Mirrors intakes.validator.ts + intakes.indexes.ts.
// Usage: npm run db:provision:intakes
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'intakes';
const APPROVAL_STATUS = ['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED'];

const JSON_SCHEMA = {
  bsonType: 'object',
  required: ['companyKey', 'stage', 'aiEngines', 'files', 'links', 'gates', 'stageHistory',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version'],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    employeeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    sourceType: { bsonType: 'string' },
    aiEngines: { bsonType: 'array', items: { bsonType: 'string' } },
    note: { bsonType: 'string' },
    stage: { bsonType: 'string', minLength: 1 },
    blocker: { bsonType: 'string' },
    files: {
      bsonType: 'array',
      items: {
        bsonType: 'object', required: ['filename'],
        properties: {
          filename: { bsonType: 'string' },
          storageRef: { bsonType: 'object', properties: { provider: { bsonType: 'string' }, bucket: { bsonType: 'string' }, key: { bsonType: 'string' } } },
          sizeBytes: { bsonType: ['int', 'long', 'double'], minimum: 0 },
        },
      },
    },
    links: {
      bsonType: 'array',
      items: { bsonType: 'object', required: ['kind', 'ref'], properties: { kind: { bsonType: 'string' }, ref: { bsonType: 'string' } } },
    },
    gates: {
      bsonType: 'array',
      items: {
        bsonType: 'object', required: ['name', 'status'],
        properties: {
          name: { bsonType: 'string' },
          status: { enum: APPROVAL_STATUS },
          approverKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
          decidedAt: { bsonType: ['date', 'null'] },
          note: { bsonType: 'string' },
        },
      },
    },
    stageHistory: {
      bsonType: 'array',
      items: {
        bsonType: 'object', required: ['stage', 'at'],
        properties: { stage: { bsonType: 'string' }, at: { bsonType: 'date' }, actorKey: { bsonType: 'string' }, note: { bsonType: 'string' } },
      },
    },
    createdAt: { bsonType: 'date' }, createdBy: { bsonType: 'string' },
    updatedAt: { bsonType: 'date' }, updatedBy: { bsonType: 'string' },
    isDeleted: { bsonType: 'bool' }, deletedAt: { bsonType: ['date', 'null'] },
    deletedBy: { bsonType: ['string', 'null'] }, version: { bsonType: 'int', minimum: 1 },
    metadata: { bsonType: 'object' },
  },
};
const INDEXES = [
  { key: { companyKey: 1, stage: 1, updatedAt: -1 }, name: 'ix_intakes_company_stage_updated' },
  { key: { companyKey: 1, employeeKey: 1 }, name: 'ix_intakes_company_employee' },
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
