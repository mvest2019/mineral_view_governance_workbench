// Index definitions for GovernanceDB.repositories. V1 spec §3.11 / §5.
import type { IndexDescription } from 'mongodb';

export const REPOSITORIES_INDEXES: IndexDescription[] = [
  {
    key: { companyKey: 1, name: 1 },
    name: 'ux_repositories_company_name',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
  {
    // Classification review queue.
    key: { companyKey: 1, 'classification.approvalStatus': 1 },
    name: 'ix_repositories_company_approvalStatus',
  },
  {
    // Category rollups.
    key: { companyKey: 1, 'classification.proposedCategory': 1 },
    name: 'ix_repositories_company_category',
  },
];
