// Priority Question repository — data access for GovernanceDB.priorityQuestions.
//
// Extends BaseRepository and adds the question-specific queries plus the
// answerCount rollup maintained by the Answers module.
//
// Phase 4 defines these methods; nothing invokes them yet (no app reads/writes).

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import { SYSTEM_ACTOR } from '@/src/models/base';
import type { PriorityQuestionDoc } from '@/src/models/priorityQuestion.model';
import type { Priority, QuestionStatus } from '@/src/constants/enums';

export class PriorityQuestionRepository extends BaseRepository<PriorityQuestionDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.PRIORITY_QUESTIONS, options);
  }

  /** Find a live question by its stable code. */
  async findByCode(questionCode: string): Promise<WithId<PriorityQuestionDoc> | null> {
    return this.findOne({ questionCode } as Filter<PriorityQuestionDoc>);
  }

  /** True if a live question already uses this code (dedupe support). */
  async existsByCode(questionCode: string): Promise<boolean> {
    return (await this.count({ questionCode } as Filter<PriorityQuestionDoc>)) > 0;
  }

  /** Find live questions with a matching normalized title (near-duplicate check). */
  async findByNormalizedTitle(normalizedTitle: string): Promise<WithId<PriorityQuestionDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ normalizedTitle } as Filter<PriorityQuestionDoc>))
      .toArray();
  }

  /** List questions for an employee, optionally filtered by status. */
  async listForEmployee(
    targetEmployeeKey: string,
    status?: QuestionStatus,
  ): Promise<WithId<PriorityQuestionDoc>[]> {
    const filter: Record<string, unknown> = { targetEmployeeKey };
    if (status) filter.status = status;
    const col = await this.collection();
    return col
      .find(this.scopedFilter(filter as Filter<PriorityQuestionDoc>))
      .sort({ priority: 1, updatedAt: -1 })
      .toArray();
  }

  /** Priority-sorted queue, most-recently-updated first. */
  async listByPriority(priority?: Priority): Promise<WithId<PriorityQuestionDoc>[]> {
    const filter: Record<string, unknown> = {};
    if (priority) filter.priority = priority;
    const col = await this.collection();
    return col
      .find(this.scopedFilter(filter as Filter<PriorityQuestionDoc>))
      .sort({ priority: 1, updatedAt: -1 })
      .toArray();
  }

  /** Company-scoped full-text search over question text. */
  async search(query: string, limit = 25): Promise<WithId<PriorityQuestionDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ $text: { $search: query } } as Filter<PriorityQuestionDoc>))
      .limit(limit)
      .toArray();
  }

  /**
   * Adjust a question's denormalized answerCount by `delta` (+1 on answer add,
   * -1 on answer removal), refreshing the audit envelope. Not version-guarded —
   * a counter increment is intentionally last-write-wins.
   */
  async incrementAnswerCount(
    questionCode: string,
    delta: number,
    actor: string = SYSTEM_ACTOR,
  ): Promise<boolean> {
    const col = await this.collection();
    const res = await col.updateOne(
      this.scopedFilter({ questionCode } as Filter<PriorityQuestionDoc>),
      {
        $inc: { answerCount: delta, version: 1 },
        $set: { updatedAt: new Date(), updatedBy: actor },
      },
    );
    return res.modifiedCount === 1;
  }
}
