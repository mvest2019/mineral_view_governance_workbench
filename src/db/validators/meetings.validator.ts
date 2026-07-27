// MongoDB $jsonSchema validator for GovernanceDB.meetings.
//
// Authoritative database-level validation (second layer behind the edge
// validator in src/models/meeting.model.ts). Applied at provision time.
// Defining it here creates nothing.
//
// Source: docs/MONGODB_V1_SPECIFICATION.md §3.9 and §6.

import {
  ACTION_ITEM_STATUS,
  MEETING_SUMMARY_STATUS,
  AI_ENGINE,
} from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const MEETINGS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey',
    'title',
    'meetingType',
    'meetingAt',
    'attendees',
    'actionItems',
    'priorityQuestionCodes',
    'fileIds',
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
    title: { bsonType: 'string', minLength: 1 },
    meetingType: { bsonType: 'string' }, // free label; default "other"
    organizerKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    meetingAt: { bsonType: 'date' },
    note: { bsonType: 'string' },
    attendees: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['attended', 'followUpDone'],
        properties: {
          employeeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
          externalName: { bsonType: 'string' },
          externalEmail: { bsonType: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
          attended: { bsonType: 'bool' },
          followUpDone: { bsonType: 'bool' },
          followUpNote: { bsonType: 'string' },
        },
      },
    },
    actionItems: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['description', 'status'],
        properties: {
          ownerKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
          description: { bsonType: 'string', minLength: 1 },
          status: { enum: [...ACTION_ITEM_STATUS] },
          dueAt: { bsonType: ['date', 'null'] },
        },
      },
    },
    summary: {
      bsonType: 'object',
      properties: {
        text: { bsonType: 'string' },
        status: { enum: [...MEETING_SUMMARY_STATUS] },
        engine: { enum: [...AI_ENGINE] },
        generatedAt: { bsonType: ['date', 'null'] },
      },
    },
    priorityQuestionCodes: { bsonType: 'array', items: { bsonType: 'string' } },
    fileIds: { bsonType: 'array', items: { bsonType: 'objectId' } },
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

export const MEETINGS_VALIDATOR = {
  validator: { $jsonSchema: MEETINGS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
