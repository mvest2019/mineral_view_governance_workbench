// AI Exchange repository — data access for GovernanceDB.aiExchanges.
// Extends BaseRepository. Phase 6 defines these methods; nothing invokes them yet.

import { ObjectId } from 'mongodb';
import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { AiExchangeDoc } from '@/src/models/aiExchange.model';

export class AiExchangeRepository extends BaseRepository<AiExchangeDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.AI_EXCHANGES, options);
  }

  async listByIntake(intakeId: string | ObjectId): Promise<WithId<AiExchangeDoc>[]> {
    const _id = typeof intakeId === 'string' ? new ObjectId(intakeId) : intakeId;
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ intakeId: _id } as Filter<AiExchangeDoc>))
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async listByStatus(status: string): Promise<WithId<AiExchangeDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ status } as Filter<AiExchangeDoc>))
      .sort({ updatedAt: -1 })
      .toArray();
  }
}
