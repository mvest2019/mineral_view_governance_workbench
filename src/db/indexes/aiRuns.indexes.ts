// Index definitions for GovernanceDB.aiRuns. V1 spec §3.14 / §5.
import type { IndexDescription } from 'mongodb';

export const AI_RUNS_INDEXES: IndexDescription[] = [
  {
    // "All AI activity about entity X" — the primary AI-history query.
    key: { companyKey: 1, 'subject.collection': 1, 'subject.id': 1, startedAt: -1 },
    name: 'ix_aiRuns_company_subject_started',
  },
  {
    // Usage / status filtering by engine.
    key: { companyKey: 1, engine: 1, status: 1 },
    name: 'ix_aiRuns_company_engine_status',
  },
  {
    // Recent runs across the company.
    key: { companyKey: 1, startedAt: -1 },
    name: 'ix_aiRuns_company_started',
  },
];
