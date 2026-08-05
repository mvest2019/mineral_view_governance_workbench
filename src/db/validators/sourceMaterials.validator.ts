// MongoDB $jsonSchema validator for GovernanceDB.sourceMaterials.
//
// Authoritative database-level validation (second layer behind the edge
// validator in src/models/source_material.model.ts). Applied at provision time.
// Defining it here creates nothing. Isolated to this collection.

import { SOURCE_MATERIAL_STATUS } from '@/src/models/source_material.model';
import type { Document } from 'mongodb';

/** The $jsonSchema document for the sourceMaterials collection. */
export const SOURCE_MATERIALS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey',
    'employeeKey',
    'employeeName',
    'fileName',
    'originalFileName',
    'content',
    'contentBytes',
    'uploadedAt',
    'uploadedBy',
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
    employeeKey: { bsonType: 'string', minLength: 1 },
    employeeName: { bsonType: 'string', minLength: 1 },
    fileName: { bsonType: 'string', pattern: '\\.md$' },
    originalFileName: { bsonType: 'string', minLength: 1 },
    content: { bsonType: 'string' },
    contentBytes: { bsonType: 'int', minimum: 0 },
    uploadedAt: { bsonType: 'date' },
    uploadedBy: { bsonType: 'string', minLength: 1 },
    status: { enum: [...SOURCE_MATERIAL_STATUS] },
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

/** collMod/createCollection validator options for the sourceMaterials collection. */
export const SOURCE_MATERIALS_VALIDATOR = {
  validator: { $jsonSchema: SOURCE_MATERIALS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
