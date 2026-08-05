// MongoDB $jsonSchema validator for GovernanceDB.answers.
//
// Authoritative database-level validation (second layer behind the edge
// validator in src/models/answer.model.ts). Applied at provision time.
// Defining it here creates nothing.
//
// Source: docs/MONGODB_V1_SPECIFICATION.md §3.6 and §6.

import { QUESTION_KIND, CONFIDENCE, ANSWER_MATCH_STRATEGY } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const ANSWERS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey',
    'questionCode',
    'questionKind',
    'answerMarkdown',
    'answeredAt',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'isDeleted',
    'version',
  ],
  additionalProperties: true,
  properties: {
    // ----- module fields -----
    companyKey: { bsonType: 'string', minLength: 1 },
    questionCode: { bsonType: 'string', minLength: 1 },
    questionKind: { enum: [...QUESTION_KIND] },
    answerMarkdown: { bsonType: 'string', minLength: 1 },
    answeredByKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    answeredByName: { bsonType: 'string' },
    answeredAt: { bsonType: 'date' },
    questionMatch: {
      bsonType: 'object',
      required: ['strategy', 'confidence'],
      properties: {
        strategy: { enum: [...ANSWER_MATCH_STRATEGY] },
        confidence: { enum: [...CONFIDENCE] },
      },
    },
    acceptedByKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    acceptedAt: { bsonType: ['date', 'null'] },
    sourceFileId: { bsonType: 'objectId' },
    githubRef: {
      bsonType: 'object',
      properties: {
        path: { bsonType: 'string' },
        sha: { bsonType: 'string' },
        commitUrl: { bsonType: 'string' },
      },
    },
    // ----- base envelope -----
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

export const ANSWERS_VALIDATOR = {
  validator: { $jsonSchema: ANSWERS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
