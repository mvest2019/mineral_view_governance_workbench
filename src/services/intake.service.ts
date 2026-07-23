// Intake service — business logic for the Intakes module.
// Phase 6: defined but NOT wired to any API route or existing app code. No data inserted.

import { IntakeRepository } from '@/src/repositories/intake.repository';
import {
  toIntakeFields,
  validateCreateIntakeInput,
  type CreateIntakeInput,
  type IntakeDoc,
} from '@/src/models/intake.model';
import type { ApprovalStatus } from '@/src/constants/enums';
import type { WithId } from 'mongodb';

export class IntakeValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid intake: ${errors.join('; ')}`); this.name = 'IntakeValidationError'; this.errors = errors; }
}
export class IntakeNotFoundError extends Error {
  constructor(id: string) { super(`No intake found for id "${id}".`); this.name = 'IntakeNotFoundError'; }
}

export class IntakeService {
  private readonly repo: IntakeRepository;
  constructor(repo?: IntakeRepository) { this.repo = repo ?? new IntakeRepository(); }

  async createIntake(input: CreateIntakeInput, actor: string): Promise<IntakeDoc> {
    const result = validateCreateIntakeInput(input);
    if (!result.ok) throw new IntakeValidationError(result.errors);
    return this.repo.create(toIntakeFields(input), actor);
  }

  async getById(id: string): Promise<WithId<IntakeDoc> | null> { return this.repo.findById(id); }
  async listByStage(stage: string): Promise<WithId<IntakeDoc>[]> { return this.repo.listByStage(stage); }
  async listByEmployee(employeeKey: string): Promise<WithId<IntakeDoc>[]> { return this.repo.listByEmployee(employeeKey); }

  async advanceStage(id: string, stage: string, actor: string, note?: string): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new IntakeNotFoundError(id);
    return this.repo.advanceStage(id, stage, actor, note);
  }

  async setGate(id: string, gateName: string, status: ApprovalStatus, approverKey: string | undefined, actor: string): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new IntakeNotFoundError(id);
    return this.repo.setGateStatus(id, gateName, status, approverKey, actor);
  }

  async deleteIntake(id: string, actor: string): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new IntakeNotFoundError(id);
    return this.repo.softDelete(id, actor);
  }
}
