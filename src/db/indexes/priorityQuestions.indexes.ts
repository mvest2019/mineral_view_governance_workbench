// Index definitions for GovernanceDB.priorityQuestions.
//
// Applied at provision time (createIndexes). Defining them creates nothing. All
// keys are companyKey-prefixed (ESR order). Source: V1 spec §3.5 and §5.

import type { IndexDescription } from 'mongodb';

export const PRIORITY_QUESTIONS_INDEXES: IndexDescription[] = [
  {
    // Idempotent upsert / dedupe by stable code. Partial on isDeleted:false so a
    // code freed by a soft delete can be reused, while preventing two LIVE
    // questions from sharing a questionCode.
    key: { companyKey: 1, questionCode: 1 },
    name: 'ux_priorityQuestions_company_code',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
  {
    // Deterministic near-duplicate detection by normalized title.
    key: { companyKey: 1, normalizedTitle: 1 },
    name: 'ix_priorityQuestions_company_normalizedTitle',
  },
  {
    // "Open questions for this employee" board.
    key: { companyKey: 1, targetEmployeeKey: 1, status: 1 },
    name: 'ix_priorityQuestions_company_target_status',
  },
  {
    // Priority-sorted queue, most-recently-updated first.
    key: { companyKey: 1, priority: 1, updatedAt: -1 },
    name: 'ix_priorityQuestions_company_priority_updated',
  },
  {
    // Company-scoped full-text search. Only one text index per collection.
    key: { companyKey: 1, bodyMarkdown: 'text', title: 'text', shortQuestion: 'text' },
    name: 'tx_priorityQuestions_company_fulltext',
  } as unknown as IndexDescription,
];
