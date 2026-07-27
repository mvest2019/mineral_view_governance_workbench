// MongoDB $jsonSchema validator for GovernanceDB.aiRuns.
// V1 spec §3.14 / §6. Applied at provision time; defining it here creates nothing.

import { AI_ENGINE, AI_STATUS, AI_ACTION_TYPE } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const AI_RUNS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'engine', 'actionType', 'subject', 'status', 'startedAt',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    engine: { enum: [...AI_ENGINE] },
    model: { bsonType: 'string' },
    actionType: { enum: [...AI_ACTION_TYPE] },
    subject: {
      bsonType: 'object',
      required: ['collection', 'id'],
      properties: {
        collection: { bsonType: 'string' },
        id: { bsonType: ['objectId', 'string'] },
        field: { bsonType: 'string' },
      },
    },
    status: { enum: [...AI_STATUS] },
    startedAt: { bsonType: 'date' },
    completedAt: { bsonType: ['date', 'null'] },
    promptText: { bsonType: 'string' },
    outputText: { bsonType: 'string' },
    outputStorageRef: {
      bsonType: 'object',
      properties: {
        provider: { bsonType: 'string' },
        bucket: { bsonType: 'string' },
        key: { bsonType: 'string' },
      },
    },
    errorText: { bsonType: 'string' },
    exchangeId: { bsonType: 'objectId' },
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

export const AI_RUNS_VALIDATOR = {
  validator: { $jsonSchema: AI_RUNS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
