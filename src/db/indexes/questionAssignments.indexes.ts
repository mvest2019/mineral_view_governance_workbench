// Index definitions for GovernanceDB.questionAssignments. V1 spec §3.7 / §5.
import type { IndexDescription } from 'mongodb';

export const QUESTION_ASSIGNMENTS_INDEXES: IndexDescription[] = [
  {
    // One owner record per question.
    key: { companyKey: 1, questionCode: 1 },
    name: 'ux_questionAssignments_company_code',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
  {
    // "Questions assigned to employee X."
    key: { companyKey: 1, assigneeKey: 1 },
    name: 'ix_questionAssignments_company_assignee',
  },
];
