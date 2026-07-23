// Idempotent collection provisioning for GovernanceDB.
//
// Creates a collection with its $jsonSchema validator and applies its indexes.
// It is IDEMPOTENT: safe to run repeatedly. It inserts NO documents — it only
// sets up structure (an empty collection, a validator, and indexes).
//
// IMPORTANT: nothing calls these functions automatically. They run only when a
// provisioning step (e.g. scripts/provision-employees.mjs, or a future setup
// command) explicitly invokes them. Importing this module has no side effects.
//
// Everything here operates through getDb(), which is hard-wired to GovernanceDB,
// so provisioning can never touch another database in the cluster.

import type { Document, IndexDescription } from 'mongodb';
import { getDb } from '@/src/db/connection';
import { EMPLOYEES_VALIDATOR } from '@/src/db/validators/employees.validator';
import { EMPLOYEES_INDEXES } from '@/src/db/indexes/employees.indexes';
import { TASK_TRACKER_ENTRIES_VALIDATOR } from '@/src/db/validators/taskTrackerEntries.validator';
import { TASK_TRACKER_ENTRIES_INDEXES } from '@/src/db/indexes/taskTrackerEntries.indexes';
import { PRIORITY_QUESTIONS_VALIDATOR } from '@/src/db/validators/priorityQuestions.validator';
import { PRIORITY_QUESTIONS_INDEXES } from '@/src/db/indexes/priorityQuestions.indexes';
import { ANSWERS_VALIDATOR } from '@/src/db/validators/answers.validator';
import { ANSWERS_INDEXES } from '@/src/db/indexes/answers.indexes';
import { MEETINGS_VALIDATOR } from '@/src/db/validators/meetings.validator';
import { MEETINGS_INDEXES } from '@/src/db/indexes/meetings.indexes';
import { MEETING_FILES_VALIDATOR } from '@/src/db/validators/meetingFiles.validator';
import { MEETING_FILES_INDEXES } from '@/src/db/indexes/meetingFiles.indexes';
import { ROLES_VALIDATOR } from '@/src/db/validators/roles.validator';
import { ROLES_INDEXES } from '@/src/db/indexes/roles.indexes';
import { DEPARTMENTS_VALIDATOR } from '@/src/db/validators/departments.validator';
import { DEPARTMENTS_INDEXES } from '@/src/db/indexes/departments.indexes';
import { QUESTION_ASSIGNMENTS_VALIDATOR } from '@/src/db/validators/questionAssignments.validator';
import { QUESTION_ASSIGNMENTS_INDEXES } from '@/src/db/indexes/questionAssignments.indexes';
import { REPO_QUESTIONS_VALIDATOR } from '@/src/db/validators/repoQuestions.validator';
import { REPO_QUESTIONS_INDEXES } from '@/src/db/indexes/repoQuestions.indexes';
import { REPOSITORIES_VALIDATOR } from '@/src/db/validators/repositories.validator';
import { REPOSITORIES_INDEXES } from '@/src/db/indexes/repositories.indexes';
import { FINDINGS_VALIDATOR } from '@/src/db/validators/findings.validator';
import { FINDINGS_INDEXES } from '@/src/db/indexes/findings.indexes';
import { INTAKES_VALIDATOR } from '@/src/db/validators/intakes.validator';
import { INTAKES_INDEXES } from '@/src/db/indexes/intakes.indexes';
import { AI_RUNS_VALIDATOR } from '@/src/db/validators/aiRuns.validator';
import { AI_RUNS_INDEXES } from '@/src/db/indexes/aiRuns.indexes';
import { AI_EXCHANGES_VALIDATOR } from '@/src/db/validators/aiExchanges.validator';
import { AI_EXCHANGES_INDEXES } from '@/src/db/indexes/aiExchanges.indexes';
import { ATTACHMENTS_VALIDATOR } from '@/src/db/validators/attachments.validator';
import { ATTACHMENTS_INDEXES } from '@/src/db/indexes/attachments.indexes';
import { AUDIT_LOGS_VALIDATOR } from '@/src/db/validators/auditLogs.validator';
import { AUDIT_LOGS_INDEXES } from '@/src/db/indexes/auditLogs.indexes';
import { COLLECTIONS } from '@/src/constants/collections';

export interface ProvisionCollectionSpec {
  name: string;
  validator: Document;
  validationLevel: 'off' | 'strict' | 'moderate';
  validationAction: 'error' | 'warn';
  indexes: IndexDescription[];
}

