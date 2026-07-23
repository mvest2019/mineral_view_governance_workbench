// MongoDB $jsonSchema validator for GovernanceDB.employees.
//
// This is the authoritative database-level validation (the second layer behind
// the edge validator in src/models/employee.model.ts). It is applied to the
// collection at provision time (createCollection / collMod). Defining it here
// creates nothing — it is data until a provisioning step applies it.
//
// Source: docs/MONGODB_V1_SPECIFICATION.md §3.1 and §6.

import { ENTITY_STATUS, ROLE_KEY } from '@/src/constants/enums';
import type { Document } from 'mongodb';

/** The $jsonSchema document for the employees collection. */
export const EMPLOYEES_JSON_SCHEMA: Document = {
  bsonType: 'object',
  // Envelope + module-required fields. additionalProperties:true permits the
  // forward-compatible `metadata` bag and `_id` without listing them.
  required: [
    'companyKey',
    'memberKey',
    'fullName',
    'departmentKeys',
    'roleKeys',
    'status',
    'aliases',
    'repoScopes',
    'profile',
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
    memberKey: {
      bsonType: 'string',
      pattern: '^[a-z0-9]+(_[a-z0-9]+)*$',
      description: 'lowercase slug natural key, e.g. "ajay_landge"',
    },
    aliases: { bsonType: 'array', items: { bsonType: 'string' } },
    fullName: { bsonType: 'string', minLength: 1 },
    email: { bsonType: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
    title: { bsonType: 'string' },
    purpose: { bsonType: 'string' },
    departmentKeys: { bsonType: 'array', items: { bsonType: 'string' } },
    reportsToKey: { bsonType: 'string' },
    repoScopes: { bsonType: 'array', items: { bsonType: 'string' } },
    status: { enum: [...ENTITY_STATUS] },
    profile: { bsonType: 'object' },
    roleKeys: {
      bsonType: 'array',
      minItems: 1,
      items: { enum: [...ROLE_KEY] },
    },
    auth: {
      bsonType: 'object',
      properties: {
        passwordHash: { bsonType: 'string' },
        lastLoginAt: { bsonType: ['date', 'null'] },
        failedLoginCount: { bsonType: 'int', minimum: 0 },
        mfaEnabled: { bsonType: 'bool' },
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

/** collMod/createCollection validator options for the employees collection. */
export const EMPLOYEES_VALIDATOR = {
  validator: { $jsonSchema: EMPLOYEES_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
