// Employee repository — data access for GovernanceDB.employees.
//
// Extends BaseRepository, inheriting companyKey injection, audit stamping,
// soft-delete filtering, and optimistic-concurrency updates. Adds only the
// employee-specific queries from the V1 spec's access patterns.
//
// Phase 2 defines these methods; nothing invokes them yet (no app reads/writes).
// Building a query does nothing until it is executed by a caller.

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { EmployeeDoc } from '@/src/models/employee.model';
import type { EntityStatus } from '@/src/constants/enums';

export class EmployeeRepository extends BaseRepository<EmployeeDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.EMPLOYEES, options);
  }

  /** Find a live employee by canonical member key (or one of its aliases). */
  async findByMemberKey(memberKey: string): Promise<WithId<EmployeeDoc> | null> {
    return this.findOne({
      $or: [{ memberKey }, { aliases: memberKey }],
    } as Filter<EmployeeDoc>);
  }

  /** True if a live employee already uses this member key. */
  async existsByMemberKey(memberKey: string): Promise<boolean> {
    return (await this.count({ memberKey } as Filter<EmployeeDoc>)) > 0;
  }

  /** List live employees in a department. */
  async listByDepartment(departmentKey: string): Promise<WithId<EmployeeDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ departmentKeys: departmentKey } as Filter<EmployeeDoc>))
      .sort({ fullName: 1 })
      .toArray();
  }

  /** List live employees by lifecycle status (defaults to ACTIVE). */
  async listByStatus(status: EntityStatus = 'ACTIVE'): Promise<WithId<EmployeeDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ status } as Filter<EmployeeDoc>))
      .sort({ fullName: 1 })
      .toArray();
  }

  /** Company-scoped full-text search over name/title/purpose. */
  async search(query: string, limit = 25): Promise<WithId<EmployeeDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ $text: { $search: query } } as Filter<EmployeeDoc>))
      .limit(limit)
      .toArray();
  }
}
