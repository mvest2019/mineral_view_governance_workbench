// Role service — business logic for the Roles module.
// Phase 6: defined but NOT wired to any API route or existing app code. No data
// inserted. Constructing it opens no connection; all I/O is inside uncalled methods.

import { RoleRepository } from '@/src/repositories/role.repository';
import {
  toRoleFields,
  validateCreateRoleInput,
  type CreateRoleInput,
  type RoleDoc,
  type UpdateRoleInput,
} from '@/src/models/role.model';
import type { WithId } from 'mongodb';

export class RoleValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid role: ${errors.join('; ')}`); this.name = 'RoleValidationError'; this.errors = errors; }
}
export class RoleConflictError extends Error {
  constructor(key: string) { super(`A role with key "${key}" already exists.`); this.name = 'RoleConflictError'; }
}
export class RoleNotFoundError extends Error {
  constructor(key: string) { super(`No role found for key "${key}".`); this.name = 'RoleNotFoundError'; }
}

export class RoleService {
  private readonly repo: RoleRepository;
  constructor(repo?: RoleRepository) { this.repo = repo ?? new RoleRepository(); }

  async createRole(input: CreateRoleInput, actor: string): Promise<RoleDoc> {
    const result = validateCreateRoleInput(input);
    if (!result.ok) throw new RoleValidationError(result.errors);
    if (await this.repo.existsByKey(input.key)) throw new RoleConflictError(input.key);
    return this.repo.create(toRoleFields(input), actor);
  }

  async getByKey(key: string): Promise<WithId<RoleDoc> | null> { return this.repo.findByKey(key); }
  async listRoles(): Promise<WithId<RoleDoc>[]> { return this.repo.list(); }

  async updateRole(key: string, expectedVersion: number, changes: UpdateRoleInput, actor: string): Promise<RoleDoc> {
    const current = await this.repo.findByKey(key);
    if (!current) throw new RoleNotFoundError(key);
    const updated = await this.repo.updateById(current._id, expectedVersion, changes, actor);
    if (!updated) throw new RoleConflictError(key);
    return updated;
  }

  async deleteRole(key: string, actor: string): Promise<boolean> {
    const current = await this.repo.findByKey(key);
    if (!current) throw new RoleNotFoundError(key);
    return this.repo.softDelete(current._id, actor);
  }
}
