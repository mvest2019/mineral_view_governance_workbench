// Answer service — business logic for the Answers module.
//
// Coordinates the Answers repository with the Priority Questions repository to
// maintain the denormalized answerCount rollup (V1 spec §6.4).
//
// Phase 4 IMPORTANT: defined but NOT wired to any API route and NOT invoked by
// any existing application code. No records are inserted and no GitHub data is
// migrated.

import { AnswerRepository } from '@/src/repositories/answer.repository';
import { PriorityQuestionRepository } from '@/src/repositories/priorityQuestion.repository';
import {
  toAnswerFields,
  validateCreateAnswerInput,
  type AnswerDoc,
  type CreateAnswerInput,
} from '@/src/models/answer.model';
import type { QuestionKind } from '@/src/constants/enums';
import type { WithId } from 'mongodb';

export class AnswerValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid answer: ${errors.join('; ')}`);
    this.name = 'AnswerValidationError';
    this.errors = errors;
  }
}

export class AnswerNotFoundError extends Error {
  constructor(id: string) {
    super(`No answer found for id "${id}".`);
    this.name = 'AnswerNotFoundError';
  }
}

export class AnswerService {
  private readonly repo: AnswerRepository;
  private readonly questionRepo: PriorityQuestionRepository;

  constructor(repo?: AnswerRepository, questionRepo?: PriorityQuestionRepository) {
    this.repo = repo ?? new AnswerRepository();
    this.questionRepo = questionRepo ?? new PriorityQuestionRepository();
  }

  /**
   * Create an answer: validate, persist, and (for PRIORITY questions) bump the
   * question's answerCount rollup. (Not called in Phase 4.)
   */
  async createAnswer(input: CreateAnswerInput, actor: string): Promise<AnswerDoc> {
    const result = validateCreateAnswerInput(input);
    if (!result.ok) throw new AnswerValidationError(result.errors);

    const fields = toAnswerFields(input);
    const created = await this.repo.create(fields, actor);

    if (fields.questionKind === 'PRIORITY') {
      // Best-effort rollup; safe no-op if the question is absent.
      await this.questionRepo.incrementAnswerCount(fields.questionCode, 1, actor);
    }
    return created;
  }

  /** List a question's answers, newest first. */
  async listByQuestion(
    questionCode: string,
    questionKind?: QuestionKind,
  ): Promise<WithId<AnswerDoc>[]> {
    return this.repo.listByQuestion(questionCode, questionKind);
  }

  /** List all answers by an employee. */
  async listByAuthor(answeredByKey: string): Promise<WithId<AnswerDoc>[]> {
    return this.repo.listByAuthor(answeredByKey);
  }

  /** Accept an answer. */
  async acceptAnswer(id: string, acceptedByKey: string, actor: string): Promise<AnswerDoc> {
    const accepted = await this.repo.accept(id, acceptedByKey, actor);
    if (!accepted) throw new AnswerNotFoundError(id);
    return accepted;
  }

  /** Soft-delete an answer and decrement the question's rollup for PRIORITY. */
  async deleteAnswer(id: string, actor: string): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new AnswerNotFoundError(id);
    const ok = await this.repo.softDelete(id, actor);
    if (ok && current.questionKind === 'PRIORITY') {
      await this.questionRepo.incrementAnswerCount(current.questionCode, -1, actor);
    }
    return ok;
  }
}
