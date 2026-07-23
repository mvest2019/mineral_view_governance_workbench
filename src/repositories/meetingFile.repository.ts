// Meeting File repository — data access for GovernanceDB.meetingFiles.
//
// Extends BaseRepository and adds file-specific queries.
//
// Phase 5 defines these methods; nothing invokes them yet (no app reads/writes).

import { ObjectId } from 'mongodb';
import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { MeetingFileDoc } from '@/src/models/meetingFile.model';

export class MeetingFileRepository extends BaseRepository<MeetingFileDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.MEETING_FILES, options);
  }

  /** List all files registered for a meeting, newest first. */
  async listByMeeting(meetingId: string | ObjectId): Promise<WithId<MeetingFileDoc>[]> {
    const _id = typeof meetingId === 'string' ? new ObjectId(meetingId) : meetingId;
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ meetingId: _id } as Filter<MeetingFileDoc>))
      .sort({ createdAt: -1 })
      .toArray();
  }
}
