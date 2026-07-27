// Audit Log repository — data access for GovernanceDB.auditLogs (append-only).
// Extends BaseRepository for envelope stamping, but intentionally exposes only
// append + read methods (no update/delete). Phase 6 defines these methods;
// nothing invokes them yet.

import { ObjectId } from 'mongodb';
import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { AuditLogDoc } from '@/src/models/auditLog.model';
import type { AuditCategory } from '@/src/constants/enums';

export class AuditLogRepository extends BaseRepository<AuditLogDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.AUDIT_LOGS, options);
  }

  /** Global forensic timeline, newest first. */
  async listRecent(limit = 100): Promise<WithId<AuditLogDoc>[]> {
    const col = await this.collection();
    return col.find(this.scopedFilter()).sort({ at: -1 }).limit(limit).toArray();
  }

  /** Activity/audit for a specific entity. */
  async listByTarget(
    targetCollection: string,
    targetId: string | ObjectId,
  ): Promise<WithId<AuditLogDoc>[]> {
    const id = typeof targetId === 'string' && ObjectId.isValid(targetId)
      ? new ObjectId(targetId)
      : targetId;
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ 'target.collection': targetCollection, 'target.id': id } as Filter<AuditLogDoc>))
      .sort({ at: -1 })
      .toArray();
  }

  /** Everything a given actor did. */
  async listByActor(actorKey: string, limit = 100): Promise<WithId<AuditLogDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ actorKey } as Filter<AuditLogDoc>))
      .sort({ at: -1 })
      .limit(limit)
      .toArray();
  }

  /** Filter the SECURITY vs ACTIVITY stream. */
  async listByCategory(category: AuditCategory, limit = 100): Promise<WithId<AuditLogDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ category } as Filter<AuditLogDoc>))
      .sort({ at: -1 })
      .limit(limit)
      .toArray();
  }
}
