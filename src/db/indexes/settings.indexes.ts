// Index definitions for GovernanceDB.settings. V1 spec §3.18 / §5.
import type { IndexDescription } from 'mongodb';

export const SETTINGS_INDEXES: IndexDescription[] = [
  {
    // Deterministic per-scope/owner/key lookup; unique among live docs.
    key: { companyKey: 1, scope: 1, ownerKey: 1, key: 1 },
    name: 'ux_settings_company_scope_owner_key',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
];
