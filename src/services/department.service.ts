// Department service — business logic for the Departments module.
// Phase 6: defined but NOT wired to any API route or existing app code. No data inserted.

import { DepartmentRepository } from '@/src/repositories/department.repository';
import {
  toDepartmentFields,
  validateCreateDepartmentInput,
  type CreateDepartmentInput,
  type DepartmentDoc,
  type UpdateDepartmentInput,
} from '@/src/models/department.model';
import type { WithId } from 'mongodb';

export class DepartmentValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid department: ${errors.join('; ')}`); this.name = 'DepartmentValidationError'; this.errors = errors; }
}
export class DepartmentConflictError extends Error {
  constructor(key: string) { super(`A department with key "${key}" already exists.`); this.name = 'DepartmentConflictError'; }
}
export class DepartmentNotFoundError extends Error {
  constructor(key: string) { super(`No department found for key "${key}".`); this.name = 'DepartmentNotFoundError'; }
}

export class DepartmentService {
  private readonly repo: DepartmentRepository;
  constructor(repo?: DepartmentRepository) { this.repo = repo ?? new DepartmentRepository(); }

  async createDepartment(input: CreateDepartmentInput, actor: string): Promise<DepartmentDoc> {
    const result = validateCreateDepartmentInput(input);
    if (!result.ok) throw new DepartmentValidationError(result.errors);
    if (await this.repo.existsByKey(input.key)) throw new DepartmentConflictError(input.key);
    return this.repo.create(toDepartmentFields(input), actor);
  }

  async getByKey(key: string): Promise<WithId<DepartmentDoc> | null> { return this.repo.findByKey(key); }
  async listDepartments(): Promise<WithId<DepartmentDoc>[]> { return this.repo.list(); }
  async listChildren(parentKey: string): Promise<WithId<DepartmentDoc>[]> { return this.repo.listChildren(parentKey); }

  async updateDepartment(key: string, expectedVersion: number, changes: UpdateDepartmentInput, actor: string): Promise<DepartmentDoc> {
    const current = await this.repo.findByKey(key);
    if (!current) throw new DepartmentNotFoundError(key);
    const updated = await this.repo.updateById(current._id, expectedVersion, changes, actor);
    if (!updated) throw new DepartmentConflictError(key);
    return updated;
  }

  async deleteDepartment(key: string, actor: string): Promise<boolean> {
    const current = await this.repo.findByKey(key);
    if (!current) throw new DepartmentNotFoundError(key);
    return this.repo.softDelete(current._id, actor);
  }
}
