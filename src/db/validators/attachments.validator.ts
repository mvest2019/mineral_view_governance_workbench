// MongoDB $jsonSchema validator for GovernanceDB.attachments.
// V1 spec §3.16 / §6. Applied at provision time; defining it here creates nothing.

import { AI_PREFERENCE } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const ATTACHMENTS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey', 'target', 'originalFilename', 'storageRef', 'analysisRunIds',
    'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'version',
  ],
  additionalProperties: true,
  properties: {
    companyKey: { bsonType: 'string', minLength: 1 },
    target: {
      bsonType: 'object',
      required: ['collection', 'id'],
      properties: {
        collection: { bsonType: 'string' },
        id: { bsonType: ['objectId', 'string'] },
        field: { bsonType: 'string' },
      },
    },
    originalFilename: { bsonType: 'string', minLength: 1 },
    storageRef: {
      bsonType: 'object',
      properties: {
        provider: { bsonType: 'string' },
        bucket: { bsonType: 'string' },
        key: { bsonType: 'string' },
      },
    },
    mimeType: { bsonType: 'string' },
    sizeBytes: { bsonType: ['int', 'long', 'double'], minimum: 0 },
    filePurpose: { bsonType: 'string' },
    checksum: { bsonType: 'string' },
    uploadedByKey: { bsonType: 'string', pattern: '^[a-z0-9]+(_[a-z0-9]+)*$' },
    aiPreference: { enum: [...AI_PREFERENCE] },
    analysisRunIds: { bsonType: 'array', items: { bsonType: 'objectId' } },
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

export const ATTACHMENTS_VALIDATOR = {
  validator: { $jsonSchema: ATTACHMENTS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
