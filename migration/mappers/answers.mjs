// answers mapper (dry-run). Source: Priority_Questions/<slug>_answers/*.md (G2)
// + _answered_qids.md ledger (G3). Answer files carry only the question TEXT
// (not the qid), so linking is lossy: we match normalized question text to a
// known priorityQuestion. Unlinkable answers are reported as missing references
// (held back for human review — never guessed), per migration design §7.

import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { slugify, parseISTToUTC, normalizeTitle, sha256 } from '../lib/utils.mjs';
import { readPriorityAnswerFiles } from '../readers/github.mjs';

export function dryRun(ctx) {
  const report = createCollectionReport('answers');
  report.sources = [
    'Governance_Files/Priority_Questions/<member>_answers/*.md',
    'Governance_Files/Priority_Questions/_answered_qids.md',
  ];

  const files = readPriorityAnswerFiles();
  if (!files.length) { report.sourceAvailable = false; return report; }

  const titleIndex = (ctx && ctx.titleIndex) || new Map();
  const dupes = createDuplicateTracker();
  let unlinked = 0;

  for (const f of files) {
    report.recordsRead += 1;
    const b = f.blocks;
    const questionText = b.Question || b.question || '';
    const answerMarkdown = b.Answer || b.answer || '';
    const answeredByRaw = b['Answered By'] || f.memberSlug;
    const answeredByKey = answeredByRaw ? slugify(answeredByRaw) : undefined;
    const parsed = parseISTToUTC(b['Created At'] || b['Answered Date'], b['Answered Time']);

    // Attempt to link the answer to a known question by normalized text.
    const norm = normalizeTitle(questionText);
    const matchedCode = titleIndex.get(norm);
    let questionMatch;
    let questionCode;
    if (matchedCode) {
      questionCode = matchedCode;
      questionMatch = { strategy: 'FUZZY_TITLE', confidence: 'HIGH' };
    } else {
      unlinked += 1;
      questionMatch = { strategy: 'UNLINKED', confidence: 'LOW' };
    }

    // Duplicate on (answeredBy, answer-hash).
    const dupKey = `${answeredByKey}|${sha256(answerMarkdown).slice(0, 12)}`;
    if (dupes.check(dupKey, f.path).duplicate) { report.duplicateRecords += 1; continue; }

    if (!questionCode) {
      // Unlinkable → held for human review; not counted as a valid document.
      report.missingReferences += 1;
      report.warnings.push(`${f.path}: answer could not be linked to a known question (UNLINKED)`);
      continue;
    }

    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      questionCode,
      questionKind: 'PRIORITY',
      answerMarkdown,
      answeredByKey,
      answeredByName: answeredByRaw,
      answeredAt: parsed.date || undefined,
      questionMatch,
      _legacy: { githubPath: f.path },
    };
    if (!parsed.ok) report.warnings.push(`${f.path}: could not parse answered date`);

    const v = validateDocument('answers', candidate);
    v.warnings.forEach((w) => report.warnings.push(`${f.path}: ${w}`));
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1; addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${f.path}: ${e}`));
    }
  }

  if (unlinked > 0) {
    report.warnings.push(
      `${unlinked} of ${report.recordsRead} answer files could not be linked to an AI-generated `
      + 'question (they answer older corpus questions). These are held for human review, per '
      + 'migration design §7 — not auto-migrated.',
    );
  }
  return report;
}
