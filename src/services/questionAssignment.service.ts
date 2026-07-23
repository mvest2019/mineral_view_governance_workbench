// Question Assignment service — business logic for the Question Assignments module.
// Phase 6: defined but NOT wired to any API route or existing app code. No data inserted.

import { QuestionAssignmentRepository } from '@/src/repositories/questionAssignment.repository';
import {
  toQuestionAssignmentFields,
  validateCreateQuestionAssignmentInput,
  type CreateQuestionAssignmentInput,
  type QuestionAssignmentDoc,
} from '@/src/models/questionAssignment.model';
import type { WithId } from 'mongodb';

export class QuestionAssignmentValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid question assignment: ${errors.join('; ')}`); this.name = 'QuestionAssignmentValidationError'; this.errors = errors; }
}
export class QuestionAssignmentNotFoundError extends Error {
  constructor(questionCode: string) { super(`No assignment found for question "${questionCode}".`); this.name = 'QuestionAssignmentNotFoundError'; }
}

export class QuestionAssignmentService {
  private readonly repo: QuestionAssignmentRepository;
  constructor(repo?: QuestionAssignmentRepository) { this.repo = repo ?? new QuestionAssignmentRepository(); }

  /**
   * Assign (or reassign) a question to an owner. One assignment per questionCode,
   * so an existing assignment is updated in place. (Not called in Phase 6.)
   */
  async assignQuestion(input: CreateQuestionAssignmentInput, actor: string): Promise<QuestionAssignmentDoc> {
    const result = validateCreateQuestionAssignmentInput(input);
    if (!result.ok) throw new QuestionAssignmentValidationError(result.errors);
    const existing = await this.repo.findByQuestion(input.questionCode);
    const fields = toQuestionAssignmentFields(input);
    if (existing) {
      const updated = await this.repo.updateById(existing._id, existing.version, {
        assigneeKey: fields.assigneeKey,
        questionKind: fields.questionKind,
        note: fields.note,
      }, actor);
      return updated ?? existing;
    }
    return this.repo.create(fields, actor);
  }

  async getByQuestion(questionCode: string): Promise<WithId<QuestionAssignmentDoc> | null> {
    return this.repo.findByQuestion(questionCode);
  }

  async listByAssignee(assigneeKey: string): Promise<WithId<QuestionAssignmentDoc>[]> {
    return this.repo.listByAssignee(assigneeKey);
  }

  async unassign(questionCode: string, actor: string): Promise<boolean> {
    const current = await this.repo.findByQuestion(questionCode);
    if (!current) throw new QuestionAssignmentNotFoundError(questionCode);
    return this.repo.softDelete(current._id, actor);
  }
}
