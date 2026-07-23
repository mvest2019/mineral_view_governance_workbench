// MongoDB $jsonSchema validator for GovernanceDB.departments. V1 spec §3.3 / §6.
// Applied at provision time; defining it here creates nothing.

import type { Document } from 'mongodb';

export const DEPARTMENTS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'key', 'name', 'repoScopes',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    key: { bsonType: 'string', pattern: '^[A-Z][A-Z0-9_]*$' },
    name: { bsonType: 'string', minLength: 1 },
    description: { bsonType: 'string' },
    leadEmployeeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    parentKey: { bsonType: 'string', pattern: '^[A-Z][A-Z0-9_]*$' },
    repoScopes: { bsonType: 'array', items: { bsonType: 'string' } },
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

export const DEPARTMENTS_VALIDATOR = {
  validator: { $jsonSchema: DEPARTMENTS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
