// Repository (code repo) service — business logic for the Repositories module.
// Phase 6: defined but NOT wired to any API route or existing app code. No data inserted.

import { RepositoryRepository } from '@/src/repositories/repository.repository';
import {
  toRepositoryFields,
  validateCreateRepositoryInput,
  validateClassification,
  type CreateRepositoryInput,
  type RepositoryDoc,
  type RepoClassification,
  type UpdateRepositoryInput,
} from '@/src/models/repository.model';
import type { RepoApprovalStatus } from '@/src/constants/enums';
import type { WithId } from 'mongodb';

export class RepositoryValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid repository: ${errors.join('; ')}`); this.name = 'RepositoryValidationError'; this.errors = errors; }
}
export class RepositoryConflictError extends Error {
  constructor(name: string) { super(`A repository named "${name}" already exists.`); this.name = 'RepositoryConflictError'; }
}
export class RepositoryNotFoundError extends Error {
  constructor(name: string) { super(`No repository found named "${name}".`); this.name = 'RepositoryNotFoundError'; }
}

export class RepositoryService {
  private readonly repo: RepositoryRepository;
  constructor(repo?: RepositoryRepository) { this.repo = repo ?? new RepositoryRepository(); }

  async createRepository(input: CreateRepositoryInput, actor: string): Promise<RepositoryDoc> {
    const result = validateCreateRepositoryInput(input);
    if (!result.ok) throw new RepositoryValidationError(result.errors);
    if (await this.repo.existsByName(input.name)) throw new RepositoryConflictError(input.name);
    return this.repo.create(toRepositoryFields(input), actor);
  }

  async getByName(name: string): Promise<WithId<RepositoryDoc> | null> { return this.repo.findByName(name); }
  async listRepositories(): Promise<WithId<RepositoryDoc>[]> { return this.repo.list(); }
  async listByApprovalStatus(status: RepoApprovalStatus): Promise<WithId<RepositoryDoc>[]> { return this.repo.listByApprovalStatus(status); }

  /** Set or replace the embedded classification of a repository. */
  async updateClassification(name: string, classification: RepoClassification, actor: string): Promise<boolean> {
    const errors: string[] = [];
    validateClassification(classification, errors);
    if (errors.length) throw new RepositoryValidationError(errors);
    const current = await this.repo.findByName(name);
    if (!current) throw new RepositoryNotFoundError(name);
    return this.repo.setClassification(name, { ...classification, approvalStatus: classification.approvalStatus ?? 'PENDING' }, actor);
  }

  async updateRepository(name: string, expectedVersion: number, changes: UpdateRepositoryInput, actor: string): Promise<RepositoryDoc> {
    const current = await this.repo.findByName(name);
    if (!current) throw new RepositoryNotFoundError(name);
    const updated = await this.repo.updateById(
      current._id,
      expectedVersion,
      changes as unknown as Partial<RepositoryDoc>,
      actor,
    );
    if (!updated) throw new RepositoryConflictError(name);
    return updated;
  }

  async deleteRepository(name: string, actor: string): Promise<boolean> {
    const current = await this.repo.findByName(name);
    if (!current) throw new RepositoryNotFoundError(name);
    return this.repo.softDelete(current._id, actor);
  }
}
