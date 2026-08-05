// Meeting File service — business logic for the Meeting Files module.
//
// Coordinates the Meeting Files repository with the Meetings repository so a
// newly-registered file is linked into its meeting's fileIds array.
//
// Phase 5 IMPORTANT: defined but NOT wired to any API route and NOT invoked by
// any existing application code. No records are inserted, no bytes are stored,
// and no GitHub data is migrated.

import { MeetingFileRepository } from '@/src/repositories/meetingFile.repository';
import { MeetingRepository } from '@/src/repositories/meeting.repository';
import {
  toMeetingFileFields,
  validateCreateMeetingFileInput,
  type CreateMeetingFileInput,
  type MeetingFileDoc,
} from '@/src/models/meetingFile.model';
import type { ObjectId, WithId } from 'mongodb';

export class MeetingFileValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid meeting file: ${errors.join('; ')}`);
    this.name = 'MeetingFileValidationError';
    this.errors = errors;
  }
}

export class MeetingFileNotFoundError extends Error {
  constructor(id: string) {
    super(`No meeting file found for id "${id}".`);
    this.name = 'MeetingFileNotFoundError';
  }
}

export class MeetingFileService {
  private readonly repo: MeetingFileRepository;
  private readonly meetingRepo: MeetingRepository;

  constructor(repo?: MeetingFileRepository, meetingRepo?: MeetingRepository) {
    this.repo = repo ?? new MeetingFileRepository();
    this.meetingRepo = meetingRepo ?? new MeetingRepository();
  }

  /**
   * Register a meeting file's metadata (bytes are stored in the object store by
   * the caller) and link it into the meeting. (Not called in Phase 5.)
   */
  async registerFile(input: CreateMeetingFileInput, actor: string): Promise<MeetingFileDoc> {
    const result = validateCreateMeetingFileInput(input);
    if (!result.ok) throw new MeetingFileValidationError(result.errors);

    const fields = toMeetingFileFields(input);
    const created = await this.repo.create(fields, actor);
    // Best-effort back-link into the meeting's embedded fileIds.
    await this.meetingRepo.addFileId(fields.meetingId, created._id as ObjectId, actor);
    return created;
  }

  /** List all files for a meeting. */
  async listByMeeting(meetingId: string): Promise<WithId<MeetingFileDoc>[]> {
    return this.repo.listByMeeting(meetingId);
  }

  /** Soft-delete a meeting file record. */
  async deleteFile(id: string, actor: string): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new MeetingFileNotFoundError(id);
    return this.repo.softDelete(id, actor);
  }
}
