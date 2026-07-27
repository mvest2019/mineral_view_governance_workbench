// attachments mapper (dry-run). Source: SQLite team_member_files. Bytes stay in
// their source location; only metadata + a storageRef is migrated.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG, ENUMS } from '../config.mjs';
import { slugify, upcaseEnum } from '../lib/utils.mjs';
import { readTable, sqliteAvailable } from '../readers/sqlite.mjs';

export async function dryRun(ctx) {
  const report = createCollectionReport('attachments');
  report.sources = ['SQLite: team_member_files (governance.db)'];
  if (!(await sqliteAvailable())) {
    report.sourceAvailable = false;
    report.warnings.push('SQLite governance.db not present — run where it exists to evaluate attachments.');
    return report;
  }
  const rows = await readTable('team_member_files');
  const dupes = createDuplicateTracker();
  for (const row of rows) {
    report.recordsRead += 1;
    const sqliteId = `team_member_files:${row.id}`;
    const aiPref = upcaseEnum(row.ai_preference, ENUMS.AI_PREFERENCE);
    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      target: { collection: 'employees', id: slugify(row.member_key || '') },
      originalFilename: row.original_filename,
      storageRef: { provider: 'local', key: row.saved_path },
      sizeBytes: row.size_bytes || undefined,
      filePurpose: row.file_purpose || row.source_type || undefined,
      uploadedByKey: row.uploaded_by ? slugify(row.uploaded_by) : undefined,
      aiPreference: aiPref.ok ? aiPref.value : undefined,
      analysisRunIds: [],
      metadata: { legacy: { sqliteTable: 'team_member_files', id: row.id, sqliteId } },
    };
    if (dupes.check(sqliteId, row.id).duplicate) { report.duplicateRecords += 1; continue; }
    const v = validateDocument('attachments', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.crossref) ctx.crossref.register('attachments', sqliteId);
      if (ctx && ctx.sink) ctx.sink('attachments', candidate, { 'metadata.legacy.sqliteId': sqliteId });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${sqliteId}: ${e}`));
    }
  }
  return report;
}
