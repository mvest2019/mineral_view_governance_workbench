// Index definitions for GovernanceDB.repoQuestions. V1 spec §3.8 / §5.
import type { IndexDescription } from 'mongodb';

export const REPO_QUESTIONS_INDEXES: IndexDescription[] = [
  {
    key: { companyKey: 1, questionCode: 1 },
    name: 'ux_repoQuestions_company_code',
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
  {
    key: { companyKey: 1, repoName: 1 },
    name: 'ix_repoQuestions_company_repo',
  },
  {
    key: { companyKey: 1, priority: 1, updatedAt: -1 },
    name: 'ix_repoQuestions_company_priority_updated',
  },
  {
    key: { companyKey: 1, bodyMarkdown: 'text', title: 'text' },
    name: 'tx_repoQuestions_company_fulltext',
  } as unknown as IndexDescription,
];
