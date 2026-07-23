// Priority Question service — business logic for the Priority Questions module.
//
// Phase 4 IMPORTANT: defined but NOT wired to any API route and NOT invoked by
// any existing application code. No records are inserted and no GitHub data is
// migrated.

import { PriorityQuestionRepository } from '@/src/repositories/priorityQuestion.repository';
import {
  toPriorityQuestionFields,
  validateCreatePriorityQuestionInput,
  type CreatePriorityQuestionInput,
  type PriorityQuestionDoc,
  type UpdatePriorityQuestionInput,
} from '@/src/models/priorityQuestion.model';
import type { Priority, QuestionStatus } from '@/src/constants/enums';
import type { WithId } from 'mongodb';

export class PriorityQuestionValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid priority question: ${errors.join('; ')}`);
    this.name = 'PriorityQuestionValidationError';
    this.errors = errors;
  }
}

export class PriorityQuestionConflictError extends Error {
  constructor(questionCode: string) {
    super(`A priority question with code "${questionCode}" already exists.`);
    this.name = 'PriorityQuestionConflictError';
  }
}

export class PriorityQuestionNotFoundError extends Error {
  constructor(questionCode: string) {
    super(`No priority question found for code "${questionCode}".`);
    this.name = 'PriorityQuestionNotFoundError';
  }
}

export class PriorityQuestionService {
  private readonly repo: PriorityQuestionRepository;

  constructor(repo?: PriorityQuestionRepository) {
    this.repo = repo ?? new PriorityQuestionRepository();
  }

  /**
   * Create a question: validate, enforce code uniqueness, apply defaults, and
   * persist with an audit envelope. (Not called in Phase 4.)
   */
  async createQuestion(
    input: CreatePriorityQuestionInput,
    actor: string,
  ): Promise<PriorityQuestionDoc> {
    const result = validateCreatePriorityQuestionInput(input);
    if (!result.ok) throw new PriorityQuestionValidationError(result.errors);
    if (await this.repo.existsByCode(input.questionCode)) {
      throw new PriorityQuestionConflictError(input.questionCode);
    }
    return this.repo.create(toPriorityQuestionFields(input), actor);
  }

  /** Fetch a question by code. */
  async getByCode(questionCode: string): Promise<WithId<PriorityQuestionDoc> | null> {
    return this.repo.findByCode(questionCode);
  }

  /** List questions for an employee, optionally filtered by status. */
  async listForEmployee(
    targetEmployeeKey: string,
    status?: QuestionStatus,
  ): Promise<WithId<PriorityQuestionDoc>[]> {
    return this.repo.listForEmployee(targetEmployeeKey, status);
  }

  /** Priority-sorted queue. */
  async listByPriority(priority?: Priority): Promise<WithId<PriorityQuestionDoc>[]> {
    return this.repo.listByPriority(priority);
  }

  /** Full-text search over questions. */
  async searchQuestions(query: string): Promise<WithId<PriorityQuestionDoc>[]> {
    return this.repo.search(query);
  }

  /** Update mutable fields using optimistic concurrency. */
  async updateQuestion(
    questionCode: string,
    expectedVersion: number,
    changes: UpdatePriorityQuestionInput,
    actor: string,
  ): Promise<PriorityQuestionDoc> {
    const current = await this.repo.findByCode(questionCode);
    if (!current) throw new PriorityQuestionNotFoundError(questionCode);
    const updated = await this.repo.updateById(current._id, expectedVersion, changes, actor);
    if (!updated) throw new PriorityQuestionConflictError(questionCode);
    return updated;
  }

  /** Soft-delete a question. */
  async deleteQuestion(questionCode: string, actor: string): Promise<boolean> {
    const current = await this.repo.findByCode(questionCode);
    if (!current) throw new PriorityQuestionNotFoundError(questionCode);
    return this.repo.softDelete(current._id, actor);
  }
}
