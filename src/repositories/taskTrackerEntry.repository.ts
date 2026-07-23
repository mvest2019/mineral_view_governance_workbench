// Task Tracker repository — data access for GovernanceDB.taskTrackerEntries.
//
// Extends BaseRepository (companyKey injection, audit stamping, soft-delete
// filtering, optimistic concurrency) and adds the entry-specific queries from
// the V1 spec's access patterns.
//
// Phase 3 defines these methods; nothing invokes them yet (no app reads/writes).

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { TaskTrackerEntryDoc } from '@/src/models/taskTrackerEntry.model';

export interface ListEntriesOptions {
  from?: Date;
  to?: Date;
  limit?: number;
}

export class TaskTrackerEntryRepository extends BaseRepository<TaskTrackerEntryDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.TASK_TRACKER_ENTRIES, options);
  }

  private dateRange(opts?: ListEntriesOptions): Filter<TaskTrackerEntryDoc> {
    if (!opts?.from && !opts?.to) return {} as Filter<TaskTrackerEntryDoc>;
    const range: Record<string, Date> = {};
    if (opts.from) range.$gte = opts.from;
    if (opts.to) range.$lte = opts.to;
    return { entryDate: range } as unknown as Filter<TaskTrackerEntryDoc>;
  }

  /** List an employee's entries, newest first, optionally within a date range. */
  async listByEmployee(
    employeeKey: string,
    opts?: ListEntriesOptions,
  ): Promise<WithId<TaskTrackerEntryDoc>[]> {
    const col = await this.collection();
    const cursor = col
      .find(this.scopedFilter({ employeeKey, ...this.dateRange(opts) } as Filter<TaskTrackerEntryDoc>))
      .sort({ entryDate: -1 });
    if (opts?.limit) cursor.limit(opts.limit);
    return cursor.toArray();
  }

  /** List entries across the company within a date range, newest first. */
  async listByDateRange(opts: ListEntriesOptions): Promise<WithId<TaskTrackerEntryDoc>[]> {
    const col = await this.collection();
    const cursor = col
      .find(this.scopedFilter(this.dateRange(opts)))
      .sort({ entryDate: -1 });
    if (opts.limit) cursor.limit(opts.limit);
    return cursor.toArray();
  }

  /** Company-scoped full-text search over the entry body and title. */
  async search(query: string, limit = 25): Promise<WithId<TaskTrackerEntryDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ $text: { $search: query } } as Filter<TaskTrackerEntryDoc>))
      .limit(limit)
      .toArray();
  }
}
