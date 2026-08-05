// MongoDB $jsonSchema validator for GovernanceDB.repoQuestions.
// V1 spec §3.8 / §6. Applied at provision time; defining it here creates nothing.

import { PRIORITY, QUESTION_STATUS, QUESTION_SOURCE } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const REPO_QUESTIONS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'questionCode', 'repoName', 'bodyMarkdown', 'priority', 'status', 'source',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    questionCode: { bsonType: 'string', minLength: 1 },
    repoName: { bsonType: 'string', minLength: 1 },
    title: { bsonType: 'string' },
    bodyMarkdown: { bsonType: 'string', minLength: 1 },
    shortQuestion: { bsonType: 'string' },
    sourceExcerpt: { bsonType: 'string' },
    priority: { enum: [...PRIORITY] },
    status: { enum: [...QUESTION_STATUS] },
    source: { enum: [...QUESTION_SOURCE] },
    sourceRef: { bsonType: 'string' },
    primaryAssigneeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    answerMarkdown: { bsonType: 'string' },
    reviewNote: { bsonType: 'string' },
    reviewedByKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
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

export const REPO_QUESTIONS_VALIDATOR = {
  validator: { $jsonSchema: REPO_QUESTIONS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
