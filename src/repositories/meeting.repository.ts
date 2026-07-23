// Meeting repository — data access for GovernanceDB.meetings.
//
// Extends BaseRepository and adds meeting-specific queries. Attendees and action
// items are embedded, so they are updated in place on the meeting document.
//
// Phase 5 defines these methods; nothing invokes them yet (no app reads/writes).

import { ObjectId } from 'mongodb';
import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import { auditedUpdate } from '@/src/models/base';
import type { MeetingDoc } from '@/src/models/meeting.model';

export interface MeetingRangeOptions {
  from?: Date;
  to?: Date;
  meetingType?: string;
  limit?: number;
}

export class MeetingRepository extends BaseRepository<MeetingDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.MEETINGS, options);
  }

  /** List meetings, newest first, optionally filtered by date range / type. */
  async list(opts?: MeetingRangeOptions): Promise<WithId<MeetingDoc>[]> {
    const filter: Record<string, unknown> = {};
    if (opts?.from || opts?.to) {
      const range: Record<string, Date> = {};
      if (opts.from) range.$gte = opts.from;
      if (opts.to) range.$lte = opts.to;
      filter.meetingAt = range;
    }
    if (opts?.meetingType) filter.meetingType = opts.meetingType;
    const col = await this.collection();
    const cursor = col
      .find(this.scopedFilter(filter as Filter<MeetingDoc>))
      .sort({ meetingAt: -1 });
    if (opts?.limit) cursor.limit(opts.limit);
    return cursor.toArray();
  }

  /** List meetings a given employee attended, newest first. */
  async listByAttendee(employeeKey: string): Promise<WithId<MeetingDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ 'attendees.employeeKey': employeeKey } as Filter<MeetingDoc>))
      .sort({ meetingAt: -1 })
      .toArray();
  }

  /** Company-scoped full-text search over title/note/summary. */
  async search(query: string, limit = 25): Promise<WithId<MeetingDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ $text: { $search: query } } as Filter<MeetingDoc>))
      .limit(limit)
      .toArray();
  }

  /** Attach a file id to a meeting's embedded fileIds array. */
  async addFileId(
    meetingId: string | ObjectId,
    fileId: string | ObjectId,
    actor: string,
  ): Promise<boolean> {
    const _id = typeof meetingId === 'string' ? new ObjectId(meetingId) : meetingId;
    const fid = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
    const audit = auditedUpdate({ actor });
    const col = await this.collection();
    const res = await col.updateOne(
      this.scopedFilter({ _id } as Filter<MeetingDoc>),
      { $addToSet: { fileIds: fid }, $set: audit.set, $inc: audit.inc },
    );
    return res.modifiedCount === 1;
  }

  /** Mark an attendee's follow-up done (updates the embedded attendee). */
  async markAttendeeFollowUp(
    meetingId: string | ObjectId,
    employeeKey: string,
    followUpNote: string | undefined,
    actor: string,
  ): Promise<boolean> {
    const _id = typeof meetingId === 'string' ? new ObjectId(meetingId) : meetingId;
    const audit = auditedUpdate({ actor });
    const col = await this.collection();
    const res = await col.updateOne(
      this.scopedFilter({ _id, 'attendees.employeeKey': employeeKey } as Filter<MeetingDoc>),
      {
        $set: {
          'attendees.$.followUpDone': true,
          'attendees.$.followUpNote': followUpNote,
          ...audit.set,
        },
        $inc: audit.inc,
      },
    );
    return res.modifiedCount === 1;
  }
}
