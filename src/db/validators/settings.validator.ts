// MongoDB $jsonSchema validator for GovernanceDB.settings. V1 spec §3.18 / §6.
// Applied at provision time; defining it here creates nothing.

import type { Document } from 'mongodb';

export const SETTINGS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'scope', 'ownerKey', 'key', 'isSecret',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    scope: { enum: ['APP', 'USER'] },
    ownerKey: { bsonType: 'string', minLength: 1 },
    key: { bsonType: 'string', minLength: 1 },
    // value is intentionally unconstrained (mixed); secrets are stored as a
    // reference string with isSecret=true, never the raw secret.
    isSecret: { bsonType: 'bool' },
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

export const SETTINGS_VALIDATOR = {
  validator: { $jsonSchema: SETTINGS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
