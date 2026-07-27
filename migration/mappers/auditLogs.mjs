// auditLogs mapper (dry-run). Source: SQLite team_member_correspondence_log →
// the ACTIVITY stream of the unified audit log.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { slugify, parseISTToUTC } from '../lib/utils.mjs';
import { readTable, sqliteAvailable } from '../readers/sqlite.mjs';

export async function dryRun(ctx) {
  const report = createCollectionReport('auditLogs');
  report.sources = ['SQLite: team_member_correspondence_log (governance.db)'];
  if (!(await sqliteAvailable())) {
    report.sourceAvailable = false;
    report.warnings.push('SQLite governance.db not present — run where it exists to evaluate auditLogs.');
    return report;
  }
  const rows = await readTable('team_member_correspondence_log');
  const dupes = createDuplicateTracker();
  for (const row of rows) {
    report.recordsRead += 1;
    const sqliteId = `corr:${row.id}`;
    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      category: 'ACTIVITY',
      actorKey: row.actor ? slugify(row.actor) : 'system',
      action: row.event_type || 'activity',
      verb: row.event_type || undefined,
      target: { collection: 'employees', id: slugify(row.team_member_key || '') },
      summary: row.event_summary || undefined,
      context: {
        linkedFileId: row.linked_file_id || undefined,
        linkedQuestionId: row.linked_question_id || undefined,
        linkedPacketId: row.linked_packet_id || undefined,
      },
      at: parseISTToUTC(row.created_at).date || new Date(0),
      metadata: { legacy: { sqliteTable: 'team_member_correspondence_log', id: row.id, sqliteId } },
    };
    if (dupes.check(sqliteId, row.id).duplicate) { report.duplicateRecords += 1; continue; }
    const v = validateDocument('auditLogs', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.sink) ctx.sink('auditLogs', candidate, { 'metadata.legacy.sqliteId': sqliteId });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${sqliteId}: ${e}`));
    }
  }
  return report;
}
