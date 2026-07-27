// findings mapper (dry-run). Source: SQLite finding_reviews (the F-#### review
// register). Degrades gracefully when governance.db is absent.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG, ENUMS } from '../config.mjs';
import { slugify, parseISTToUTC, upcaseEnum } from '../lib/utils.mjs';
import { readTable, sqliteAvailable } from '../readers/sqlite.mjs';

export async function dryRun(ctx) {
  const report = createCollectionReport('findings');
  report.sources = ['SQLite: finding_reviews (governance.db)'];
  if (!(await sqliteAvailable())) {
    report.sourceAvailable = false;
    report.warnings.push('SQLite governance.db not present — run where it exists to evaluate findings.');
    return report;
  }
  const rows = await readTable('finding_reviews');
  const dupes = createDuplicateTracker();
  for (const row of rows) {
    report.recordsRead += 1;
    const decision = upcaseEnum(row.decision || 'REVIEWED', ENUMS.FINDING_DECISION);
    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      findingCode: row.fid,
      decision: decision.ok ? decision.value : 'REVIEWED',
      reviewerKey: row.reviewer ? slugify(row.reviewer) : undefined,
      reviewNote: row.note || undefined,
      reviewedAt: parseISTToUTC(row.reviewed_at).date || undefined,
      metadata: { legacy: { sqliteTable: 'finding_reviews', id: row.id } },
    };
    if (dupes.check(row.fid, row.id).duplicate) { report.duplicateRecords += 1; continue; }
    const v = validateDocument('findings', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.crossref) ctx.crossref.register('findings', row.fid);
      if (ctx && ctx.sink) ctx.sink('findings', candidate, { findingCode: row.fid });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${row.fid}: ${e}`));
    }
  }
  return report;
}
