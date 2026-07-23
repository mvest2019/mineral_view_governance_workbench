// MongoDB $jsonSchema validator for GovernanceDB.auditLogs.
// V1 spec §3.17 / §6. Append-only. Applied at provision time; defining it here
// creates nothing.

import { AUDIT_CATEGORY, AUDIT_OUTCOME } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const AUDIT_LOGS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'category', 'actorKey', 'action', 'at',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    category: { enum: [...AUDIT_CATEGORY] },
    actorKey: { bsonType: 'string', minLength: 1 },
    action: { bsonType: 'string', minLength: 1 },
    verb: { bsonType: 'string' },
    target: {
      bsonType: 'object',
      required: ['collection', 'id'],
      properties: {
        collection: { bsonType: 'string' },
        id: { bsonType: ['objectId', 'string'] },
        field: { bsonType: 'string' },
      },
    },
    summary: { bsonType: 'string' },
    outcome: { enum: [...AUDIT_OUTCOME] },
    context: { bsonType: 'object' },
    at: { bsonType: 'date' },
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

export const AUDIT_LOGS_VALIDATOR = {
  validator: { $jsonSchema: AUDIT_LOGS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
