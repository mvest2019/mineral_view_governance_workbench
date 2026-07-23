// MongoDB $jsonSchema validator for GovernanceDB.taskTrackerEntries.
//
// Authoritative database-level validation (second layer behind the edge
// validator in src/models/taskTrackerEntry.model.ts). Applied at provision
// time. Defining it here creates nothing.
//
// Source: docs/MONGODB_V1_SPECIFICATION.md §3.4 and §6.

import { TASK_STATUS } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const TASK_TRACKER_ENTRIES_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey',
    'employeeKey',
    'entryDate',
    'title',
    'sections',
    'status',
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
    employeeKey: {
      bsonType: 'string',
      pattern: '^[a-z0-9]+(_[a-z0-9]+)*$',
      description: 'lowercase slug → employees.memberKey',
    },
    employeeName: { bsonType: 'string' },
    entryDate: { bsonType: 'date' },
    title: { bsonType: 'string', minLength: 1 },
    bodyMarkdown: { bsonType: 'string' },
    sections: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['heading', 'items'],
        properties: {
          heading: { bsonType: 'string' },
          items: { bsonType: 'array', items: { bsonType: 'string' } },
        },
      },
    },
    status: { enum: [...TASK_STATUS] },
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

export const TASK_TRACKER_ENTRIES_VALIDATOR = {
  validator: { $jsonSchema: TASK_TRACKER_ENTRIES_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
