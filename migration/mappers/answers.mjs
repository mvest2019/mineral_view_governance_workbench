// answers mapper (dry-run). Source: Priority_Questions/<slug>_answers/*.md (G2)
// + _answered_qids.md ledger (G3).
//
// Fixes applied (per MONGODB_MIGRATION_READINESS.md):
//  - Uses the EXACT priority-answer field layout (readers/github.parsePriorityAnswerFile),
//    so answer bodies containing "Phrase:" stay intact — no more false empties.
//  - Duplicate detection uses a content-derived key over the FULL answer, so
//    truncation no longer produces false duplicates.
//  - Question linking: if no existing question matches by normalized title, the
//    question is BACK-FILLED from the file's own Question block (a synthesized
//    priorityQuestion, source=FILE, deterministic Q-MIG-<hash> code). No answer
//    is orphaned. questionMatch.{strategy,confidence} is stored per the V1 spec.

import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { slugify, parseISTToUTC, normalizeTitle, sha256 } from '../lib/utils.mjs';
import { readPriorityAnswerFiles } from '../readers/github.mjs';

export function dryRun(ctx) {
  const report = createCollectionReport('answers');
  report.backfilledQuestions = 0;
  report.sources = [
    'Governance_Files/Priority_Questions/<member>_answers/*.md',
    'Governance_Files/Priority_Questions/_answered_qids.md',
  ];

  const files = readPriorityAnswerFiles();
  if (!files.length) { report.sourceAvailable = false; return report; }

  const titleIndex = (ctx && ctx.titleIndex) || new Map();
  const backfill = new Map(); // normalizedTitle -> synthesized questionCode (dedupe within run)
  const dupes = createDuplicateTracker();
  let matched = 0; let backfilled = 0;

  for (const f of files) {
    report.recordsRead += 1;
    const x = f.fields || {};
    const questionText = x.question || '';
    const answerMarkdown = x.answer || '';
    const answeredByRaw = x.answeredBy || f.memberSlug;
    const answeredByKey = answeredByRaw ? slugify(answeredByRaw) : undefined;
    const parsed = parseISTToUTC(x.createdAt || x.answeredDate, x.answeredTime);

    // ---- link the answer to a question ----
    const norm = normalizeTitle(questionText);
    let questionCode;
    let questionMatch;
    const meta = { legacy: { githubPath: f.path } };

    if (norm && titleIndex.has(norm)) {
      // Matches an existing (AI-generated) priority question.
      questionCode = titleIndex.get(norm);
      questionMatch = { strategy: 'FUZZY_TITLE', confidence: 'HIGH' };
      matched += 1;
    } else if (norm) {
      // No match → back-fill a question from this file's Question block.
      if (!backfill.has(norm)) {
        const code = `Q-MIG-${sha256(norm).slice(0, 8).toUpperCase()}`;
        backfill.set(norm, code);
        titleIndex.set(norm, code);
        report.backfilledQuestions += 1;
        backfilled += 1;
        // In --execute, emit the synthesized priorityQuestion so the answer's
        // reference resolves. Idempotent on questionCode. (No-op in dry-run.)
        if (ctx && ctx.sink) {
          ctx.sink('priorityQuestions', {
            companyKey: MIGRATION_CONFIG.companyKey,
            questionCode: code,
            normalizedTitle: norm,
            title: questionText.split('\n')[0].slice(0, 300),
            bodyMarkdown: questionText,
            priority: 'MEDIUM',
            status: 'ANSWERED',
            source: 'FILE',
            generatedBy: 'migration',
            answerCount: 0,
            metadata: { legacy: { synthesizedFrom: f.path }, reviewNeeded: true },
          }, { questionCode: code });
        }
      }
      questionCode = backfill.get(norm);
      questionMatch = { strategy: 'MANUAL', confidence: 'MEDIUM' };
      meta.synthesizedQuestion = true;
      meta.reviewNeeded = true;
    } else {
      // No question text at all → cannot link; hold for review (quarantine).
      report.missingReferences += 1;
      report.warnings.push(`${f.path}: answer file has no Question block — cannot link (quarantine for review)`);
      continue;
    }

    // ---- duplicate detection on the FULL answer content ----
    const dupKey = sha256(`${questionCode}|${answeredByKey}|${parsed.date ? parsed.date.toISOString() : ''}|${answerMarkdown}`);
    if (dupes.check(dupKey, f.path).duplicate) { report.duplicateRecords += 1; continue; }
    meta.legacy.dedupeKey = dupKey; // stable idempotency key for --execute upsert

    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      questionCode,
      questionKind: 'PRIORITY',
      answerMarkdown,
      answeredByKey,
      answeredByName: answeredByRaw,
      answeredAt: parsed.date || undefined,
      questionMatch,
      metadata: meta,
    };
    if (!parsed.ok) report.warnings.push(`${f.path}: could not parse answered date`);
    if (answeredByKey && ctx && ctx.crossref && !ctx.crossref.has('employees', answeredByKey)) {
      report.warnings.push(`${f.path}: answeredByKey "${answeredByKey}" not in employees roster`);
    }

    const v = validateDocument('answers', candidate);
    v.warnings.forEach((w) => report.warnings.push(`${f.path}: ${w}`));
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.sink) ctx.sink('answers', candidate, { 'metadata.legacy.dedupeKey': dupKey });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${f.path}: ${e}`));
    }
  }

  report.warnings.push(
    `linking: ${matched} answers matched an existing question by title; ${backfilled} question(s) `
    + 'would be back-filled from answer files (source=FILE, code Q-MIG-<hash>, confidence MEDIUM, '
    + 'flagged reviewNeeded). No answer is orphaned.',
  );
  return report;
}
