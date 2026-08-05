// Attachment repository — data access for GovernanceDB.attachments.
// Extends BaseRepository. Phase 6 defines these methods; nothing invokes them yet.

import { ObjectId } from 'mongodb';
import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { AttachmentDoc } from '@/src/models/attachment.model';

export class AttachmentRepository extends BaseRepository<AttachmentDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.ATTACHMENTS, options);
  }

  /** All attachments for a given entity (polymorphic target). */
  async listByTarget(
    targetCollection: string,
    targetId: string | ObjectId,
  ): Promise<WithId<AttachmentDoc>[]> {
    const id = typeof targetId === 'string' && ObjectId.isValid(targetId)
      ? new ObjectId(targetId)
      : targetId;
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ 'target.collection': targetCollection, 'target.id': id } as Filter<AttachmentDoc>))
      .sort({ createdAt: -1 })
      .toArray();
  }

  /** Find attachments sharing a content checksum (duplicate detection). */
  async findByChecksum(checksum: string): Promise<WithId<AttachmentDoc>[]> {
    const col = await this.collection();
    return col.find(this.scopedFilter({ checksum } as Filter<AttachmentDoc>)).toArray();
  }
}
