// Repo Question repository — data access for GovernanceDB.repoQuestions.
// Extends BaseRepository. Phase 6 defines these methods; nothing invokes them yet.

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { RepoQuestionDoc } from '@/src/models/repoQuestion.model';
import type { Priority } from '@/src/constants/enums';

export class RepoQuestionRepository extends BaseRepository<RepoQuestionDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.REPO_QUESTIONS, options);
  }

  async findByCode(questionCode: string): Promise<WithId<RepoQuestionDoc> | null> {
    return this.findOne({ questionCode } as Filter<RepoQuestionDoc>);
  }

  async existsByCode(questionCode: string): Promise<boolean> {
    return (await this.count({ questionCode } as Filter<RepoQuestionDoc>)) > 0;
  }

  async listByRepo(repoName: string): Promise<WithId<RepoQuestionDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ repoName } as Filter<RepoQuestionDoc>))
      .sort({ priority: 1, updatedAt: -1 })
      .toArray();
  }

  async listByPriority(priority?: Priority): Promise<WithId<RepoQuestionDoc>[]> {
    const filter: Record<string, unknown> = {};
    if (priority) filter.priority = priority;
    const col = await this.collection();
    return col
      .find(this.scopedFilter(filter as Filter<RepoQuestionDoc>))
      .sort({ priority: 1, updatedAt: -1 })
      .toArray();
  }

  async search(query: string, limit = 25): Promise<WithId<RepoQuestionDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ $text: { $search: query } } as Filter<RepoQuestionDoc>))
      .limit(limit)
      .toArray();
  }
}
