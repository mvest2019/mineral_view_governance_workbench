// Index definitions for GovernanceDB.roles. V1 spec §3.2 / §5.
import type { IndexDescription } from 'mongodb';

export const ROLES_INDEXES: IndexDescription[] = [
  {
    key: { companyKey: 1, key: 1 },
    name: 'ux_roles_company_key',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
];
