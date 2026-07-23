// Intake repository — data access for GovernanceDB.intakes.
// Extends BaseRepository. Files/links/gates/stageHistory are embedded and
// updated in place. Phase 6 defines these methods; nothing invokes them yet.

import { ObjectId } from 'mongodb';
import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import { auditedUpdate } from '@/src/models/base';
import type { IntakeDoc } from '@/src/models/intake.model';
import type { ApprovalStatus } from '@/src/constants/enums';

export class IntakeRepository extends BaseRepository<IntakeDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.INTAKES, options);
  }

  async listByStage(stage: string): Promise<WithId<IntakeDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ stage } as Filter<IntakeDoc>))
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async listByEmployee(employeeKey: string): Promise<WithId<IntakeDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ employeeKey } as Filter<IntakeDoc>))
      .sort({ updatedAt: -1 })
      .toArray();
  }

  /** Advance the stage and append a stage-history event (embedded). */
  async advanceStage(
    id: string | ObjectId,
    stage: string,
    actor: string,
    note?: string,
  ): Promise<boolean> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const audit = auditedUpdate({ actor });
    const col = await this.collection();
    const res = await col.updateOne(
      this.scopedFilter({ _id } as Filter<IntakeDoc>),
      {
        $set: { stage, ...audit.set },
        $push: { stageHistory: { stage, at: new Date(), actorKey: actor, note } },
        $inc: audit.inc,
      },
    );
    return res.modifiedCount === 1;
  }

  /** Update the status of a named embedded gate. */
  async setGateStatus(
    id: string | ObjectId,
    gateName: string,
    status: ApprovalStatus,
    approverKey: string | undefined,
    actor: string,
  ): Promise<boolean> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const audit = auditedUpdate({ actor });
    const col = await this.collection();
    const res = await col.updateOne(
      this.scopedFilter({ _id, 'gates.name': gateName } as Filter<IntakeDoc>),
      {
        $set: {
          'gates.$.status': status,
          'gates.$.approverKey': approverKey,
          'gates.$.decidedAt': new Date(),
          ...audit.set,
        },
        $inc: audit.inc,
      },
    );
    return res.modifiedCount === 1;
  }
}
