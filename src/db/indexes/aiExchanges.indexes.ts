// Index definitions for GovernanceDB.aiExchanges. V1 spec §3.15 / §5.
import type { IndexDescription } from 'mongodb';

export const AI_EXCHANGES_INDEXES: IndexDescription[] = [
  {
    // All exchanges for an intake (the challenge loop).
    key: { companyKey: 1, intakeId: 1 },
    name: 'ix_aiExchanges_company_intake',
  },
  {
    // Review queue by status, most-recently-updated first.
    key: { companyKey: 1, status: 1, updatedAt: -1 },
    name: 'ix_aiExchanges_company_status_updated',
  },
];
