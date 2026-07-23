// Question Assignment repository — data access for
// GovernanceDB.questionAssignments. Extends BaseRepository.
// Phase 6 defines these methods; nothing invokes them yet.

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { QuestionAssignmentDoc } from '@/src/models/questionAssignment.model';

export class QuestionAssignmentRepository extends BaseRepository<QuestionAssignmentDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.QUESTION_ASSIGNMENTS, options);
  }

  async findByQuestion(questionCode: string): Promise<WithId<QuestionAssignmentDoc> | null> {
    return this.findOne({ questionCode } as Filter<QuestionAssignmentDoc>);
  }

  async existsByQuestion(questionCode: string): Promise<boolean> {
    return (await this.count({ questionCode } as Filter<QuestionAssignmentDoc>)) > 0;
  }

  async listByAssignee(assigneeKey: string): Promise<WithId<QuestionAssignmentDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ assigneeKey } as Filter<QuestionAssignmentDoc>))
      .sort({ updatedAt: -1 })
      .toArray();
  }
}
