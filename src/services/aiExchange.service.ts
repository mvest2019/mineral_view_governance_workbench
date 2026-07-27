// AI Exchange service — business logic for the AI Exchanges module.
// Phase 6: defined but NOT wired to any API route or existing app code. No data inserted.

import { AiExchangeRepository } from '@/src/repositories/aiExchange.repository';
import {
  toAiExchangeFields,
  validateCreateAiExchangeInput,
  type CreateAiExchangeInput,
  type AiExchangeDoc,
  type UpdateAiExchangeInput,
} from '@/src/models/aiExchange.model';
import type { ObjectId, WithId } from 'mongodb';

export class AiExchangeValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid AI exchange: ${errors.join('; ')}`); this.name = 'AiExchangeValidationError'; this.errors = errors; }
}
export class AiExchangeNotFoundError extends Error {
  constructor(id: string) { super(`No AI exchange found for id "${id}".`); this.name = 'AiExchangeNotFoundError'; }
}
export class AiExchangeConflictError extends Error {
  constructor(id: string) { super(`AI exchange "${id}" was modified concurrently.`); this.name = 'AiExchangeConflictError'; }
}

export class AiExchangeService {
  private readonly repo: AiExchangeRepository;
  constructor(repo?: AiExchangeRepository) { this.repo = repo ?? new AiExchangeRepository(); }

  async createExchange(input: CreateAiExchangeInput, actor: string): Promise<AiExchangeDoc> {
    const result = validateCreateAiExchangeInput(input);
    if (!result.ok) throw new AiExchangeValidationError(result.errors);
    return this.repo.create(toAiExchangeFields(input), actor);
  }

  async getById(id: string): Promise<WithId<AiExchangeDoc> | null> { return this.repo.findById(id); }
  async listByIntake(intakeId: string | ObjectId): Promise<WithId<AiExchangeDoc>[]> { return this.repo.listByIntake(intakeId); }
  async listByStatus(status: string): Promise<WithId<AiExchangeDoc>[]> { return this.repo.listByStatus(status); }

  async updateExchange(id: string, expectedVersion: number, changes: UpdateAiExchangeInput, actor: string): Promise<AiExchangeDoc> {
    const updated = await this.repo.updateById(
      id,
      expectedVersion,
      changes as unknown as Partial<AiExchangeDoc>,
      actor,
    );
    if (!updated) throw new AiExchangeConflictError(id);
    return updated;
  }

  async deleteExchange(id: string, actor: string): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new AiExchangeNotFoundError(id);
    return this.repo.softDelete(id, actor);
  }
}
