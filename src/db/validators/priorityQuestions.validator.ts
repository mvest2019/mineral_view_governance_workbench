// MongoDB $jsonSchema validator for GovernanceDB.priorityQuestions.
//
// Authoritative database-level validation (second layer behind the edge
// validator in src/models/priorityQuestion.model.ts). Applied at provision
// time. Defining it here creates nothing.
//
// Source: docs/MONGODB_V1_SPECIFICATION.md §3.5 and §6.

import { PRIORITY, QUESTION_STATUS, QUESTION_SOURCE } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const PRIORITY_QUESTIONS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey',
    'questionCode',
    'bodyMarkdown',
    'priority',
    'status',
    'source',
    'answerCount',
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
    questionCode: {
      bsonType: 'string',
      pattern: '^Q-[A-Z0-9-]+$',
      description: 'stable code, e.g. "Q-AI-0039"',
    },
    normalizedTitle: { bsonType: 'string' },
    title: { bsonType: 'string' },
    bodyMarkdown: { bsonType: 'string', minLength: 1 },
    shortQuestion: { bsonType: 'string' },
    targetEmployeeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    priority: { enum: [...PRIORITY] },
    status: { enum: [...QUESTION_STATUS] },
    source: { enum: [...QUESTION_SOURCE] },
    sourceRef: {
      bsonType: 'object',
      properties: {
        collection: { bsonType: 'string' },
        id: { bsonType: 'string' },
        section: { bsonType: 'string' },
      },
    },
    generatedBy: { bsonType: 'string' },
    answerCount: { bsonType: 'int', minimum: 0 },
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

export const PRIORITY_QUESTIONS_VALIDATOR = {
  validator: { $jsonSchema: PRIORITY_QUESTIONS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
