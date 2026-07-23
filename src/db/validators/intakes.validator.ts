// MongoDB $jsonSchema validator for GovernanceDB.intakes.
// V1 spec §3.13 / §6. Embedded files/links/gates/stageHistory. Applied at
// provision time; defining it here creates nothing.

import { APPROVAL_STATUS } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const INTAKES_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'stage', 'aiEngines', 'files', 'links', 'gates', 'stageHistory',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    employeeKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    sourceType: { bsonType: 'string' },
    aiEngines: { bsonType: 'array', items: { bsonType: 'string' } },
    note: { bsonType: 'string' },
    stage: { bsonType: 'string', minLength: 1 },
    blocker: { bsonType: 'string' },
    files: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['filename'],
        properties: {
          filename: { bsonType: 'string' },
          storageRef: {
            bsonType: 'object',
            properties: {
              provider: { bsonType: 'string' },
              bucket: { bsonType: 'string' },
              key: { bsonType: 'string' },
            },
          },
          sizeBytes: { bsonType: ['int', 'long', 'double'], minimum: 0 },
        },
      },
    },
    links: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['kind', 'ref'],
        properties: { kind: { bsonType: 'string' }, ref: { bsonType: 'string' } },
      },
    },
    gates: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['name', 'status'],
        properties: {
          name: { bsonType: 'string' },
          status: { enum: [...APPROVAL_STATUS] },
          approverKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
          decidedAt: { bsonType: ['date', 'null'] },
          note: { bsonType: 'string' },
        },
      },
    },
    stageHistory: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['stage', 'at'],
        properties: {
          stage: { bsonType: 'string' },
          at: { bsonType: 'date' },
          actorKey: { bsonType: 'string' },
          note: { bsonType: 'string' },
        },
      },
    },
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

export const INTAKES_VALIDATOR = {
  validator: { $jsonSchema: INTAKES_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
