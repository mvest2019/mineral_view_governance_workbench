// Index definitions for GovernanceDB.sourceMaterials.
//
// Applied at provision time (createIndexes). Defining them here creates nothing.
// All keys are companyKey-prefixed so every query is company-scoped.

import type { IndexDescription } from 'mongodb';

export const SOURCE_MATERIALS_INDEXES: IndexDescription[] = [
  {
    // Recent-uploads listing for the company (newest first).
    key: { companyKey: 1, uploadedAt: -1 },
    name: 'ix_sourceMaterials_company_uploadedAt',
  },
  {
    // Uploads for a specific employee (newest first).
    key: { companyKey: 1, employeeKey: 1, uploadedAt: -1 },
    name: 'ix_sourceMaterials_company_employee_uploadedAt',
  },
];
