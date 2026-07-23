// Migration report model + rendering. Accumulates per-collection dry-run stats
// and renders a console summary + a JSON report file. No MongoDB involved.

import fs from 'fs';
import path from 'path';

/** Create an empty per-collection report. */
export function createCollectionReport(collection) {
  return {
    collection,
    sourceAvailable: true,
    sources: [],
    recordsRead: 0,
    validRecords: 0,
    invalidRecords: 0,
    duplicateRecords: 0,
    missingReferences: 0,
    warnings: [],
    errors: [],
    estimatedDocuments: 0,
    samples: [],
  };
}

/** Add a bounded sample document (first few only) for eyeballing. */
export function addSample(report, doc, max = 3) {
  if (report.samples.length < max) report.samples.push(doc);
}

/** Merge many collection reports into a run report. */
export function createRunReport(mode, collectionReports) {
  const totals = collectionReports.reduce((acc, r) => {
    acc.recordsRead += r.recordsRead;
    acc.validRecords += r.validRecords;
    acc.invalidRecords += r.invalidRecords;
    acc.duplicateRecords += r.duplicateRecords;
    acc.missingReferences += r.missingReferences;
    acc.estimatedDocuments += r.estimatedDocuments;
    acc.warnings += r.warnings.length;
    acc.errors += r.errors.length;
    return acc;
  }, {
    recordsRead: 0, validRecords: 0, invalidRecords: 0, duplicateRecords: 0,
    missingReferences: 0, estimatedDocuments: 0, warnings: 0, errors: 0,
  });
  const evaluated = collectionReports.filter((r) => r.sourceAvailable);
  const unavailable = collectionReports.filter((r) => !r.sourceAvailable).map((r) => r.collection);
  const blockers = evaluated.filter((r) => r.invalidRecords > 0 || r.errors.length > 0).map((r) => r.collection);
  let status;
  if (blockers.length) status = 'NEEDS_REVIEW';
  else if (unavailable.length) status = 'READY_PENDING_UNAVAILABLE_SOURCES';
  else status = 'READY';

  return {
    mode,
    generatedAt: new Date().toISOString(),
    databaseReferenced: 'GovernanceDB',
    documentsInserted: 0, // ALWAYS zero in this phase — dry-run never writes.
    readiness: { status, blockers, unavailableSources: unavailable },
    collections: collectionReports,
    totals,
  };
}

/** Write the run report to a JSON file under the reports dir. Returns the path. */
export function writeReportFile(runReport, reportsDir) {
  try {
    fs.mkdirSync(reportsDir, { recursive: true });
    const stamp = runReport.generatedAt.replace(/[:.]/g, '-');
    const file = path.join(reportsDir, `dry-run-${stamp}.json`);
    fs.writeFileSync(file, JSON.stringify(runReport, null, 2), 'utf-8');
    return file;
  } catch (err) {
    return `(!) could not write report file: ${err && err.message ? err.message : err}`;
  }
}

/** Render a human-readable console summary. */
export function renderConsole(runReport) {
  const L = [];
  L.push('');
  L.push('══════════════════════════════════════════════════════════════');
  L.push(`  MIGRATION ${runReport.mode.toUpperCase()} REPORT`);
  L.push(`  Generated: ${runReport.generatedAt}`);
  L.push(`  Database referenced: ${runReport.databaseReferenced}`);
  L.push(`  Documents inserted: ${runReport.documentsInserted}  (dry-run writes nothing)`);
  L.push('══════════════════════════════════════════════════════════════');
  for (const r of runReport.collections) {
    L.push('');
    L.push(`▶ ${r.collection}`);
    if (!r.sourceAvailable) {
      L.push(`    source: UNAVAILABLE (${r.sources.join(', ') || 'n/a'}) — skipped, nothing to migrate here in this environment`);
    } else {
      L.push(`    sources: ${r.sources.join(', ')}`);
    }
    L.push(`    records read ......... ${r.recordsRead}`);
    L.push(`    valid ................ ${r.validRecords}`);
    L.push(`    invalid .............. ${r.invalidRecords}`);
    L.push(`    duplicates ........... ${r.duplicateRecords}`);
    L.push(`    missing references ... ${r.missingReferences}`);
    L.push(`    warnings ............. ${r.warnings.length}`);
    L.push(`    errors ............... ${r.errors.length}`);
    if (r.backfilledQuestions != null) L.push(`    back-filled questions  ${r.backfilledQuestions}`);
    L.push(`    estimated documents .. ${r.estimatedDocuments}`);
    for (const w of r.warnings.slice(0, 5)) L.push(`      ⚠ ${w}`);
    if (r.warnings.length > 5) L.push(`      … +${r.warnings.length - 5} more warnings`);
    for (const e of r.errors.slice(0, 5)) L.push(`      ✖ ${e}`);
    if (r.errors.length > 5) L.push(`      … +${r.errors.length - 5} more errors`);
  }
  const t = runReport.totals;
  L.push('');
  L.push('──────────────────────────────────────────────────────────────');
  L.push('  TOTALS');
  L.push(`    read ${t.recordsRead} · valid ${t.validRecords} · invalid ${t.invalidRecords} · dup ${t.duplicateRecords} · missingRefs ${t.missingReferences}`);
  L.push(`    warnings ${t.warnings} · errors ${t.errors} · estimated documents ${t.estimatedDocuments}`);
  L.push('──────────────────────────────────────────────────────────────');
  if (runReport.readiness) {
    L.push('');
    L.push(`  READINESS: ${runReport.readiness.status}`);
    if (runReport.readiness.blockers.length) {
      L.push(`    blockers (invalid/errors): ${runReport.readiness.blockers.join(', ')}`);
    }
    if (runReport.readiness.unavailableSources.length) {
      L.push(`    unavailable sources (evaluate elsewhere): ${runReport.readiness.unavailableSources.join(', ')}`);
    }
    L.push('──────────────────────────────────────────────────────────────');
  }
  L.push('');
  return L.join('\n');
}
