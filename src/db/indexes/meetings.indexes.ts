// Index definitions for GovernanceDB.meetings.
//
// Applied at provision time (createIndexes). Defining them creates nothing. All
// keys are companyKey-prefixed (ESR order). Source: V1 spec §3.9 and §5.

import type { IndexDescription } from 'mongodb';

export const MEETINGS_INDEXES: IndexDescription[] = [
  {
    // Meeting timeline, most recent first — the primary list query.
    key: { companyKey: 1, meetingAt: -1 },
    name: 'ix_meetings_company_meetingAt',
  },
  {
    // "Meetings a person attended" — multikey over the embedded attendees array.
    key: { companyKey: 1, 'attendees.employeeKey': 1 },
    name: 'ix_meetings_company_attendee',
  },
  {
    // Company-scoped full-text search over title, note, and the AI summary text.
    // Only one text index per collection.
    key: { companyKey: 1, title: 'text', note: 'text', 'summary.text': 'text' },
    name: 'tx_meetings_company_fulltext',
  } as unknown as IndexDescription,
];
