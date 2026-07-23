// Finding service — business logic for the Findings module.
// Phase 6: defined but NOT wired to any API route or existing app code. No data inserted.

import { FindingRepository } from '@/src/repositories/finding.repository';
import {
  toFindingFields,
  validateCreateFindingInput,
  type CreateFindingInput,
  type FindingDoc,
  type UpdateFindingInput,
} from '@/src/models/finding.model';
import type { FindingDecision } from '@/src/constants/enums';
import type { WithId } from 'mongodb';

export class FindingValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid finding: ${errors.join('; ')}`); this.name = 'FindingValidationError'; this.errors = errors; }
}
export class FindingConflictError extends Error {
  constructor(code: string) { super(`A finding with code "${code}" already exists.`); this.name = 'FindingConflictError'; }
}
export class FindingNotFoundError extends Error {
  constructor(code: string) { super(`No finding found for code "${code}".`); this.name = 'FindingNotFoundError'; }
}

export class FindingService {
  private readonly repo: FindingRepository;
  constructor(repo?: FindingRepository) { this.repo = repo ?? new FindingRepository(); }

  async createFinding(input: CreateFindingInput, actor: string): Promise<FindingDoc> {
    const result = validateCreateFindingInput(input);
    if (!result.ok) throw new FindingValidationError(result.errors);
    if (await this.repo.existsByCode(input.findingCode)) throw new FindingConflictError(input.findingCode);
    return this.repo.create(toFindingFields(input), actor);
  }

  async getByCode(findingCode: string): Promise<WithId<FindingDoc> | null> { return this.repo.findByCode(findingCode); }
  async listByRepo(repoName: string): Promise<WithId<FindingDoc>[]> { return this.repo.listByRepo(repoName); }
  async listByDecision(decision: FindingDecision): Promise<WithId<FindingDoc>[]> { return this.repo.listByDecision(decision); }

  /** Record a review decision on a finding. */
  async reviewFinding(
    findingCode: string,
    expectedVersion: number,
    decision: FindingDecision,
    reviewerKey: string,
    reviewNote: string | undefined,
    actor: string,
  ): Promise<FindingDoc> {
    const current = await this.repo.findByCode(findingCode);
    if (!current) throw new FindingNotFoundError(findingCode);
    const updated = await this.repo.updateById(current._id, expectedVersion, {
      decision, reviewerKey, reviewNote, reviewedAt: new Date(),
    } as UpdateFindingInput, actor);
    if (!updated) throw new FindingConflictError(findingCode);
    return updated;
  }

  async deleteFinding(findingCode: string, actor: string): Promise<boolean> {
    const current = await this.repo.findByCode(findingCode);
    if (!current) throw new FindingNotFoundError(findingCode);
    return this.repo.softDelete(current._id, actor);
  }
}
