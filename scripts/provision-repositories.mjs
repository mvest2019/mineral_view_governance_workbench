#!/usr/bin/env node
// Provision GovernanceDB.repositories. IDEMPOTENT, WRITE-FREE. Targets ONLY
// GovernanceDB. Mirrors repositories.validator.ts + repositories.indexes.ts.
// Usage: npm run db:provision:repositories
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'repositories';
const CONFIDENCE = ['LOW', 'MEDIUM', 'HIGH'];
const REPO_APPROVAL_STATUS = ['PENDING', 'APPROVED', 'REJECTED'];

const JSON_SCHEMA = {
  bsonType: 'object',
  required: ['companyKey', 'name', 'departmentKeys', 'isArchived',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version'],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    name: { bsonType: 'string', minLength: 1 },
    owner: { bsonType: 'string' },
    defaultBranch: { bsonType: 'string' },
    aspectGroup: { bsonType: 'string' },
    departmentKeys: { bsonType: 'array', items: { bsonType: 'string' } },
    classification: {
      bsonType: 'object',
      required: ['approvalStatus'],
      properties: {
        observedPurpose: { bsonType: 'string' },
        proposedCategory: { bsonType: 'string' },
        confidence: { enum: CONFIDENCE },
        canonicalStatus: { bsonType: 'string' },
        evidence: { bsonType: 'string' },
        approvalStatus: { enum: REPO_APPROVAL_STATUS },
        findingCode: { bsonType: 'string' },
        questionCode: { bsonType: 'string' },
        updatedAt: { bsonType: ['date', 'null'] },
      },
    },
    isArchived: { bsonType: 'bool' },
    createdAt: { bsonType: 'date' }, createdBy: { bsonType: 'string' },
    updatedAt: { bsonType: 'date' }, updatedBy: { bsonType: 'string' },
    isDeleted: { bsonType: 'bool' }, deletedAt: { bsonType: ['date', 'null'] },
    deletedBy: { bsonType: ['string', 'null'] }, version: { bsonType: 'int', minimum: 1 },
    metadata: { bsonType: 'object' },
  },
};
const INDEXES = [
  { key: { companyKey: 1, name: 1 }, name: 'ux_repositories_company_name', unique: true, partialFilterExpression: { isDeleted: false } },
  { key: { companyKey: 1, 'classification.approvalStatus': 1 }, name: 'ix_repositories_company_approvalStatus' },
  { key: { companyKey: 1, 'classification.proposedCategory': 1 }, name: 'ix_repositories_company_category' },
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
