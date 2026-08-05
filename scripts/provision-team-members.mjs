#!/usr/bin/env node
// Provision GovernanceDB.team_members: create the collection with its
// $jsonSchema validator and its indexes. IDEMPOTENT and WRITE-FREE — it inserts
// NO documents; it only sets up structure. Safe to run repeatedly.
//
// Targets ONLY the GovernanceDB database and never any other database.
//
// MIRRORS the canonical TypeScript definitions:
//   - src/db/validators/team_members.validator.ts
//   - src/db/indexes/team_members.indexes.ts
//   - src/db/provision.ts (provisionTeamMembers)
// If you change the TS definitions, update this mirror to match.
//
// Usage:  npm run db:provision:team-members
import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';
const COLLECTION = 'team_members';
const ENTITY_STATUS = ['ACTIVE', 'INACTIVE', 'OFFBOARDED'];

const TEAM_MEMBERS_JSON_SCHEMA = {
  bsonType: 'object',
  required: [
    'companyKey', 'memberKey', 'fullName', 'role', 'purpose', 'departments',
    'repos', 'operatingSources', 'sections', 'rawMarkdown', 'hasProfileDoc', 'status',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    memberKey: { bsonType: 'string', pattern: '^[A-Za-z0-9]+(_[A-Za-z0-9]+)*$' },
    slug: { bsonType: ['string', 'null'] },
    fullName: { bsonType: 'string', minLength: 1 },
    role: { bsonType: 'string' },
    purpose: { bsonType: 'string' },
    departments: { bsonType: 'array', items: { bsonType: 'string' } },
    repos: { bsonType: 'array', items: { bsonType: 'string' } },
    operatingSources: { bsonType: 'array', items: { bsonType: 'string' } },
    title: { bsonType: 'string' },
    departmentLabel: { bsonType: 'string' },
    reportsTo: { bsonType: 'string' },
    experience: { bsonType: 'string' },
    finalAuthority: { bsonType: 'string' },
    primarySurfaces: { bsonType: 'array', items: { bsonType: 'string' } },
    focus: { bsonType: 'string' },
    priorities: { bsonType: 'array', items: { bsonType: 'string' } },
    skills: { bsonType: 'object' },
    reviewCadence: { bsonType: 'string' },
    lastUpdatedLabel: { bsonType: 'string' },
    sourceNote: { bsonType: 'string' },
    sections: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['title', 'markdown'],
        properties: {
          number: { bsonType: ['int', 'null'] },
          title: { bsonType: 'string' },
          markdown: { bsonType: 'string' },
        },
      },
    },
    rawMarkdown: { bsonType: 'string' },
    sourcePath: { bsonType: ['string', 'null'] },
    hasProfileDoc: { bsonType: 'bool' },
    status: { enum: ENTITY_STATUS },
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

const TEAM_MEMBERS_INDEXES = [
  {
    key: { companyKey: 1, memberKey: 1 },
    name: 'ux_team_members_company_memberKey',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
  { key: { companyKey: 1, status: 1, fullName: 1 }, name: 'ix_team_members_company_status_fullName' },
  { key: { companyKey: 1, fullName: 'text', role: 'text', purpose: 'text' }, name: 'tx_team_members_company_fulltext' },
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
    const opts = { validator: { $jsonSchema: TEAM_MEMBERS_JSON_SCHEMA }, validationLevel: 'strict', validationAction: 'error' };
    if (existing.length === 0) {
      await db.createCollection(COLLECTION, opts);
      console.log(`  ✔ Created collection "${COLLECTION}" with $jsonSchema validator.`);
    } else {
      await db.command({ collMod: COLLECTION, ...opts });
      console.log(`  ✔ Updated validator on existing collection "${COLLECTION}".`);
    }

    const names = await db.collection(COLLECTION).createIndexes(TEAM_MEMBERS_INDEXES);
    console.log(`  ✔ Ensured ${TEAM_MEMBERS_INDEXES.length} indexes: ${names.join(', ')}`);

    const count = await db.collection(COLLECTION).countDocuments({});
    console.log(`  ℹ Document count in "${COLLECTION}": ${count} (unchanged — nothing was inserted).`);
    console.log('✔ Provisioning complete. Run `npm run db:seed:team-members` to load the data.');
  } catch (err) {
    console.error('✖ Provisioning FAILED.');
    console.error(`  ${err && err.message ? err.message : err}`);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
