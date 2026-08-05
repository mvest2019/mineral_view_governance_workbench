// MongoDB $jsonSchema validator for GovernanceDB.repositories.
// V1 spec §3.11 / §6. Embedded classification. Applied at provision time;
// defining it here creates nothing.

import { CONFIDENCE, REPO_APPROVAL_STATUS } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const REPOSITORIES_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'name', 'departmentKeys', 'isArchived',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
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
        confidence: { enum: [...CONFIDENCE] },
        canonicalStatus: { bsonType: 'string' },
        evidence: { bsonType: 'string' },
        approvalStatus: { enum: [...REPO_APPROVAL_STATUS] },
        findingCode: { bsonType: 'string' },
        questionCode: { bsonType: 'string' },
        updatedAt: { bsonType: ['date', 'null'] },
      },
    },
    isArchived: { bsonType: 'bool' },
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

export const REPOSITORIES_VALIDATOR = {
  validator: { $jsonSchema: REPOSITORIES_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
