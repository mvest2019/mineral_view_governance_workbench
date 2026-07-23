#!/usr/bin/env node
// Provision GovernanceDB.employees: create the collection with its $jsonSchema
// validator and its indexes. IDEMPOTENT and WRITE-FREE — it inserts NO employee
// records; it only sets up structure. Safe to run repeatedly.
//
// It targets ONLY the GovernanceDB database (from MONGODB_DB_NAME, default
// GovernanceDB) and never any other database in the cluster.
//
// This standalone script MIRRORS the canonical TypeScript definitions:
//   - src/db/validators/employees.validator.ts
//   - src/db/indexes/employees.indexes.ts
//   - src/db/provision.ts
// It re-declares them in plain ESM so it can run with `node` (no build step).
// If you change the TS definitions, update this mirror to match.
//
// Usage (local dev only — the sandbox cannot reach the cluster):
//   npm run db:provision:employees        # loads .env.local automatically

import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'employees';

const ENTITY_STATUS = ['ACTIVE', 'INACTIVE', 'OFFBOARDED'];
const ROLE_KEY = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'VIEWER'];

const EMPLOYEES_JSON_SCHEMA = {
  bsonType: 'object',
  required: [
    'companyKey', 'memberKey', 'fullName', 'departmentKeys', 'roleKeys', 'status',
    'aliases', 'repoScopes', 'profile',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    memberKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    aliases: { bsonType: 'array', items: { bsonType: 'string' } },
    fullName: { bsonType: 'string', minLength: 1 },
    email: { bsonType: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
    title: { bsonType: 'string' },
    purpose: { bsonType: 'string' },
    departmentKeys: { bsonType: 'array', items: { bsonType: 'string' } },
    reportsToKey: { bsonType: 'string' },
    repoScopes: { bsonType: 'array', items: { bsonType: 'string' } },
    status: { enum: ENTITY_STATUS },
    profile: { bsonType: 'object' },
    roleKeys: { bsonType: 'array', minItems: 1, items: { enum: ROLE_KEY } },
    auth: {
      bsonType: 'object',
      properties: {
        passwordHash: { bsonType: 'string' },
        lastLoginAt: { bsonType: ['date', 'null'] },
        failedLoginCount: { bsonType: 'int', minimum: 0 },
        mfaEnabled: { bsonType: 'bool' },
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

const EMPLOYEES_INDEXES = [
  {
    key: { companyKey: 1, memberKey: 1 },
    name: 'ux_employees_company_memberKey',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
  { key: { companyKey: 1, departmentKeys: 1 }, name: 'ix_employees_company_departmentKeys' },
  { key: { companyKey: 1, status: 1 }, name: 'ix_employees_company_status' },
  {
    key: { companyKey: 1, fullName: 'text', title: 'text', purpose: 'text' },
    name: 'tx_employees_company_fulltext',
  },
];

async function main() {
  const uri = (process.env.MONGODB_URI || '').trim();
  const dbName = (process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB_NAME;
  if (!uri) {
    console.error('✖ MONGODB_URI is not set. Put it in .env.local and retry.');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    appName: 'governance-workbench-provision',
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`→ Provisioning "${COLLECTION}" in database "${dbName}" (no data will be inserted) ...`);

    const existing = await db.listCollections({ name: COLLECTION }, { nameOnly: true }).toArray();
    if (existing.length === 0) {
      await db.createCollection(COLLECTION, {
        validator: { $jsonSchema: EMPLOYEES_JSON_SCHEMA },
        validationLevel: 'strict',
        validationAction: 'error',
      });
      console.log(`  ✔ Created collection "${COLLECTION}" with $jsonSchema validator.`);
    } else {
      await db.command({
        collMod: COLLECTION,
        validator: { $jsonSchema: EMPLOYEES_JSON_SCHEMA },
        validationLevel: 'strict',
        validationAction: 'error',
      });
      console.log(`  ✔ Updated validator on existing collection "${COLLECTION}".`);
    }

    const names = await db.collection(COLLECTION).createIndexes(EMPLOYEES_INDEXES);
    console.log(`  ✔ Ensured ${EMPLOYEES_INDEXES.length} indexes: ${names.join(', ')}`);

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
