// aiRuns mapper (dry-run). Source: SQLite ai_run + team_member_file_analysis +
// team_member_question_ai_run — unified into aiRuns with a polymorphic subject.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG, ENUMS } from '../config.mjs';
import { slugify, parseISTToUTC, upcaseEnum } from '../lib/utils.mjs';
import { readTable, sqliteAvailable } from '../readers/sqlite.mjs';

export async function dryRun(ctx) {
  const report = createCollectionReport('aiRuns');
  report.sources = ['SQLite: ai_run, team_member_file_analysis, team_member_question_ai_run'];
  if (!(await sqliteAvailable())) {
    report.sourceAvailable = false;
    report.warnings.push('SQLite governance.db not present — run where it exists to evaluate aiRuns.');
    return report;
  }
  const dupes = createDuplicateTracker();
  const cross = ctx && ctx.crossref;

  const emit = (candidate, sqliteId, subjectRegisterKey) => {
    if (dupes.check(sqliteId, sqliteId).duplicate) { report.duplicateRecords += 1; return; }
    const v = validateDocument('aiRuns', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (cross) cross.register('aiRuns', sqliteId);
      if (ctx && ctx.sink) ctx.sink('aiRuns', candidate, { 'metadata.legacy.sqliteId': sqliteId });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${sqliteId}: ${e}`));
    }
    void subjectRegisterKey;
  };

  const base = (engine, status, actionType, startedAt, extra) => ({
    companyKey: MIGRATION_CONFIG.companyKey,
    engine: (upcaseEnum(engine, ENUMS.AI_ENGINE).ok ? upcaseEnum(engine, ENUMS.AI_ENGINE).value : 'CLAUDE'),
    actionType: (upcaseEnum(actionType, ENUMS.AI_ACTION_TYPE).ok ? upcaseEnum(actionType, ENUMS.AI_ACTION_TYPE).value : 'ANALYSIS'),
    status: (upcaseEnum(status, ENUMS.AI_STATUS).ok ? upcaseEnum(status, ENUMS.AI_STATUS).value : 'SUCCEEDED'),
    startedAt: parseISTToUTC(startedAt).date || new Date(0),
    ...extra,
  });

  // 1) ai_run → subject = the intake it belongs to
  for (const row of await readTable('ai_run')) {
    report.recordsRead += 1;
    const sqliteId = `ai_run:${row.id}`;
    emit({
      ...base(row.engine, row.status, 'ANALYSIS', row.started_at, {
        completedAt: parseISTToUTC(row.completed_at).date || null,
        promptText: row.prompt_text || undefined,
        outputText: row.output_text || undefined,
        errorText: row.error_text || undefined,
        subject: { collection: 'intakes', id: cross ? cross.objectIdFor('intakes', `intake:${row.intake_id}`) : String(row.intake_id) },
        metadata: { legacy: { sqliteTable: 'ai_run', id: row.id, sqliteId } },
      }),
    }, sqliteId);
  }

  // 2) team_member_file_analysis → subject = the attachment (team_member_files)
  for (const row of await readTable('team_member_file_analysis')) {
    report.recordsRead += 1;
    const sqliteId = `tmfa:${row.id}`;
    emit({
      ...base(row.engine, row.status, 'ANALYSIS', row.started_at, {
        completedAt: parseISTToUTC(row.completed_at).date || null,
        outputText: row.summary_text || row.raw_output_text || undefined,
        errorText: row.error_text || undefined,
        subject: { collection: 'attachments', id: cross ? cross.objectIdFor('attachments', `team_member_files:${row.member_file_id}`) : String(row.member_file_id) },
        metadata: { legacy: { sqliteTable: 'team_member_file_analysis', id: row.id, sqliteId } },
      }),
    }, sqliteId);
  }

  // 3) team_member_question_ai_run → subject = the employee
  for (const row of await readTable('team_member_question_ai_run')) {
    report.recordsRead += 1;
    const sqliteId = `tmqar:${row.id}`;
    emit({
      ...base(row.engine, row.status, row.action_type, row.started_at, {
        completedAt: parseISTToUTC(row.completed_at).date || null,
        promptText: row.prompt_text || undefined,
        outputText: row.output_text || undefined,
        errorText: row.error_text || undefined,
        subject: { collection: 'employees', id: slugify(row.team_member_key || '') },
        metadata: { legacy: { sqliteTable: 'team_member_question_ai_run', id: row.id, sqliteId } },
      }),
    }, sqliteId);
  }

  return report;
}
