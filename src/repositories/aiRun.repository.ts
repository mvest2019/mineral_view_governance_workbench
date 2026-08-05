// AI Run repository — data access for GovernanceDB.aiRuns.
// Extends BaseRepository. Phase 6 defines these methods; nothing invokes them yet.

import { ObjectId } from 'mongodb';
import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import { auditedUpdate } from '@/src/models/base';
import type { AiRunDoc } from '@/src/models/aiRun.model';
import type { AiEngine, AiStatus } from '@/src/constants/enums';

export class AiRunRepository extends BaseRepository<AiRunDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.AI_RUNS, options);
  }

  /** All AI runs about a given subject entity, newest first. */
  async listBySubject(
    subjectCollection: string,
    subjectId: string | ObjectId,
  ): Promise<WithId<AiRunDoc>[]> {
    const id = typeof subjectId === 'string' && ObjectId.isValid(subjectId)
      ? new ObjectId(subjectId)
      : subjectId;
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ 'subject.collection': subjectCollection, 'subject.id': id } as Filter<AiRunDoc>))
      .sort({ startedAt: -1 })
      .toArray();
  }

  /** Filter by engine + status. */
  async listByEngineStatus(engine: AiEngine, status: AiStatus): Promise<WithId<AiRunDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ engine, status } as Filter<AiRunDoc>))
      .sort({ startedAt: -1 })
      .toArray();
  }

  /** Recent runs across the company. */
  async recent(limit = 50): Promise<WithId<AiRunDoc>[]> {
    const col = await this.collection();
    return col.find(this.scopedFilter()).sort({ startedAt: -1 }).limit(limit).toArray();
  }

  /** Record the terminal state of a run (status, output, completion time). */
  async complete(
    id: string | ObjectId,
    status: AiStatus,
    patch: { outputText?: string; outputStorageRef?: object; errorText?: string },
    actor: string,
  ): Promise<boolean> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const audit = auditedUpdate({ actor });
    const col = await this.collection();
    const res = await col.updateOne(
      this.scopedFilter({ _id } as Filter<AiRunDoc>),
      { $set: { status, completedAt: new Date(), ...patch, ...audit.set }, $inc: audit.inc },
    );
    return res.modifiedCount === 1;
  }
}
