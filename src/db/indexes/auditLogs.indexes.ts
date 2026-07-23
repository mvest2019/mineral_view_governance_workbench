// Index definitions for GovernanceDB.auditLogs. V1 spec §3.17 / §5.
import type { IndexDescription } from 'mongodb';

export const AUDIT_LOGS_INDEXES: IndexDescription[] = [
  {
    // Global forensic timeline, newest first.
    key: { companyKey: 1, at: -1 },
    name: 'ix_auditLogs_company_at',
  },
  {
    // Activity/audit for a specific entity.
    key: { companyKey: 1, 'target.collection': 1, 'target.id': 1, at: -1 },
    name: 'ix_auditLogs_company_target_at',
  },
  {
    // Everything a given actor did.
    key: { companyKey: 1, actorKey: 1, at: -1 },
    name: 'ix_auditLogs_company_actor_at',
  },
  {
    // Filter SECURITY vs ACTIVITY streams.
    key: { companyKey: 1, category: 1, at: -1 },
    name: 'ix_auditLogs_company_category_at',
  },
];
