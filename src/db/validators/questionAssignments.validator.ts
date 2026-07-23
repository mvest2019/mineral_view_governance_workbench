// MongoDB $jsonSchema validator for GovernanceDB.questionAssignments.
// V1 spec §3.7 / §6. Applied at provision time; defining it here creates nothing.

import { QUESTION_KIND } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const QUESTION_ASSIGNMENTS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'questionCode', 'questionKind', 'assigneeKey',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    questionCode: { bsonType: 'string', minLength: 1 },
    questionKind: { enum: [...QUESTION_KIND] },
    assigneeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    note: { bsonType: 'string' },
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

export const QUESTION_ASSIGNMENTS_VALIDATOR = {
  validator: { $jsonSchema: QUESTION_ASSIGNMENTS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