export interface ProvisionResult {
  collection: string;
  created: boolean; // true if the collection was newly created
  validatorApplied: boolean;
  indexesEnsured: number;
}

/**
 * Provision one collection: create it with its validator if missing, otherwise
 * update the validator in place (collMod), then ensure all indexes exist.
 * Idempotent and write-free (no documents inserted).
 */
export async function provisionCollection(
  spec: ProvisionCollectionSpec,
): Promise<ProvisionResult> {
  const db = await getDb();

  const existing = await db
    .listCollections({ name: spec.name }, { nameOnly: true })
    .toArray();
  const alreadyExists = existing.length > 0;

  if (!alreadyExists) {
    await db.createCollection(spec.name, {
      validator: spec.validator,
      validationLevel: spec.validationLevel,
      validationAction: spec.validationAction,
    });
  } else {
    // Bring an existing collection's validator up to date without dropping data.
    await db.command({
      collMod: spec.name,
      validator: spec.validator,
      validationLevel: spec.validationLevel,
      validationAction: spec.validationAction,
    });
  }

  if (spec.indexes.length > 0) {
    await db.collection(spec.name).createIndexes(spec.indexes);
  }

  return {
    collection: spec.name,
    created: !alreadyExists,
    validatorApplied: true,
    indexesEnsured: spec.indexes.length,
  };
}

/** Provision the employees collection (validator + indexes). Inserts no data. */
export async function provisionEmployees(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.EMPLOYEES,
    validator: EMPLOYEES_VALIDATOR.validator,
    validationLevel: EMPLOYEES_VALIDATOR.validationLevel,
    validationAction: EMPLOYEES_VALIDATOR.validationAction,
    indexes: EMPLOYEES_INDEXES,
  });
}

/** Provision the taskTrackerEntries collection (validator + indexes). Inserts no data. */
export async function provisionTaskTrackerEntries(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.TASK_TRACKER_ENTRIES,
    validator: TASK_TRACKER_ENTRIES_VALIDATOR.validator,
    validationLevel: TASK_TRACKER_ENTRIES_VALIDATOR.validationLevel,
    validationAction: TASK_TRACKER_ENTRIES_VALIDATOR.validationAction,
    indexes: TASK_TRACKER_ENTRIES_INDEXES,
  });
}

/** Provision the priorityQuestions collection (validator + indexes). Inserts no data. */
export async function provisionPriorityQuestions(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.PRIORITY_QUESTIONS,
    validator: PRIORITY_QUESTIONS_VALIDATOR.validator,
    validationLevel: PRIORITY_QUESTIONS_VALIDATOR.validationLevel,
    validationAction: PRIORITY_QUESTIONS_VALIDATOR.validationAction,
    indexes: PRIORITY_QUESTIONS_INDEXES,
  });
}

/** Provision the answers collection (validator + indexes). Inserts no data. */
export async function provisionAnswers(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.ANSWERS,
    validator: ANSWERS_VALIDATOR.validator,
    validationLevel: ANSWERS_VALIDATOR.validationLevel,
    validationAction: ANSWERS_VALIDATOR.validationAction,
    indexes: ANSWERS_INDEXES,
  });
}

/** Provision the meetings collection (validator + indexes). Inserts no data. */
export async function provisionMeetings(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.MEETINGS,
    validator: MEETINGS_VALIDATOR.validator,
    validationLevel: MEETINGS_VALIDATOR.validationLevel,
    validationAction: MEETINGS_VALIDATOR.validationAction,
    indexes: MEETINGS_INDEXES,
  });
}

/** Provision the meetingFiles collection (validator + indexes). Inserts no data. */
export async function provisionMeetingFiles(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.MEETING_FILES,
    validator: MEETING_FILES_VALIDATOR.validator,
    validationLevel: MEETING_FILES_VALIDATOR.validationLevel,
    validationAction: MEETING_FILES_VALIDATOR.validationAction,
    indexes: MEETING_FILES_INDEXES,
  });
}

/** Provision the roles collection (validator + indexes). Inserts no data. */
export async function provisionRoles(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.ROLES,
    validator: ROLES_VALIDATOR.validator,
    validationLevel: ROLES_VALIDATOR.validationLevel,
    validationAction: ROLES_VALIDATOR.validationAction,
    indexes: ROLES_INDEXES,
  });
}

