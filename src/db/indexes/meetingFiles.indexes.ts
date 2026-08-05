// Index definitions for GovernanceDB.meetingFiles.
//
// Applied at provision time (createIndexes). Defining them creates nothing.
// companyKey-prefixed. Source: V1 spec §3.10 and §5.

import type { IndexDescription } from 'mongodb';

export const MEETING_FILES_INDEXES: IndexDescription[] = [
  {
    // All files for a given meeting — the primary access pattern.
    key: { companyKey: 1, meetingId: 1 },
    name: 'ix_meetingFiles_company_meeting',
  },
];
