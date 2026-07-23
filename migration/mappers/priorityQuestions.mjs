// priorityQuestions mapper (dry-run). Source: AI_GENERATED_PRIORITY_QUESTIONS.md
// (G4). Builds candidate documents, validates, dedupes by questionCode and flags
// normalizedTitle collisions. Registers question codes + a title index for the
// answers mapper.

import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { slugify, normalizeTitle, upcaseEnum } from '../lib/utils.mjs';
import { ENUMS } from '../config.mjs';
import { readGeneratedQuestions } from '../readers/github.mjs';

export function dryRun(ctx) {
  const report = createCollectionReport('priorityQuestions');
  report.sources = ['Governance_Files/_GOVERNANCE/AI_GENERATED_PRIORITY_QUESTIONS.md'];

  const questions = readGeneratedQuestions();
  if (!questions.length) { report.sourceAvailable = false; return report; }

  const codeDupes = createDuplicateTracker();
  const titleDupes = createDuplicateTracker();

  for (const q of questions) {
    report.recordsRead += 1;
    const targetEmployeeKey = q.employee ? slugify(q.employee) : undefined;
    const priority = upcaseEnum(q.priority, ENUMS.PRIORITY);
    const status = upcaseEnum(q.status, ENUMS.QUESTION_STATUS);
    if (!priority.ok) report.warnings.push(`${q.questionCode}: unknown priority "${q.priority}"`);
    if (!status.ok) report.warnings.push(`${q.questionCode}: unknown status "${q.status}"`);
    const normalized = normalizeTitle(q.title || q.shortQuestion);

    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      questionCode: q.questionCode,
      normalizedTitle: normalized,
      title: q.title,
      bodyMarkdown: q.body || q.shortQuestion || q.title || '',
      shortQuestion: q.shortQuestion,
      targetEmployeeKey,
      priority: priority.ok ? priority.value : 'MEDIUM',
      status: status.ok ? status.value : 'OPEN',
      source: 'AI_GENERATED',
      generatedBy: 'claude',
      answerCount: 0,
      _legacy: { githubBlock: q.questionCode },
    };

    if (codeDupes.check(q.questionCode, q.questionCode).duplicate) {
      report.duplicateRecords += 1; continue;
    }
    if (titleDupes.check(normalized).duplicate && normalized) {
      report.warnings.push(`${q.questionCode}: normalizedTitle collides with an earlier question`);
    }

    // Missing reference: target employee should exist in the roster (a warning,
    // since org-wide questions may legitimately have no target).
    if (ctx && ctx.crossref && targetEmployeeKey && !ctx.crossref.has('employees', targetEmployeeKey)) {
      report.missingReferences += 1;
      report.warnings.push(`${q.questionCode}: targetEmployeeKey "${targetEmployeeKey}" not in roster`);
    }

    const v = validateDocument('priorityQuestions', candidate);
    v.warnings.forEach((w) => report.warnings.push(`${q.questionCode}: ${w}`));
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.crossref) ctx.crossref.register('priorityQuestions', q.questionCode);
      if (ctx && ctx.titleIndex && normalized) ctx.titleIndex.set(normalized, q.questionCode);
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${q.questionCode}: ${e}`));
    }
  }
  return report;
}
