// MongoDB $jsonSchema validator for GovernanceDB.aiExchanges.
// V1 spec §3.15 / §6. Applied at provision time; defining it here creates nothing.

import type { Document } from 'mongodb';

export const AI_EXCHANGES_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'intakeId', 'status', 'agreementStatus', 'nextAction',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    intakeId: { bsonType: 'objectId' },
    topic: { bsonType: 'string' },
    sourceEngine: { bsonType: 'string' },
    targetEngine: { bsonType: 'string' },
    status: { bsonType: 'string', minLength: 1 },
    sourceRunId: { bsonType: 'objectId' },
    sourcePrompt: { bsonType: 'string' },
    sourceOutput: { bsonType: 'string' },
    targetPrompt: { bsonType: 'string' },
    targetOutput: { bsonType: 'string' },
    agreementStatus: { bsonType: 'string' },
    nextAction: { bsonType: 'string' },
    errorText: { bsonType: 'string' },
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

export const AI_EXCHANGES_VALIDATOR = {
  validator: { $jsonSchema: AI_EXCHANGES_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
