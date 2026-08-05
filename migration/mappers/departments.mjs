// departments mapper (dry-run). Source: lib/config.ts DEPARTMENT_ARCHITECTURE.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { readConfigDepartments } from '../readers/config.mjs';

export function dryRun(ctx) {
  const report = createCollectionReport('departments');
  report.sources = ['lib/config.ts: DEPARTMENT_ARCHITECTURE'];
  const depts = readConfigDepartments();
  if (!depts.length) { report.sourceAvailable = false; return report; }

  const dupes = createDuplicateTracker();
  for (const d of depts) {
    report.recordsRead += 1;
    if (dupes.check(d.key, d.key).duplicate) { report.duplicateRecords += 1; continue; }
    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      key: d.key,
      name: d.name,
      description: d.description || undefined,
      repoScopes: [],
      metadata: { legacy: { configKey: d.key } },
    };
    const v = validateDocument('departments', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.crossref) ctx.crossref.register('departments', d.key);
      if (ctx && ctx.sink) ctx.sink('departments', candidate, { key: d.key });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${d.key}: ${e}`));
    }
  }
  return report;
}
