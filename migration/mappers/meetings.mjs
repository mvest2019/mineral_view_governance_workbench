// meetings mapper (dry-run). Source: Governance_Files/Meetings/*.md (G5), with
// SQLite meetings/attendees/action_items (S15-17) as a secondary source when
// available. Builds candidate documents with embedded attendees, validates,
// dedupes on (title, meetingAt).

import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { slugify, parseISTToUTC } from '../lib/utils.mjs';
import { readMeetingFiles } from '../readers/github.mjs';

export function dryRun(ctx) {
  const report = createCollectionReport('meetings');
  report.sources = ['Governance_Files/Meetings/*.md'];

  const files = readMeetingFiles();
  if (!files.length) { report.sourceAvailable = false; return report; }

  const dupes = createDuplicateTracker();
  for (const f of files) {
    report.recordsRead += 1;
    const b = f.blocks;
    const title = b.Title || b.title;
    const parsed = parseISTToUTC(b['Meeting Date']);
    const summaryText = b['Claude Generated Summary'] || b.Summary || '';
    const attendeesRaw = b['Team Attendees'] || '';

    const attendees = attendeesRaw
      .split(/[,\n]/).map((x) => x.trim()).filter(Boolean)
      .filter((x) => x.toLowerCase() !== '(none)')
      .map((name) => {
        const key = slugify(name);
        const inRoster = ctx && ctx.crossref && ctx.crossref.has('employees', key);
        return inRoster
          ? { employeeKey: key, attended: true, followUpDone: false }
          : { externalName: name, attended: true, followUpDone: false };
      });

    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      title,
      meetingType: 'other',
      organizerKey: b['Uploaded By'] ? slugify(b['Uploaded By']) : undefined,
      meetingAt: parsed.date || undefined,
      note: b['Additional Details'] || b['Additional Notes'] || undefined,
      attendees,
      actionItems: [],
      summary: summaryText
        ? { text: summaryText, status: 'FINAL', engine: 'CLAUDE' }
        : { status: 'NONE' },
      priorityQuestionCodes: [],
      fileIds: [],
      _legacy: { githubPath: f.path },
    };
    if (!parsed.ok) report.warnings.push(`${f.path}: could not parse Meeting Date "${b['Meeting Date']}"`);

    const dupKey = `${slugify(title || '')}|${b['Meeting Date'] || ''}`;
    if (dupes.check(dupKey, f.path).duplicate) { report.duplicateRecords += 1; continue; }

    const v = validateDocument('meetings', candidate);
    v.warnings.forEach((w) => report.warnings.push(`${f.path}: ${w}`));
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.sink) ctx.sink('meetings', candidate, { 'metadata.legacy.githubPath': f.path });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${f.path}: ${e}`));
    }
  }
  return report;
}
