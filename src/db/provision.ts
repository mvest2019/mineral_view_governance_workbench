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
