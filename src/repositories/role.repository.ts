// Role repository — data access for GovernanceDB.roles. Extends BaseRepository.
// Phase 6 defines these methods; nothing invokes them yet (no app reads/writes).

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { RoleDoc } from '@/src/models/role.model';

export class RoleRepository extends BaseRepository<RoleDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.ROLES, options);
  }

  async findByKey(key: string): Promise<WithId<RoleDoc> | null> {
    return this.findOne({ key } as Filter<RoleDoc>);
  }

  async existsByKey(key: string): Promise<boolean> {
    return (await this.count({ key } as Filter<RoleDoc>)) > 0;
  }

  async list(): Promise<WithId<RoleDoc>[]> {
    const col = await this.collection();
    return col.find(this.scopedFilter()).sort({ key: 1 }).toArray();
  }
}
