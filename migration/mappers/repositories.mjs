// repositories mapper (dry-run). Source: SQLite repo_classification (S7) +
// aspect groups (C4). SQLite is ephemeral (/tmp on Vercel) and usually ABSENT
// locally, so this mapper degrades gracefully and reports the source as
// unavailable rather than failing.

import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG, ENUMS } from '../config.mjs';
import { upcaseEnum } from '../lib/utils.mjs';
import { readTable, sqliteAvailable } from '../readers/sqlite.mjs';

export async function dryRun(ctx) {
  const report = createCollectionReport('repositories');
  report.sources = ['SQLite: repo_classification (governance.db)'];

  if (!(await sqliteAvailable())) {
    report.sourceAvailable = false;
    report.warnings.push(
      'SQLite governance.db is not present in this environment (it is ephemeral / '
      + '/tmp on Vercel). No repository rows to read here; run the dry-run where the '
      + 'SQLite DB is available to evaluate this collection.',
    );
    return report;
  }

  const rows = await readTable('repo_classification');
  const dupes = createDuplicateTracker();
  for (const row of rows) {
    report.recordsRead += 1;
    const confidence = upcaseEnum(row.confidence, ENUMS.CONFIDENCE);
    const approval = upcaseEnum(row.approval_status || 'PENDING', ENUMS.REPO_APPROVAL_STATUS);

    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      name: row.repo_name,
      departmentKeys: [],
      isArchived: false,
      classification: {
        observedPurpose: row.observed_purpose || undefined,
        proposedCategory: row.proposed_category || undefined,
        confidence: confidence.ok ? confidence.value : undefined,
        canonicalStatus: row.canonical_status || undefined,
        evidence: row.evidence || undefined,
        approvalStatus: approval.ok ? approval.value : 'PENDING',
      },
      _legacy: { sqliteTable: 'repo_classification', id: row.id },
    };
    if (!confidence.ok && row.confidence) report.warnings.push(`${row.repo_name}: unknown confidence "${row.confidence}"`);

    if (dupes.check(row.repo_name, row.id).duplicate) { report.duplicateRecords += 1; continue; }

    const v = validateDocument('repositories', candidate);
    v.warnings.forEach((w) => report.warnings.push(`${row.repo_name}: ${w}`));
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.crossref) ctx.crossref.register('repositories', row.repo_name);
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${row.repo_name}: ${e}`));
    }
  }
  return report;
}
