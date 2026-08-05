// Index definitions for GovernanceDB.attachments. V1 spec §3.16 / §5.
import type { IndexDescription } from 'mongodb';

export const ATTACHMENTS_INDEXES: IndexDescription[] = [
  {
    // All files for any entity (polymorphic target).
    key: { companyKey: 1, 'target.collection': 1, 'target.id': 1 },
    name: 'ix_attachments_company_target',
  },
  {
    // Duplicate detection by content checksum.
    key: { companyKey: 1, checksum: 1 },
    name: 'ix_attachments_company_checksum',
  },
];