/** Provision the departments collection (validator + indexes). Inserts no data. */
export async function provisionDepartments(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.DEPARTMENTS,
    validator: DEPARTMENTS_VALIDATOR.validator,
    validationLevel: DEPARTMENTS_VALIDATOR.validationLevel,
    validationAction: DEPARTMENTS_VALIDATOR.validationAction,
    indexes: DEPARTMENTS_INDEXES,
  });
}

/** Provision the questionAssignments collection (validator + indexes). Inserts no data. */
export async function provisionQuestionAssignments(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.QUESTION_ASSIGNMENTS,
    validator: QUESTION_ASSIGNMENTS_VALIDATOR.validator,
    validationLevel: QUESTION_ASSIGNMENTS_VALIDATOR.validationLevel,
    validationAction: QUESTION_ASSIGNMENTS_VALIDATOR.validationAction,
    indexes: QUESTION_ASSIGNMENTS_INDEXES,
  });
}

/** Provision the repoQuestions collection (validator + indexes). Inserts no data. */
export async function provisionRepoQuestions(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.REPO_QUESTIONS,
    validator: REPO_QUESTIONS_VALIDATOR.validator,
    validationLevel: REPO_QUESTIONS_VALIDATOR.validationLevel,
    validationAction: REPO_QUESTIONS_VALIDATOR.validationAction,
    indexes: REPO_QUESTIONS_INDEXES,
  });
}

/** Provision the repositories collection (validator + indexes). Inserts no data. */
export async function provisionRepositories(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.REPOSITORIES,
    validator: REPOSITORIES_VALIDATOR.validator,
    validationLevel: REPOSITORIES_VALIDATOR.validationLevel,
    validationAction: REPOSITORIES_VALIDATOR.validationAction,
    indexes: REPOSITORIES_INDEXES,
  });
}

/** Provision the findings collection (validator + indexes). Inserts no data. */
export async function provisionFindings(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.FINDINGS,
    validator: FINDINGS_VALIDATOR.validator,
    validationLevel: FINDINGS_VALIDATOR.validationLevel,
    validationAction: FINDINGS_VALIDATOR.validationAction,
    indexes: FINDINGS_INDEXES,
  });
}

/** Provision the intakes collection (validator + indexes). Inserts no data. */
export async function provisionIntakes(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.INTAKES,
    validator: INTAKES_VALIDATOR.validator,
    validationLevel: INTAKES_VALIDATOR.validationLevel,
    validationAction: INTAKES_VALIDATOR.validationAction,
    indexes: INTAKES_INDEXES,
  });
}

/** Provision the aiRuns collection (validator + indexes). Inserts no data. */
export async function provisionAiRuns(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.AI_RUNS,
    validator: AI_RUNS_VALIDATOR.validator,
    validationLevel: AI_RUNS_VALIDATOR.validationLevel,
    validationAction: AI_RUNS_VALIDATOR.validationAction,
    indexes: AI_RUNS_INDEXES,
  });
}

/** Provision the aiExchanges collection (validator + indexes). Inserts no data. */
export async function provisionAiExchanges(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.AI_EXCHANGES,
    validator: AI_EXCHANGES_VALIDATOR.validator,
    validationLevel: AI_EXCHANGES_VALIDATOR.validationLevel,
    validationAction: AI_EXCHANGES_VALIDATOR.validationAction,
    indexes: AI_EXCHANGES_INDEXES,
  });
}

/** Provision the attachments collection (validator + indexes). Inserts no data. */
export async function provisionAttachments(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.ATTACHMENTS,
    validator: ATTACHMENTS_VALIDATOR.validator,
    validationLevel: ATTACHMENTS_VALIDATOR.validationLevel,
    validationAction: ATTACHMENTS_VALIDATOR.validationAction,
    indexes: ATTACHMENTS_INDEXES,
  });
}

/** Provision the auditLogs collection (validator + indexes). Inserts no data. */
export async function provisionAuditLogs(): Promise<ProvisionResult> {
  return provisionCollection({
    name: COLLECTIONS.AUDIT_LOGS,
    validator: AUDIT_LOGS_VALIDATOR.validator,
    validationLevel: AUDIT_LOGS_VALIDATOR.validationLevel,
    validationAction: AUDIT_LOGS_VALIDATOR.validationAction,
    indexes: AUDIT_LOGS_INDEXES,
  });
}
