// Repo Question service — business logic for the Repo Questions module.
// Phase 6: defined but NOT wired to any API route or existing app code. No data inserted.

import { RepoQuestionRepository } from '@/src/repositories/repoQuestion.repository';
import {
  toRepoQuestionFields,
  validateCreateRepoQuestionInput,
  type CreateRepoQuestionInput,
  type RepoQuestionDoc,
  type UpdateRepoQuestionInput,
} from '@/src/models/repoQuestion.model';
import type { Priority } from '@/src/constants/enums';
import type { WithId } from 'mongodb';

export class RepoQuestionValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid repo question: ${errors.join('; ')}`); this.name = 'RepoQuestionValidationError'; this.errors = errors; }
}
export class RepoQuestionConflictError extends Error {
  constructor(code: string) { super(`A repo question with code "${code}" already exists.`); this.name = 'RepoQuestionConflictError'; }
}
export class RepoQuestionNotFoundError extends Error {
  constructor(code: string) { super(`No repo question found for code "${code}".`); this.name = 'RepoQuestionNotFoundError'; }
}

export class RepoQuestionService {
  private readonly repo: RepoQuestionRepository;
  constructor(repo?: RepoQuestionRepository) { this.repo = repo ?? new RepoQuestionRepository(); }

  async createQuestion(input: CreateRepoQuestionInput, actor: string): Promise<RepoQuestionDoc> {
    const result = validateCreateRepoQuestionInput(input);
    if (!result.ok) throw new RepoQuestionValidationError(result.errors);
    if (await this.repo.existsByCode(input.questionCode)) throw new RepoQuestionConflictError(input.questionCode);
    return this.repo.create(toRepoQuestionFields(input), actor);
  }

  async getByCode(questionCode: string): Promise<WithId<RepoQuestionDoc> | null> { return this.repo.findByCode(questionCode); }
  async listByRepo(repoName: string): Promise<WithId<RepoQuestionDoc>[]> { return this.repo.listByRepo(repoName); }
  async listByPriority(priority?: Priority): Promise<WithId<RepoQuestionDoc>[]> { return this.repo.listByPriority(priority); }
  async searchQuestions(query: string): Promise<WithId<RepoQuestionDoc>[]> { return this.repo.search(query); }

  async updateQuestion(questionCode: string, expectedVersion: number, changes: UpdateRepoQuestionInput, actor: string): Promise<RepoQuestionDoc> {
    const current = await this.repo.findByCode(questionCode);
    if (!current) throw new RepoQuestionNotFoundError(questionCode);
    const updated = await this.repo.updateById(current._id, expectedVersion, changes, actor);
    if (!updated) throw new RepoQuestionConflictError(questionCode);
    return updated;
  }

  async deleteQuestion(questionCode: string, actor: string): Promise<boolean> {
    const current = await this.repo.findByCode(questionCode);
    if (!current) throw new RepoQuestionNotFoundError(questionCode);
    return this.repo.softDelete(current._id, actor);
  }
}
