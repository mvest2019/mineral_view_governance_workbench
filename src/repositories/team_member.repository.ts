// Team Member repository — data access for GovernanceDB.team_members.
//
// Extends BaseRepository, inheriting companyKey injection, audit stamping,
// soft-delete filtering, and optimistic-concurrency updates. Adds only the
// team-member-specific queries the page needs (list, lookup by key).

import type { Filter, WithId } from 'mongodb';
import { BaseRepository, type RepositoryOptions } from '@/src/repositories/base.repository';
import { COLLECTIONS } from '@/src/constants/collections';
import type { TeamMemberDoc } from '@/src/models/team_member.model';
import type { EntityStatus } from '@/src/constants/enums';

export class TeamMemberRepository extends BaseRepository<TeamMemberDoc> {
  constructor(options?: RepositoryOptions) {
    super(COLLECTIONS.TEAM_MEMBERS, options);
  }

  /** Find a live team member by its app profile key (e.g. "Aboli_Mundralkar"). */
  async findByMemberKey(memberKey: string): Promise<WithId<TeamMemberDoc> | null> {
    return this.findOne({ memberKey } as Filter<TeamMemberDoc>);
  }

  /** True if a live team member already uses this key. */
  async existsByMemberKey(memberKey: string): Promise<boolean> {
    return (await this.count({ memberKey } as Filter<TeamMemberDoc>)) > 0;
  }

  /** List live team members by lifecycle status (defaults to ACTIVE), name-sorted. */
  async listByStatus(status: EntityStatus = 'ACTIVE'): Promise<WithId<TeamMemberDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({ status } as Filter<TeamMemberDoc>))
      .sort({ fullName: 1 })
      .toArray();
  }

  /** List every live team member (any status), name-sorted. */
  async listAll(): Promise<WithId<TeamMemberDoc>[]> {
    const col = await this.collection();
    return col
      .find(this.scopedFilter({} as Filter<TeamMemberDoc>))
      .sort({ fullName: 1 })
      .toArray();
  }
}
