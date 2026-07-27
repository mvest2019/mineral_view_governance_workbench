// Finding repository — data access for GovernanceDB.findings.
// Extends BaseRepository. Phase 6 defines these methods; nothing invokes them yet.

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { FindingDoc } from '@/src/models/finding.model';
import type { FindingDecision } from '@/src/constants/enums';

export class FindingRepository extends BaseRepository<FindingDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.FINDINGS, options);
  }

  async findByCode(findingCode: string): Promise<WithId<FindingDoc> | null> {
    return this.findOne({ findingCode } as Filter<FindingDoc>);
  }

  async existsByCode(findingCode: string): Promise<boolean> {
    return (await this.count({ findingCode } as Filter<FindingDoc>)) > 0;
  }

  async listByRepo(repoName: string): Promise<WithId<FindingDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ repoName } as Filter<FindingDoc>))
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async listByDecision(decision: FindingDecision): Promise<WithId<FindingDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ decision } as Filter<FindingDoc>))
      .sort({ updatedAt: -1 })
      .toArray();
  }
}
