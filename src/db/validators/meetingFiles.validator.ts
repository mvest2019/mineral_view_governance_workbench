// MongoDB $jsonSchema validator for GovernanceDB.meetingFiles.
//
// Authoritative database-level validation (second layer behind the edge
// validator in src/models/meetingFile.model.ts). Applied at provision time.
// Defining it here creates nothing.
//
// Source: docs/MONGODB_V1_SPECIFICATION.md §3.10 and §6.

import { MEETING_FILE_KIND } from '@/src/constants/enums';
import type { Document } from 'mongodb';

export const MEETING_FILES_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey',
    'meetingId',
    'originalFilename',
    'storageRef',
    'kind',
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
    meetingId: { bsonType: 'objectId' },
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
    // int for typical sizes; long/double defensively for very large files.
    sizeBytes: { bsonType: ['int', 'long', 'double'], minimum: 0 },
    kind: { enum: [...MEETING_FILE_KIND] },
    transcriptText: { bsonType: 'string' },
    analysisRunId: { bsonType: 'objectId' },
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

export const MEETING_FILES_VALIDATOR = {
  validator: { $jsonSchema: MEETING_FILES_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
