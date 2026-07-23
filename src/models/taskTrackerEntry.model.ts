// Task Tracker entry document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.4. A Task Tracker entry is a
// periodic per-employee work log (today: Governance_Files/task_tracker/*.md).
// The document extends the shared BaseDocument envelope.
//
// Phase 3 defines the shape and pure validators only. Nothing here connects to
// MongoDB, reads, writes, or migrates any GitHub markdown.

import type { BaseDocument } from '@/src/models/base';
import { TASK_STATUS, type TaskStatus } from '@/src/constants/enums';

/** A parsed section of the entry body (e.g. a project heading + bullet items). */
export interface TaskSection {
  heading: string;
  items: string[];
}

/** Optional pointer to the entry's committed markdown (reconciliation anchor). */
export interface GithubRef {
  path?: string;
  sha?: string;
  commitUrl?: string;
}

/** A Task Tracker entry as stored in GovernanceDB.taskTrackerEntries. */
export interface TaskTrackerEntryDoc extends BaseDocument {
  /** → employees.memberKey. */
  employeeKey: string;
  /** Denormalized name for list views (optional snapshot). */
  employeeName?: string;
  /** The work date (IST-aware in the app; stored as UTC Date). */
  entryDate: Date;
  title: string;
  bodyMarkdown?: string;
  /** Structured sections parsed from the body (bounded, always co-read). */
  sections: TaskSection[];
  status: TaskStatus;
  githubRef?: GithubRef;
}

/** Fields a caller supplies to create an entry (envelope is added by the repo). */
export interface CreateTaskTrackerEntryInput {
  employeeKey: string;
  entryDate: Date;
  employeeName?: string;
  title?: string;
  bodyMarkdown?: string;
  sections?: TaskSection[];
  status?: TaskStatus;
  githubRef?: GithubRef;
}

/** Mutable fields for an update (never the employeeKey or the audit envelope). */
export type UpdateTaskTrackerEntryInput = Partial<
  Omit<CreateTaskTrackerEntryInput, 'employeeKey'>
>;

// ---------------------------------------------------------------------------
// Pure edge validation (no I/O, no validation-library dependency).
// The database $jsonSchema validator is the authoritative second layer.
// ---------------------------------------------------------------------------

const EMPLOYEE_KEY_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

function isValidSections(v: unknown): v is TaskSection[] {
  return (
    Array.isArray(v)
    && v.every(
      (s) =>
        s
        && typeof s === 'object'
        && typeof (s as TaskSection).heading === 'string'
        && Array.isArray((s as TaskSection).items)
        && (s as TaskSection).items.every((i) => typeof i === 'string'),
    )
  );
}

/** Validate a CreateTaskTrackerEntryInput. Pure — performs no I/O. */
export function validateCreateTaskTrackerEntryInput(
  input: CreateTaskTrackerEntryInput,
): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['input must be an object'] };
  }
  if (typeof input.employeeKey !== 'string' || !EMPLOYEE_KEY_RE.test(input.employeeKey)) {
    errors.push('employeeKey is required and must be a lowercase slug (e.g. "ajay_landge")');
  }
  if (!isValidDate(input.entryDate)) {
    errors.push('entryDate is required and must be a valid Date');
  }
  if (input.status !== undefined && !TASK_STATUS.includes(input.status)) {
    errors.push(`status must be one of: ${TASK_STATUS.join(', ')}`);
  }
  if (input.title !== undefined && typeof input.title !== 'string') {
    errors.push('title, when provided, must be a string');
  }
  if (input.bodyMarkdown !== undefined && typeof input.bodyMarkdown !== 'string') {
    errors.push('bodyMarkdown, when provided, must be a string');
  }
  if (input.sections !== undefined && !isValidSections(input.sections)) {
    errors.push('sections, when provided, must be an array of { heading: string, items: string[] }');
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Normalize a CreateTaskTrackerEntryInput into the non-envelope document fields,
 * applying V1 defaults (title "Task Tracker", empty sections, status SUBMITTED).
 * Pure — the audit envelope is added later by the repository.
 */
export function toTaskTrackerEntryFields(
  input: CreateTaskTrackerEntryInput,
): Omit<TaskTrackerEntryDoc, keyof BaseDocument | '_id'> {
  return {
    employeeKey: input.employeeKey,
    employeeName: input.employeeName,
    entryDate: input.entryDate,
    title: input.title ?? 'Task Tracker',
    bodyMarkdown: input.bodyMarkdown,
    sections: input.sections ?? [],
    status: input.status ?? 'SUBMITTED',
    githubRef: input.githubRef,
  };
}
