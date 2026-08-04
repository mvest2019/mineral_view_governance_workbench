// Index definitions for GovernanceDB.team_members.
//
// Applied at provision time (createIndexes). Defining them here creates nothing.
// All keys are companyKey-prefixed so every query is company-scoped (ESR order:
// Equality first).

import type { IndexDescription } from 'mongodb';

export const TEAM_MEMBERS_INDEXES: IndexDescription[] = [
  {
    // Primary natural-key lookup + uniqueness. Partial on isDeleted:false so a
    // memberKey freed by a soft delete can be reused by a new live profile.
    key: { companyKey: 1, memberKey: 1 },
    name: 'ux_team_members_company_memberKey',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
  {
    // Roster filtered by lifecycle status (ACTIVE / INACTIVE / OFFBOARDED),
    // name-sorted — matches listByStatus().
    key: { companyKey: 1, status: 1, fullName: 1 },
    name: 'ix_team_members_company_status_fullName',
  },
  {
    // Company-scoped full-text search over name/role/purpose.
    key: { companyKey: 1, fullName: 'text', role: 'text', purpose: 'text' },
    name: 'tx_team_members_company_fulltext',
  } as unknown as IndexDescription,
];
