// Migration runner. Orchestrates dry-run for the supported collections. It
// REFUSES any non-dry-run mode in this phase — execution (inserts) is not
// implemented, guaranteeing nothing is ever written to MongoDB.

import { MIGRATION_CONFIG } from './config.mjs';
import { createRunReport } from './lib/report.mjs';
import { createCrossRef } from './lib/crossref.mjs';
import { createProgress } from './lib/progress.mjs';
import { slugify } from './lib/utils.mjs';

import { readTeamMemberProfiles, readGeneratedQuestions, readTaskTrackerFiles } from './readers/github.mjs';
import { readConfigEmployeeKeys } from './readers/config.mjs';
import { normalizeTitle } from './lib/utils.mjs';

import { dryRun as employees } from './mappers/employees.mjs';
import { dryRun as taskTrackerEntries } from './mappers/taskTrackerEntries.mjs';
import { dryRun as priorityQuestions } from './mappers/priorityQuestions.mjs';
import { dryRun as answers } from './mappers/answers.mjs';
import { dryRun as meetings } from './mappers/meetings.mjs';
import { dryRun as repositories } from './mappers/repositories.mjs';

const MAPPERS = {
  employees, taskTrackerEntries, priorityQuestions, answers, meetings, repositories,
};

/**
 * Pre-register reference keys so ref checks work even for a single --collection
 * run: employee roster (profiles + config + task authors) and question codes +
 * a normalizedTitle→code index (for answer linking).
 */
function buildReferenceIndex(crossref, titleIndex) {
  for (const p of readTeamMemberProfiles()) crossref.register('employees', p.memberKey);
  for (const c of readConfigEmployeeKeys()) crossref.register('employees', c.memberKey);
  for (const f of readTaskTrackerFiles()) {
    const name = f.blocks.Employee || f.blocks.employee;
    if (name) crossref.register('employees', slugify(name));
  }
  for (const q of readGeneratedQuestions()) {
    crossref.register('priorityQuestions', q.questionCode);
    const n = normalizeTitle(q.title || q.shortQuestion);
    if (n) titleIndex.set(n, q.questionCode);
  }
}

/**
 * Run a dry-run over the given collections. Returns a run report. Writes nothing
 * to MongoDB (no connection is opened).
 */
export async function runDryRun(collections, options = {}) {
  if (!options.dryRun) {
    throw new Error(
      'Only --dry-run is supported in the migration framework phase. Execution '
      + '(inserting documents) is intentionally NOT implemented. Nothing has been '
      + 'written to MongoDB.',
    );
  }

  const progress = createProgress({ quiet: options.quiet });
  const crossref = createCrossRef();
  const titleIndex = new Map();
  buildReferenceIndex(crossref, titleIndex);

  const ctx = { crossref, titleIndex, progress };
  const reports = [];
  for (const name of collections) {
    const fn = MAPPERS[name];
    if (!fn) {
      const stub = { collection: name, sourceAvailable: false, sources: [], recordsRead: 0, validRecords: 0, invalidRecords: 0, duplicateRecords: 0, missingReferences: 0, warnings: [`unknown collection: ${name}`], errors: [], estimatedDocuments: 0, samples: [] };
      reports.push(stub);
      continue;
    }
    if (!options.quiet) console.log(`\n── dry-run: ${name} ──`);
    reports.push(await fn(ctx));
  }
  return createRunReport('dry-run', reports);
}

export function resolveCollections(argCollections, all) {
  if (all) return MIGRATION_CONFIG.supportedCollections.slice();
  return argCollections.slice();
}

export const SUPPORTED = MIGRATION_CONFIG.supportedCollections;
