// MongoDB $jsonSchema validator for GovernanceDB.findings.
// V1 spec §3.12 / §6. Applied at provision time; defining it here creates nothing.

import { FINDING_DECISION } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const FINDINGS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'findingCode', 'decision',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    findingCode: { bsonType: 'string', pattern: '^F-[0-9-]+$' },
    repoName: { bsonType: 'string' },
    departmentKey: { bsonType: 'string' },
    title: { bsonType: 'string' },
    bodyMarkdown: { bsonType: 'string' },
    severity: { bsonType: 'string' },
    decision: { enum: [...FINDING_DECISION] },
    reviewerKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    reviewedAt: { bsonType: ['date', 'null'] },
    reviewNote: { bsonType: 'string' },
    nextQuestionsNote: { bsonType: 'string' },
    questionCode: { bsonType: 'string' },
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

export const FINDINGS_VALIDATOR = {
  validator: { $jsonSchema: FINDINGS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
