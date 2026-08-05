// Index definitions for GovernanceDB.intakes. V1 spec §3.13 / §5.
import type { IndexDescription } from 'mongodb';

export const INTAKES_INDEXES: IndexDescription[] = [
  {
    // Workflow board: intakes by stage, most-recently-updated first.
    key: { companyKey: 1, stage: 1, updatedAt: -1 },
    name: 'ix_intakes_company_stage_updated',
  },
  {
    // An employee's submissions.
    key: { companyKey: 1, employeeKey: 1 },
    name: 'ix_intakes_company_employee',
  },
];
