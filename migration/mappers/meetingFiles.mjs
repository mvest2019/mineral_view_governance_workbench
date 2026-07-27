// meetingFiles mapper (dry-run). Source: Governance_Files/Meetings/*.md
// ("Uploaded File:" field), linked to the meeting. meetingId is resolved via the
// crossref using the SAME natural key the meetings mapper uses (the file path),
// so the reference matches the meeting's _id in an --execute run.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { sha256 } from '../lib/utils.mjs';
import { readMeetingFiles } from '../readers/github.mjs';

export function dryRun(ctx) {
  const report = createCollectionReport('meetingFiles');
  report.sources = ['Governance_Files/Meetings/*.md (Uploaded File)'];
  const files = readMeetingFiles();
  if (!files.length) { report.sourceAvailable = false; return report; }

  const dupes = createDuplicateTracker();
  for (const f of files) {
    const uploaded = (f.blocks['Uploaded File'] || '').trim();
    if (!uploaded || uploaded === '(none)') continue;
    report.recordsRead += 1;

    // Resolve the parent meeting's _id from the crossref (same key: the md path).
    const meetingId = ctx && ctx.crossref ? ctx.crossref.objectIdFor('meetings', f.path) : undefined;
    const dedupeKey = sha256(`${f.path}|${uploaded}`).slice(0, 16);

    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      meetingId,
      originalFilename: uploaded,
      storageRef: { provider: 'github', key: f.path.replace(MIGRATION_CONFIG.paths.governanceFiles, 'Governance_Files') },
      kind: 'NOTES',
      metadata: { legacy: { githubPath: f.path, dedupeKey } },
    };

    if (dupes.check(dedupeKey, f.path).duplicate) { report.duplicateRecords += 1; continue; }
    if (!meetingId) { report.missingReferences += 1; report.warnings.push(`${f.path}: could not resolve parent meeting`); }

    const v = validateDocument('meetingFiles', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.sink) ctx.sink('meetingFiles', candidate, { 'metadata.legacy.dedupeKey': dedupeKey });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${f.path}: ${e}`));
    }
  }
  return report;
}
