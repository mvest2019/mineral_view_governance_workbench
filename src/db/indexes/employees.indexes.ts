// Index definitions for GovernanceDB.employees.
//
// Applied at provision time (createIndexes). Defining them here creates nothing.
// All keys are companyKey-prefixed so every query is company-scoped (ESR order:
// Equality first). Source: docs/MONGODB_V1_SPECIFICATION.md §3.1 and §5.

import type { IndexDescription } from 'mongodb';

export const EMPLOYEES_INDEXES: IndexDescription[] = [
  {
    // Primary natural-key lookup + uniqueness. Partial on isDeleted:false so a
    // memberKey freed by a soft delete can be reused by a new live employee,
    // while still preventing two LIVE employees sharing a memberKey.
    key: { companyKey: 1, memberKey: 1 },
    name: 'ux_employees_company_memberKey',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
  {
    // Roster filtered by department (multikey — departmentKeys is an array).
    key: { companyKey: 1, departmentKeys: 1 },
    name: 'ix_employees_company_departmentKeys',
  },
  {
    // Roster filtered by lifecycle status (ACTIVE / INACTIVE / OFFBOARDED).
    key: { companyKey: 1, status: 1 },
    name: 'ix_employees_company_status',
  },
  {
    // Company-scoped full-text search over name/title/purpose. Compound text
    // index with an equality prefix keeps search tenant-scoped. Only one text
    // index is permitted per collection.
    key: { companyKey: 1, fullName: 'text', title: 'text', purpose: 'text' },
    name: 'tx_employees_company_fulltext',
  } as unknown as IndexDescription,
];
