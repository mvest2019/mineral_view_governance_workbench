// MongoDB $jsonSchema validator for GovernanceDB.roles. V1 spec §3.2 / §6.
// Applied at provision time; defining it here creates nothing.

import type { Document } from 'mongodb';

export const ROLES_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'key', 'name', 'permissionKeys', 'isSystem',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    key: { bsonType: 'string', pattern: '^[A-Z][A-Z0-9_]*$' },
    name: { bsonType: 'string', minLength: 1 },
    description: { bsonType: 'string' },
    permissionKeys: { bsonType: 'array', items: { bsonType: 'string' } },
    isSystem: { bsonType: 'bool' },
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

export const ROLES_VALIDATOR = {
  validator: { $jsonSchema: ROLES_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
