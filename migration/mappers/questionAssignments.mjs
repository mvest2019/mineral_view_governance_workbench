// questionAssignments mapper (dry-run). Source: SQLite question_assignment.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { slugify } from '../lib/utils.mjs';
import { readTable, sqliteAvailable } from '../readers/sqlite.mjs';

export async function dryRun(ctx) {
  const report = createCollectionReport('questionAssignments');
  report.sources = ['SQLite: question_assignment (governance.db)'];
  if (!(await sqliteAvailable())) {
    report.sourceAvailable = false;
    report.warnings.push('SQLite governance.db not present — run where it exists to evaluate questionAssignments.');
    return report;
  }
  const rows = await readTable('question_assignment');
  const dupes = createDuplicateTracker();
  for (const row of rows) {
    report.recordsRead += 1;
    // qid pattern hints the kind: Q-AI-* are priority questions; otherwise best-effort PRIORITY.
    const questionKind = /^Q-AI-/i.test(row.qid || '') ? 'PRIORITY' : 'PRIORITY';
    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      questionCode: row.qid,
      questionKind,
      assigneeKey: row.assignee ? slugify(row.assignee) : '',
      note: row.note || undefined,
      metadata: { legacy: { sqliteTable: 'question_assignment', id: row.id } },
    };
    if (dupes.check(row.qid, row.id).duplicate) { report.duplicateRecords += 1; continue; }
    const v = validateDocument('questionAssignments', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.sink) ctx.sink('questionAssignments', candidate, { questionCode: row.qid });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${row.qid}: ${e}`));
    }
  }
  return report;
}
