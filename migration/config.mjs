// Migration configuration — single source of truth for the migration framework.
//
// This framework is DRY-RUN ONLY in this phase. It reads sources, validates,
// builds documents in memory, and reports. It NEVER connects to MongoDB and
// NEVER writes anything. Execution (actual inserts) is intentionally not
// implemented here.

import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, '..');

export const MIGRATION_CONFIG = {
  // The one and only target database. The framework references no other DB and
  // (in this phase) does not connect at all.
  dbName: 'GovernanceDB',
  companyKey: 'MView',

  // Source locations (read-only; never modified).
  paths: {
    governanceFiles: path.join(REPO_ROOT, 'Governance_Files'),
    taskTracker: path.join(REPO_ROOT, 'Governance_Files', 'task_tracker'),
    priorityQuestionsDir: path.join(REPO_ROOT, 'Governance_Files', 'Priority_Questions'),
    answeredLedger: path.join(REPO_ROOT, 'Governance_Files', 'Priority_Questions', '_answered_qids.md'),
    generatedQuestions: path.join(REPO_ROOT, 'Governance_Files', '_GOVERNANCE', 'AI_GENERATED_PRIORITY_QUESTIONS.md'),
    meetings: path.join(REPO_ROOT, 'Governance_Files', 'Meetings'),
    teamMembers: path.join(REPO_ROOT, 'Governance_Files', '_GOVERNANCE', 'team_members'),
    configTs: path.join(REPO_ROOT, 'lib', 'config.ts'),
    // SQLite is ephemeral (/tmp on Vercel); may be absent locally. Readers
    // degrade gracefully when it is missing.
    sqlite: process.env.WORKBENCH_DB_PATH || path.join(REPO_ROOT, 'governance.db'),
    // Dry-run reports are written here (git-ignored). Never touches sources.
    reports: path.join(HERE, 'reports'),
  },

  // Batch size for the (future) execution phase and for progress reporting.
  batchSize: Number.parseInt(process.env.MIGRATION_BATCH_SIZE || '500', 10),

  // Collections the runner can dry-run in this phase (per the request).
  supportedCollections: [
    'employees',
    'taskTrackerEntries',
    'priorityQuestions',
    'answers',
    'meetings',
    'repositories',
  ],
};

// Enum vocabularies (mirror src/constants/enums.ts — kept local so the runnable
// framework needs no TS/alias resolution).
export const ENUMS = {
  PRIORITY: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  QUESTION_STATUS: ['NEW', 'OPEN', 'ANSWERED', 'ACCEPTED', 'CLOSED'],
  TASK_STATUS: ['DRAFT', 'SUBMITTED', 'REVIEWED'],
  QUESTION_SOURCE: ['MANUAL', 'AI_GENERATED', 'FILE', 'MEETING'],
  QUESTION_KIND: ['PRIORITY', 'REPO'],
  ANSWER_MATCH_STRATEGY: ['QID', 'FUZZY_TITLE', 'MANUAL', 'UNLINKED'],
  CONFIDENCE: ['LOW', 'MEDIUM', 'HIGH'],
  ENTITY_STATUS: ['ACTIVE', 'INACTIVE', 'OFFBOARDED'],
  ROLE_KEY: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'VIEWER'],
  MEETING_SUMMARY_STATUS: ['NONE', 'DRAFT', 'FINAL'],
  ACTION_ITEM_STATUS: ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
  REPO_APPROVAL_STATUS: ['PENDING', 'APPROVED', 'REJECTED'],
};
