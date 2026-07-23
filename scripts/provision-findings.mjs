#!/usr/bin/env node
// Provision GovernanceDB.findings. IDEMPOTENT, WRITE-FREE. Targets ONLY
// GovernanceDB. Mirrors findings.validator.ts + findings.indexes.ts.
// Usage: npm run db:provision:findings
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'findings';
const FINDING_DECISION = ['OPEN', 'REVIEWED', 'ACCEPTED', 'REJECTED'];

const JSON_SCHEMA = {
  bsonType: 'object',
  required: ['companyKey', 'findingCode', 'decision',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version'],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    findingCode: { bsonType: 'string', pattern: '^F-[0-9-]+$' },
    repoName: { bsonType: 'string' },
    departmentKey: { bsonType: 'string' },
    title: { bsonType: 'string' },
    bodyMarkdown: { bsonType: 'string' },
    severity: { bsonType: 'string' },
    decision: { enum: FINDING_DECISION },
    reviewerKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    reviewedAt: { bsonType: ['date', 'null'] },
    reviewNote: { bsonType: 'string' },
    nextQuestionsNote: { bsonType: 'string' },
    questionCode: { bsonType: 'string' },
    createdAt: { bsonType: 'date' }, createdBy: { bsonType: 'string' },
    updatedAt: { bsonType: 'date' }, updatedBy: { bsonType: 'string' },
    isDeleted: { bsonType: 'bool' }, deletedAt: { bsonType: ['date', 'null'] },
    deletedBy: { bsonType: ['string', 'null'] }, version: { bsonType: 'int', minimum: 1 },
    metadata: { bsonType: 'object' },
  },
};
const INDEXES = [
  { key: { companyKey: 1, findingCode: 1 }, name: 'ux_findings_company_code', unique: true, partialFilterExpression: { isDeleted: false } },
  { key: { companyKey: 1, repoName: 1 }, name: 'ix_findings_company_repo' },
  { key: { companyKey: 1, decision: 1 }, name: 'ix_findings_company_decision' },
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
