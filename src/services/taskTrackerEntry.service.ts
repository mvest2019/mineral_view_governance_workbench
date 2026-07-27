// Task Tracker service — business logic for the Task Tracker module.
//
// Orchestrates the repository and enforces business rules (edge validation,
// defaults). This is the layer a future API route would call.
//
// Phase 3 IMPORTANT: defined but NOT wired to any API route and NOT invoked by
// any existing application code. Constructing it opens no connection and
// reads/writes nothing. No records are inserted and no GitHub data is migrated.

import { TaskTrackerEntryRepository, type ListEntriesOptions } from '@/src/repositories/taskTrackerEntry.repository';
import {
  toTaskTrackerEntryFields,
  validateCreateTaskTrackerEntryInput,
  type CreateTaskTrackerEntryInput,
  type TaskTrackerEntryDoc,
  type UpdateTaskTrackerEntryInput,
} from '@/src/models/taskTrackerEntry.model';
import type { WithId } from 'mongodb';

/** Raised when input fails edge validation. */
export class TaskTrackerValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid task tracker entry: ${errors.join('; ')}`);
    this.name = 'TaskTrackerValidationError';
    this.errors = errors;
  }
}

/** Raised when an expected entry is missing or a version conflict occurs. */
export class TaskTrackerNotFoundError extends Error {
  constructor(id: string) {
    super(`No task tracker entry found for id "${id}".`);
    this.name = 'TaskTrackerNotFoundError';
  }
}

export class TaskTrackerConflictError extends Error {
  constructor(id: string) {
    super(`Task tracker entry "${id}" was modified concurrently (version mismatch).`);
    this.name = 'TaskTrackerConflictError';
  }
}

export class TaskTrackerService {
  private readonly repo: TaskTrackerEntryRepository;

  constructor(repo?: TaskTrackerEntryRepository) {
    this.repo = repo ?? new TaskTrackerEntryRepository();
  }

  /**
   * Create a Task Tracker entry: validate, apply defaults, persist with an audit
   * envelope. Multiple entries per employee/date are allowed (no uniqueness).
   * (Not called in Phase 3.)
   */
  async createEntry(
    input: CreateTaskTrackerEntryInput,
    actor: string,
  ): Promise<TaskTrackerEntryDoc> {
    const result = validateCreateTaskTrackerEntryInput(input);
    if (!result.ok) throw new TaskTrackerValidationError(result.errors);
    return this.repo.create(toTaskTrackerEntryFields(input), actor);
  }

  /** Fetch a single entry by id. */
  async getById(id: string): Promise<WithId<TaskTrackerEntryDoc> | null> {
    return this.repo.findById(id);
  }

  /** List an employee's entries, newest first, optionally within a date range. */
  async listByEmployee(
    employeeKey: string,
    opts?: ListEntriesOptions,
  ): Promise<WithId<TaskTrackerEntryDoc>[]> {
    return this.repo.listByEmployee(employeeKey, opts);
  }

  /** List entries across the company within a date range. */
  async listByDateRange(opts: ListEntriesOptions): Promise<WithId<TaskTrackerEntryDoc>[]> {
    return this.repo.listByDateRange(opts);
  }

  /** Full-text search over entries. */
  async searchEntries(query: string): Promise<WithId<TaskTrackerEntryDoc>[]> {
    return this.repo.search(query);
  }

  /** Update mutable fields of an entry using optimistic concurrency. */
  async updateEntry(
    id: string,
    expectedVersion: number,
    changes: UpdateTaskTrackerEntryInput,
    actor: string,
  ): Promise<TaskTrackerEntryDoc> {
    const current = await this.repo.findById(id);
    if (!current) throw new TaskTrackerNotFoundError(id);
    const updated = await this.repo.updateById(id, expectedVersion, changes, actor);
    if (!updated) throw new TaskTrackerConflictError(id);
    return updated;
  }

  /** Soft-delete an entry. */
  async deleteEntry(id: string, actor: string): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new TaskTrackerNotFoundError(id);
    return this.repo.softDelete(id, actor);
  }
}
