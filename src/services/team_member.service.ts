// Team Member service — business logic for the Team Members module.
//
// Orchestrates the repository and enforces edge validation, key uniqueness, and
// defaults. Mirrors EmployeeService. The Team Members API route reads through
// the lib helper (lib/team_members_mongo.ts); this service is the write/edit
// surface and keeps the module consistent with the rest of the architecture.

import { TeamMemberRepository } from '@/src/repositories/team_member.repository';
import {
  toTeamMemberFields,
  validateCreateTeamMemberInput,
  type CreateTeamMemberInput,
  type TeamMemberDoc,
  type UpdateTeamMemberInput,
} from '@/src/models/team_member.model';
import type { EntityStatus } from '@/src/constants/enums';
import type { WithId } from 'mongodb';

/** Raised when input fails edge validation. */
export class TeamMemberValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid team member input: ${errors.join('; ')}`);
    this.name = 'TeamMemberValidationError';
    this.errors = errors;
  }
}

/** Raised when a member key already exists. */
export class TeamMemberConflictError extends Error {
  constructor(memberKey: string) {
    super(`A team member with memberKey "${memberKey}" already exists.`);
    this.name = 'TeamMemberConflictError';
  }
}

/** Raised when an expected team member is missing. */
export class TeamMemberNotFoundError extends Error {
  constructor(memberKey: string) {
    super(`No team member found for memberKey "${memberKey}".`);
    this.name = 'TeamMemberNotFoundError';
  }
}

export class TeamMemberService {
  private readonly repo: TeamMemberRepository;

  constructor(repo?: TeamMemberRepository) {
    this.repo = repo ?? new TeamMemberRepository();
  }

  /** Create a team member: validate, enforce key uniqueness, persist with envelope. */
  async createTeamMember(input: CreateTeamMemberInput, actor: string): Promise<TeamMemberDoc> {
    const result = validateCreateTeamMemberInput(input);
    if (!result.ok) throw new TeamMemberValidationError(result.errors);
    if (await this.repo.existsByMemberKey(input.memberKey)) {
      throw new TeamMemberConflictError(input.memberKey);
    }
    return this.repo.create(toTeamMemberFields(input), actor);
  }

  /**
   * Create or overwrite a team member by key (idempotent seed/import helper).
   * If the key exists, its mutable fields are replaced; otherwise it is created.
   */
  async upsertTeamMember(input: CreateTeamMemberInput, actor: string): Promise<TeamMemberDoc> {
    const result = validateCreateTeamMemberInput(input);
    if (!result.ok) throw new TeamMemberValidationError(result.errors);
    const current = await this.repo.findByMemberKey(input.memberKey);
    if (!current) return this.repo.create(toTeamMemberFields(input), actor);
    const { memberKey: _omit, ...changes } = toTeamMemberFields(input) as UpdateTeamMemberInput & { memberKey?: string };
    const updated = await this.repo.updateById(current._id, current.version, changes, actor);
    if (!updated) throw new TeamMemberConflictError(input.memberKey);
    return updated;
  }

  /** Fetch a live team member by key. */
  async getByMemberKey(memberKey: string): Promise<WithId<TeamMemberDoc> | null> {
    return this.repo.findByMemberKey(memberKey);
  }

  /** List live team members (defaults to ACTIVE). */
  async listTeamMembers(status?: EntityStatus): Promise<WithId<TeamMemberDoc>[]> {
    return this.repo.listByStatus(status ?? 'ACTIVE');
  }

  /** Update mutable fields with optimistic concurrency. */
  async updateTeamMember(
    memberKey: string,
    expectedVersion: number,
    changes: UpdateTeamMemberInput,
    actor: string,
  ): Promise<TeamMemberDoc> {
    const current = await this.repo.findByMemberKey(memberKey);
    if (!current) throw new TeamMemberNotFoundError(memberKey);
    const updated = await this.repo.updateById(current._id, expectedVersion, changes, actor);
    if (!updated) throw new TeamMemberConflictError(memberKey);
    return updated;
  }
}
