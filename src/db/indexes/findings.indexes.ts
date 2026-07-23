// Index definitions for GovernanceDB.findings. V1 spec §3.12 / §5.
import type { IndexDescription } from 'mongodb';

export const FINDINGS_INDEXES: IndexDescription[] = [
  {
    key: { companyKey: 1, findingCode: 1 },
    name: 'ux_findings_company_code',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
  {
    key: { companyKey: 1, repoName: 1 },
    name: 'ix_findings_company_repo',
  },
  {
    key: { companyKey: 1, decision: 1 },
    name: 'ix_findings_company_decision',
  },
];
