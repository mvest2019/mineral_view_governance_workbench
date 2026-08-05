// Source Material repository — data access for GovernanceDB.sourceMaterials.
//
// Extends BaseRepository, inheriting companyKey injection, audit stamping,
// soft-delete filtering, and optimistic concurrency. Isolated to its own
// collection; touches nothing else.

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { SourceMaterialDoc } from '@/src/models/source_material.model';

export class SourceMaterialRepository extends BaseRepository<SourceMaterialDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.SOURCE_MATERIALS, options);
  }

  /** Most recently uploaded source materials for the company (newest first). */
  async listRecent(limit = 50): Promise<WithId<SourceMaterialDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({} as Filter<SourceMaterialDoc>))
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .toArray();
  }

  /** Source materials uploaded for one employee (newest first). */
  async listByEmployee(employeeKey: string, limit = 50): Promise<WithId<SourceMaterialDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ employeeKey } as Filter<SourceMaterialDoc>))
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .toArray();
  }
}
