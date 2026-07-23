// Department repository — data access for GovernanceDB.departments.
// Extends BaseRepository. Phase 6 defines these methods; nothing invokes them yet.

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { DepartmentDoc } from '@/src/models/department.model';

export class DepartmentRepository extends BaseRepository<DepartmentDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.DEPARTMENTS, options);
  }

  async findByKey(key: string): Promise<WithId<DepartmentDoc> | null> {
    return this.findOne({ key } as Filter<DepartmentDoc>);
  }

  async existsByKey(key: string): Promise<boolean> {
    return (await this.count({ key } as Filter<DepartmentDoc>)) > 0;
  }

  async list(): Promise<WithId<DepartmentDoc>[]> {
    const col = await this.collection();
    return col.find(this.scopedFilter()).sort({ key: 1 }).toArray();
  }

  /** Sub-departments of a parent (hierarchy). */
  async listChildren(parentKey: string): Promise<WithId<DepartmentDoc>[]> {
    const col = await this.collection();
    return col.find(this.scopedFilter({ parentKey } as Filter<DepartmentDoc>)).toArray();
  }
}
