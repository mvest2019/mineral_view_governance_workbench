// Meeting service — business logic for the Meetings module.
//
// Phase 5 IMPORTANT: defined but NOT wired to any API route and NOT invoked by
// any existing application code. No records are inserted and no GitHub data is
// migrated.

import { MeetingRepository, type MeetingRangeOptions } from '@/src/repositories/meeting.repository';
import {
  toMeetingFields,
  validateCreateMeetingInput,
  type CreateMeetingInput,
  type MeetingDoc,
  type UpdateMeetingInput,
} from '@/src/models/meeting.model';
import type { WithId } from 'mongodb';

export class MeetingValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid meeting: ${errors.join('; ')}`);
    this.name = 'MeetingValidationError';
    this.errors = errors;
  }
}

export class MeetingNotFoundError extends Error {
  constructor(id: string) {
    super(`No meeting found for id "${id}".`);
    this.name = 'MeetingNotFoundError';
  }
}

export class MeetingConflictError extends Error {
  constructor(id: string) {
    super(`Meeting "${id}" was modified concurrently (version mismatch).`);
    this.name = 'MeetingConflictError';
  }
}

export class MeetingService {
  private readonly repo: MeetingRepository;

  constructor(repo?: MeetingRepository) {
    this.repo = repo ?? new MeetingRepository();
  }

  /** Create a meeting: validate, apply defaults, persist. (Not called in Phase 5.) */
  async createMeeting(input: CreateMeetingInput, actor: string): Promise<MeetingDoc> {
    const result = validateCreateMeetingInput(input);
    if (!result.ok) throw new MeetingValidationError(result.errors);
    return this.repo.create(toMeetingFields(input), actor);
  }

  /** Fetch a meeting by id. */
  async getById(id: string): Promise<WithId<MeetingDoc> | null> {
    return this.repo.findById(id);
  }

  /** List meetings (timeline / filtered). */
  async listMeetings(opts?: MeetingRangeOptions): Promise<WithId<MeetingDoc>[]> {
    return this.repo.list(opts);
  }

  /** List meetings an employee attended. */
  async listByAttendee(employeeKey: string): Promise<WithId<MeetingDoc>[]> {
    return this.repo.listByAttendee(employeeKey);
  }

  /** Full-text search over meetings. */
  async searchMeetings(query: string): Promise<WithId<MeetingDoc>[]> {
    return this.repo.search(query);
  }

  /** Update mutable fields using optimistic concurrency. */
  async updateMeeting(
    id: string,
    expectedVersion: number,
    changes: UpdateMeetingInput,
    actor: string,
  ): Promise<MeetingDoc> {
    const current = await this.repo.findById(id);
    if (!current) throw new MeetingNotFoundError(id);
    // Normalize embedded arrays if the caller replaces them.
    const patch = { ...changes } as Record<string, unknown>;
    const updated = await this.repo.updateById(id, expectedVersion, patch, actor);
    if (!updated) throw new MeetingConflictError(id);
    return updated;
  }

  /** Mark an attendee's follow-up complete. */
  async markAttendeeFollowUp(
    id: string,
    employeeKey: string,
    followUpNote: string | undefined,
    actor: string,
  ): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new MeetingNotFoundError(id);
    return this.repo.markAttendeeFollowUp(id, employeeKey, followUpNote, actor);
  }

  /** Soft-delete a meeting. */
  async deleteMeeting(id: string, actor: string): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new MeetingNotFoundError(id);
    return this.repo.softDelete(id, actor);
  }
}
