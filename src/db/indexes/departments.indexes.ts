// Index definitions for GovernanceDB.departments. V1 spec §3.3 / §5.
import type { IndexDescription } from 'mongodb';

export const DEPARTMENTS_INDEXES: IndexDescription[] = [
  {
    key: { companyKey: 1, key: 1 },
    name: 'ux_departments_company_key',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
];
