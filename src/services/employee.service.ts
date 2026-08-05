// Employee service — business logic for the Employees module.
//
// Orchestrates the repository and enforces business rules (edge validation,
// uniqueness, defaults). This is the layer a future API route would call.
//
// Phase 2 IMPORTANT: this service is defined but NOT wired to any API route and
// NOT invoked by any existing application code. Constructing it opens no
// connection and reads/writes nothing — all I/O happens inside methods that
// nothing calls yet. No employee records are inserted in this phase.

import { EmployeeRepository } from '@/src/repositories/employee.repository';
import {
  toEmployeeFields,
  validateCreateEmployeeInput,
  type CreateEmployeeInput,
  type EmployeeDoc,
  type UpdateEmployeeInput,
} from '@/src/models/employee.model';
import type { EntityStatus } from '@/src/constants/enums';
import type { WithId } from 'mongodb';

/** Raised when input fails edge validation. */
export class EmployeeValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid employee input: ${errors.join('; ')}`);
    this.name = 'EmployeeValidationError';
    this.errors = errors;
  }
}

/** Raised when a member key already exists. */
export class EmployeeConflictError extends Error {
  constructor(memberKey: string) {
    super(`An employee with memberKey "${memberKey}" already exists.`);
    this.name = 'EmployeeConflictError';
  }
}

/** Raised when an expected employee is missing. */
export class EmployeeNotFoundError extends Error {
  constructor(memberKey: string) {
    super(`No employee found for memberKey "${memberKey}".`);
    this.name = 'EmployeeNotFoundError';
  }
}

export class EmployeeService {
  private readonly repo: EmployeeRepository;

  constructor(repo?: EmployeeRepository) {
    this.repo = repo ?? new EmployeeRepository();
  }

  /**
   * Create an employee: validate input, enforce memberKey uniqueness, apply
   * defaults, and persist with an audit envelope. (Not called in Phase 2.)
   */
  async createEmployee(input: CreateEmployeeInput, actor: string): Promise<EmployeeDoc> {
    const result = validateCreateEmployeeInput(input);
    if (!result.ok) throw new EmployeeValidationError(result.errors);

    if (await this.repo.existsByMemberKey(input.memberKey)) {
      throw new EmployeeConflictError(input.memberKey);
    }

    return this.repo.create(toEmployeeFields(input), actor);
  }

  /** Fetch a live employee by member key (or alias). */
  async getByMemberKey(memberKey: string): Promise<WithId<EmployeeDoc> | null> {
    return this.repo.findByMemberKey(memberKey);
  }

  /** List employees, optionally filtered by department or status. */
  async listEmployees(opts?: {
    departmentKey?: string;
    status?: EntityStatus;
  }): Promise<WithId<EmployeeDoc>[]> {
    if (opts?.departmentKey) return this.repo.listByDepartment(opts.departmentKey);
    return this.repo.listByStatus(opts?.status ?? 'ACTIVE');
  }

  /** Full-text search over employees. */
  async searchEmployees(query: string): Promise<WithId<EmployeeDoc>[]> {
    return this.repo.search(query);
  }

  /**
   * Update mutable fields of an employee using optimistic concurrency. Returns
   * the updated document, or throws if it was not found / version mismatched.
   */
  async updateEmployee(
    memberKey: string,
    expectedVersion: number,
    changes: UpdateEmployeeInput,
    actor: string,
  ): Promise<EmployeeDoc> {
    const current = await this.repo.findByMemberKey(memberKey);
    if (!current) throw new EmployeeNotFoundError(memberKey);

    const updated = await this.repo.updateById(current._id, expectedVersion, changes, actor);
    if (!updated) {
      // Version mismatch => concurrent modification (surface as a 409 upstream).
      throw new EmployeeConflictError(memberKey);
    }
    return updated;
  }

  /** Soft-delete (retire) an employee. */
  async deactivateEmployee(memberKey: string, actor: string): Promise<boolean> {
    const current = await this.repo.findByMemberKey(memberKey);
    if (!current) throw new EmployeeNotFoundError(memberKey);
    return this.repo.softDelete(current._id, actor);
  }
}
