// taskTrackerEntries mapper (dry-run). Source: Governance_Files/task_tracker/*.md
// (G1 — GitHub authoritative). Builds candidate documents, validates, dedupes,
// and checks that the employee reference exists in the roster.

import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { slugify, parseISTToUTC, sha256 } from '../lib/utils.mjs';
import { readTaskTrackerFiles } from '../readers/github.mjs';

export function dryRun(ctx) {
  const report = createCollectionReport('taskTrackerEntries');
  report.sources = ['Governance_Files/task_tracker/*.md'];

  const files = readTaskTrackerFiles();
  if (!files.length) { report.sourceAvailable = false; return report; }

  const dupes = createDuplicateTracker();
  for (const f of files) {
    report.recordsRead += 1;
    const b = f.blocks;
    const employeeName = b.Employee || b.employee;
    const employeeKey = employeeName ? slugify(employeeName) : undefined;
    const createdAt = b['Created At'] || b['Created Date'];
    const parsed = parseISTToUTC(createdAt, b['Created Time']);
    if (!parsed.ok) report.warnings.push(`${f.path}: could not parse Created At "${createdAt}"`);
    const bodyMarkdown = b['Task Description'] || '';

    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      employeeKey,
      entryDate: parsed.date || undefined,
      title: b['Task Tracker'] ? 'Task Tracker' : 'Task Tracker',
      bodyMarkdown,
      sections: [],
      status: 'SUBMITTED',
      githubRef: { path: f.path.replace(MIGRATION_CONFIG.paths.governanceFiles, 'Governance_Files') },
      _legacy: { githubPath: f.path },
    };

    // Duplicate on (employee, date, body-hash).
    const dupKey = `${employeeKey}|${createdAt}|${sha256(bodyMarkdown).slice(0, 12)}`;
    if (dupes.check(dupKey, f.path).duplicate) { report.duplicateRecords += 1; continue; }

    // Missing reference: employee must exist in the roster.
    if (ctx && ctx.crossref && employeeKey && !ctx.crossref.has('employees', employeeKey)) {
      report.missingReferences += 1;
      report.warnings.push(`${f.path}: employeeKey "${employeeKey}" not found in employees roster`);
    }

    const v = validateDocument('taskTrackerEntries', candidate);
    v.warnings.forEach((w) => report.warnings.push(`${f.path}: ${w}`));
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.sink) ctx.sink('taskTrackerEntries', candidate, { 'metadata.legacy.githubPath': f.path });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${f.path}: ${e}`));
    }
  }
  return report;
}
