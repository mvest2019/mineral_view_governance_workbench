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
import { readConfigAspectGroups } from '../readers/config.mjs';

/** Extract an F-#### finding code from a link string, or undefined. */
function extractFindingCode(link) {
  const m = String(link || '').match(/F-[0-9-]+/);
  return m ? m[0] : undefined;
}
/** Extract a Q-… question code from a link string, or undefined. */
function extractQuestionCode(link) {
  const m = String(link || '').match(/Q-[A-Z0-9-]+/);
  return m ? m[0] : undefined;
}

export async function dryRun(ctx) {
  const report = createCollectionReport('repositories');
  report.sources = ['SQLite: repo_classification (governance.db)', 'lib/config.ts: ASPECT_GROUP_RULES'];

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
  const aspectGroups = readConfigAspectGroups();
  const dupes = createDuplicateTracker();
  for (const row of rows) {
    report.recordsRead += 1;
    const confidence = upcaseEnum(row.confidence, ENUMS.CONFIDENCE);
    const approval = upcaseEnum(row.approval_status || 'PENDING', ENUMS.REPO_APPROVAL_STATUS);
    const findingCode = extractFindingCode(row.finding_link);
    const questionCode = extractQuestionCode(row.question_link);

    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      name: row.repo_name,
      aspectGroup: aspectGroups.get(row.repo_name) || undefined,
      departmentKeys: [],
      isArchived: false,
      classification: {
        observedPurpose: row.observed_purpose || undefined,
        proposedCategory: row.proposed_category || undefined,
        confidence: confidence.ok ? confidence.value : undefined,
        canonicalStatus: row.canonical_status || undefined,
        evidence: row.evidence || undefined,
        approvalStatus: approval.ok ? approval.value : 'PENDING',
        findingCode,
        questionCode,
        updatedAt: row.updated_at || undefined,
      },
      _legacy: { sqliteTable: 'repo_classification', id: row.id },
    };
    if (!confidence.ok && row.confidence) report.warnings.push(`${row.repo_name}: unknown confidence "${row.confidence}"`);
    if (!row.repo_name) { report.warnings.push(`row id ${row.id}: missing repo_name`); }

    // Relationship notes: classification.findingCode → findings; questionCode →
    // repoQuestions. Those collections come from SQLite too; when present, the
    // reference index would confirm they resolve.
    if (ctx && ctx.crossref) {
      if (findingCode && !ctx.crossref.has('findings', findingCode)) {
        report.warnings.push(`${row.repo_name}: classification.findingCode ${findingCode} not resolved (findings not in this run)`);
      }
      if (questionCode && !ctx.crossref.has('repoQuestions', questionCode)) {
        report.warnings.push(`${row.repo_name}: classification.questionCode ${questionCode} not resolved (repoQuestions not in this run)`);
      }
    }

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
