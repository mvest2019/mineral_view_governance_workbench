// aiExchanges mapper (dry-run). Source: SQLite ai_exchange (the intake
// challenge-loop). Resolves intakeId + sourceRunId via the crossref.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { readTable, sqliteAvailable } from '../readers/sqlite.mjs';

export async function dryRun(ctx) {
  const report = createCollectionReport('aiExchanges');
  report.sources = ['SQLite: ai_exchange (governance.db)'];
  if (!(await sqliteAvailable())) {
    report.sourceAvailable = false;
    report.warnings.push('SQLite governance.db not present — run where it exists to evaluate aiExchanges.');
    return report;
  }
  const cross = ctx && ctx.crossref;
  const rows = await readTable('ai_exchange');
  const dupes = createDuplicateTracker();
  for (const row of rows) {
    report.recordsRead += 1;
    const sqliteId = `ai_exchange:${row.id}`;
    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      intakeId: cross ? cross.objectIdFor('intakes', `intake:${row.intake_id}`) : String(row.intake_id),
      topic: row.topic || undefined,
      sourceEngine: row.source_engine || undefined,
      targetEngine: row.target_engine || undefined,
      status: row.status || 'Needs review',
      sourceRunId: row.source_run_id != null && cross ? cross.objectIdFor('aiRuns', `ai_run:${row.source_run_id}`) : undefined,
      sourcePrompt: row.source_prompt || undefined,
      sourceOutput: row.source_output || undefined,
      targetPrompt: row.target_prompt || undefined,
      targetOutput: row.target_output || undefined,
      agreementStatus: row.agreement_status || 'Needs review',
      nextAction: row.next_action || 'Hold',
      errorText: row.error_text || undefined,
      metadata: { legacy: { sqliteTable: 'ai_exchange', id: row.id, sqliteId } },
    };
    if (dupes.check(sqliteId, row.id).duplicate) { report.duplicateRecords += 1; continue; }
    const v = validateDocument('aiExchanges', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.sink) ctx.sink('aiExchanges', candidate, { 'metadata.legacy.sqliteId': sqliteId });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${sqliteId}: ${e}`));
    }
  }
  return report;
}
