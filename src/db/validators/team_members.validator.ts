// MongoDB $jsonSchema validator for GovernanceDB.team_members.
//
// Authoritative database-level validation (second layer behind the edge
// validator in src/models/team_member.model.ts). Applied at provision time.
// Defining it here creates nothing — it is data until a provisioning step
// applies it.
//
// The collection holds the governed team-member profiles migrated out of
// Governance_Files/_GOVERNANCE/team_members/*.md, plus the page-facing fields
// the Team Members UI renders. additionalProperties:true keeps it
// forward-compatible (metadata bag, _id, future enrichment).

import { ENTITY_STATUS } from '@/src/constants/enums';
import type { Document } from 'mongodb';

/** The $jsonSchema document for the team_members collection. */
export const TEAM_MEMBERS_JSON_SCHEMA: Document = {
  bsonType: 'object',
  required: [
    'companyKey',
    'memberKey',
    'fullName',
    'role',
    'purpose',
    'departments',
    'repos',
    'operatingSources',
    'sections',
    'rawMarkdown',
    'hasProfileDoc',
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
    memberKey: {
      bsonType: 'string',
      pattern: '^[A-Za-z0-9]+(_[A-Za-z0-9]+)*$',
      description: 'app profile key, e.g. "Aboli_Mundralkar"',
    },
    slug: { bsonType: ['string', 'null'] },
    fullName: { bsonType: 'string', minLength: 1 },
    role: { bsonType: 'string' },
    purpose: { bsonType: 'string' },
    departments: { bsonType: 'array', items: { bsonType: 'string' } },
    repos: { bsonType: 'array', items: { bsonType: 'string' } },
    operatingSources: { bsonType: 'array', items: { bsonType: 'string' } },
    title: { bsonType: 'string' },
    departmentLabel: { bsonType: 'string' },
    reportsTo: { bsonType: 'string' },
    experience: { bsonType: 'string' },
    finalAuthority: { bsonType: 'string' },
    primarySurfaces: { bsonType: 'array', items: { bsonType: 'string' } },
    focus: { bsonType: 'string' },
    priorities: { bsonType: 'array', items: { bsonType: 'string' } },
    skills: { bsonType: 'object' },
    reviewCadence: { bsonType: 'string' },
    lastUpdatedLabel: { bsonType: 'string' },
    sourceNote: { bsonType: 'string' },
    sections: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['title', 'markdown'],
        properties: {
          number: { bsonType: ['int', 'null'] },
          title: { bsonType: 'string' },
          markdown: { bsonType: 'string' },
        },
      },
    },
    rawMarkdown: { bsonType: 'string' },
    sourcePath: { bsonType: ['string', 'null'] },
    hasProfileDoc: { bsonType: 'bool' },
    status: { enum: [...ENTITY_STATUS] },
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

/** collMod/createCollection validator options for the team_members collection. */
export const TEAM_MEMBERS_VALIDATOR = {
  validator: { $jsonSchema: TEAM_MEMBERS_JSON_SCHEMA },
  validationLevel: 'strict' as const,
  validationAction: 'error' as const,
};
