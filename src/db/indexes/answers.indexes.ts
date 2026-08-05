// Index definitions for GovernanceDB.answers.
//
// Applied at provision time (createIndexes). Defining them creates nothing. All
// keys are companyKey-prefixed (ESR order). Source: V1 spec §3.6 and §5.

import type { IndexDescription } from 'mongodb';

export const ANSWERS_INDEXES: IndexDescription[] = [
  {
    // Load a question's answers, newest first — the primary answer query.
    key: { companyKey: 1, questionCode: 1, answeredAt: -1 },
    name: 'ix_answers_company_question_answeredAt',
  },
  {
    // "All answers by employee X, newest first" — impossible in the markdown
    // storage today; a first-class capability here.
    key: { companyKey: 1, answeredByKey: 1, answeredAt: -1 },
    name: 'ix_answers_company_author_answeredAt',
  },
];
