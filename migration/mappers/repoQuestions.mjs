// repoQuestions mapper (dry-run). Source: SQLite repo_questions.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG, ENUMS } from '../config.mjs';
import { slugify, upcaseEnum } from '../lib/utils.mjs';
import { readTable, sqliteAvailable } from '../readers/sqlite.mjs';

export async function dryRun(ctx) {
  const report = createCollectionReport('repoQuestions');
  report.sources = ['SQLite: repo_questions (governance.db)'];
  if (!(await sqliteAvailable())) {
    report.sourceAvailable = false;
    report.warnings.push('SQLite governance.db not present — run where it exists to evaluate repoQuestions.');
    return report;
  }
  const rows = await readTable('repo_questions');
  const dupes = createDuplicateTracker();
  for (const row of rows) {
    report.recordsRead += 1;
    const priority = upcaseEnum(row.priority || 'MEDIUM', ENUMS.PRIORITY);
    const status = upcaseEnum(row.status || 'OPEN', ENUMS.QUESTION_STATUS);
    const source = upcaseEnum(row.source || 'MANUAL', ENUMS.QUESTION_SOURCE);
    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      questionCode: row.question_code,
      repoName: row.repo_name,
      title: row.title || undefined,
      bodyMarkdown: row.body_markdown || row.title || '',
      shortQuestion: row.short_question || undefined,
      sourceExcerpt: row.source_excerpt || undefined,
      priority: priority.ok ? priority.value : 'MEDIUM',
      status: status.ok ? status.value : 'OPEN',
      source: source.ok ? source.value : 'MANUAL',
      sourceRef: row.source_ref || undefined,
      primaryAssigneeKey: row.primary_assignee ? slugify(row.primary_assignee) : undefined,
      answerMarkdown: row.answer_markdown || undefined,
      reviewNote: row.review_note || undefined,
      reviewedByKey: row.reviewed_by ? slugify(row.reviewed_by) : undefined,
      metadata: { legacy: { sqliteTable: 'repo_questions', id: row.id } },
    };
    if (dupes.check(row.question_code, row.id).duplicate) { report.duplicateRecords += 1; continue; }
    if (ctx && ctx.crossref && row.repo_name && !ctx.crossref.has('repositories', row.repo_name)) {
      report.missingReferences += 1;
      report.warnings.push(`${row.question_code}: repoName "${row.repo_name}" not resolved (repositories not in this run)`);
    }
    const v = validateDocument('repoQuestions', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.crossref) ctx.crossref.register('repoQuestions', row.question_code);
      if (ctx && ctx.sink) ctx.sink('repoQuestions', candidate, { questionCode: row.question_code });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${row.question_code}: ${e}`));
    }
  }
  return report;
}
