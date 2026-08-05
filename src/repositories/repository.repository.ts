// Repository (code repo) repository — data access for GovernanceDB.repositories.
// Extends BaseRepository. Classification is embedded and updated in place.
// Phase 6 defines these methods; nothing invokes them yet.

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import { auditedUpdate } from '@/src/models/base';
import type { RepositoryDoc, RepoClassification } from '@/src/models/repository.model';
import type { RepoApprovalStatus } from '@/src/constants/enums';

export class RepositoryRepository extends BaseRepository<RepositoryDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.REPOSITORIES, options);
  }

  async findByName(name: string): Promise<WithId<RepositoryDoc> | null> {
    return this.findOne({ name } as Filter<RepositoryDoc>);
  }

  async existsByName(name: string): Promise<boolean> {
    return (await this.count({ name } as Filter<RepositoryDoc>)) > 0;
  }

  async list(): Promise<WithId<RepositoryDoc>[]> {
    const col = await this.collection();
    return col.find(this.scopedFilter()).sort({ name: 1 }).toArray();
  }

  async listByApprovalStatus(approvalStatus: RepoApprovalStatus): Promise<WithId<RepositoryDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ 'classification.approvalStatus': approvalStatus } as Filter<RepositoryDoc>))
      .sort({ name: 1 })
      .toArray();
  }

  /** Replace the embedded classification on a repository. */
  async setClassification(
    name: string,
    classification: RepoClassification,
    actor: string,
  ): Promise<boolean> {
    const audit = auditedUpdate({ actor });
    const col = await this.collection();
    const res = await col.updateOne(
      this.scopedFilter({ name } as Filter<RepositoryDoc>),
      { $set: { classification: { ...classification, updatedAt: new Date() }, ...audit.set }, $inc: audit.inc },
    );
    return res.modifiedCount === 1;
  }
}
