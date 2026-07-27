// Index definitions for GovernanceDB.taskTrackerEntries.
//
// Applied at provision time (createIndexes). Defining them creates nothing. All
// keys are companyKey-prefixed (ESR: Equality first, Sort/Range last).
// Source: docs/MONGODB_V1_SPECIFICATION.md §3.4 and §5.

import type { IndexDescription } from 'mongodb';

export const TASK_TRACKER_ENTRIES_INDEXES: IndexDescription[] = [
  {
    // "This employee's entries, newest first" — the primary list query.
    // entryDate is the Range/Sort key, so it comes last (ESR).
    key: { companyKey: 1, employeeKey: 1, entryDate: -1 },
    name: 'ix_tasktracker_company_employee_date',
  },
  {
    // Org-wide timeline / date-range scans, newest first.
    key: { companyKey: 1, entryDate: -1 },
    name: 'ix_tasktracker_company_date',
  },
  {
    // Company-scoped full-text search over the entry body and title. Only one
    // text index is permitted per collection.
    key: { companyKey: 1, bodyMarkdown: 'text', title: 'text' },
    name: 'tx_tasktracker_company_fulltext',
  } as unknown as IndexDescription,
];
