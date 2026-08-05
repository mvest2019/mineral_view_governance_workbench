// AI Run service — business logic for the AI Runs module.
// Phase 6: defined but NOT wired to any API route or existing app code. No data inserted.

import { AiRunRepository } from '@/src/repositories/aiRun.repository';
import {
  toAiRunFields,
  validateCreateAiRunInput,
  type CreateAiRunInput,
  type AiRunDoc,
} from '@/src/models/aiRun.model';
import type { AiEngine, AiStatus } from '@/src/constants/enums';
import type { ObjectId, WithId } from 'mongodb';

export class AiRunValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid AI run: ${errors.join('; ')}`); this.name = 'AiRunValidationError'; this.errors = errors; }
}
export class AiRunNotFoundError extends Error {
  constructor(id: string) { super(`No AI run found for id "${id}".`); this.name = 'AiRunNotFoundError'; }
}

export class AiRunService {
  private readonly repo: AiRunRepository;
  constructor(repo?: AiRunRepository) { this.repo = repo ?? new AiRunRepository(); }

  /** Record an AI invocation (validate + persist). (Not called in Phase 6.) */
  async recordRun(input: CreateAiRunInput, actor: string): Promise<AiRunDoc> {
    const result = validateCreateAiRunInput(input);
    if (!result.ok) throw new AiRunValidationError(result.errors);
    return this.repo.create(toAiRunFields(input), actor);
  }

  async getById(id: string): Promise<WithId<AiRunDoc> | null> { return this.repo.findById(id); }

  async listBySubject(subjectCollection: string, subjectId: string | ObjectId): Promise<WithId<AiRunDoc>[]> {
    return this.repo.listBySubject(subjectCollection, subjectId);
  }

  async listByEngineStatus(engine: AiEngine, status: AiStatus): Promise<WithId<AiRunDoc>[]> {
    return this.repo.listByEngineStatus(engine, status);
  }

  async recentRuns(limit?: number): Promise<WithId<AiRunDoc>[]> { return this.repo.recent(limit); }

  /** Record the terminal state of a run. */
  async completeRun(
    id: string,
    status: AiStatus,
    patch: { outputText?: string; outputStorageRef?: object; errorText?: string },
    actor: string,
  ): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new AiRunNotFoundError(id);
    return this.repo.complete(id, status, patch, actor);
  }
}
