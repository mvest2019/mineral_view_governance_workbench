// Team Member profile source (MongoDB-first).
//
// This is the ONLY seam the Team Members API uses for member PROFILE data
// (role, purpose, departments, repos, operating_sources) and the roster order.
// Profiles now live in GovernanceDB.team_members instead of the hardcoded
// TEAM_MEMBER_PROFILES config / the Governance_Files Markdown.
//
// Backward-safe by design: if MongoDB (or the bridge) is unavailable or the
// collection is empty, it falls back to the legacy TEAM_MEMBER_PROFILES config
// so the page keeps working exactly as before. The `source` field reports which
// path served the request. No GitHub or Governance_Files reads happen here.

import { TEAM_MEMBER_PROFILES } from '@/lib/config';
import { mongoEnabled } from '@/lib/mongo_bridge';

const COMPANY_DEFAULT = 'MView';
const READ_TIMEOUT_MS = Number(process.env.MONGO_READ_TIMEOUT_MS) || 4000;

export interface TeamMemberProfile {
  role: string;
  purpose: string;
  departments: string[];
  repos: string[];
  operating_sources: string[];
}

export interface TeamMemberProfilesResult {
  /** Which layer served the data. */
  source: 'mongo' | 'config';
  /** Member keys in roster/display order (Ryan_Cochran first when present). */
  orderKeys: string[];
  /** memberKey -> the condensed profile the page renders. */
  profiles: Record<string, TeamMemberProfile>;
}

function companyKeyOf(company?: string | null): string {
  return (company && String(company).trim()) || COMPANY_DEFAULT;
}

function ryanFirst(keys: string[]): string[] {
  if (!keys.includes('Ryan_Cochran')) return keys;
  return ['Ryan_Cochran', ...keys.filter((k) => k !== 'Ryan_Cochran')];
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

/** The legacy config profiles for a company, in the shape the page expects. */
function configProfiles(company: string): TeamMemberProfilesResult {
  const raw = (TEAM_MEMBER_PROFILES as Record<string, Record<string, TeamMemberProfile>>)[company] || {};
  const profiles: Record<string, TeamMemberProfile> = {};
  for (const [key, p] of Object.entries(raw)) {
    profiles[key] = {
      role: p.role || '',
      purpose: p.purpose || '',
      departments: p.departments || [],
      repos: p.repos || [],
      operating_sources: p.operating_sources || [],
    };
  }
  return { source: 'config', orderKeys: ryanFirst(Object.keys(profiles)), profiles };
}

/**
 * Return the team-member profiles + roster order for a company from MongoDB,
 * falling back to the config on any error/empty result (backward-safe).
 */
export async function getTeamMemberProfiles(company?: string | null): Promise<TeamMemberProfilesResult> {
  const companyKey = companyKeyOf(company);
  if (!mongoEnabled()) return configProfiles(companyKey);

  try {
    const { TeamMemberRepository } = await import('@/src/repositories/team_member.repository');
    const repo = new TeamMemberRepository({ companyKey });
    const docs = await withTimeout(repo.listByStatus('ACTIVE'), READ_TIMEOUT_MS, 'listTeamMembers');
    if (!docs.length) return configProfiles(companyKey); // not seeded yet → safe fallback

    const profiles: Record<string, TeamMemberProfile> = {};
    for (const d of docs) {
      profiles[d.memberKey] = {
        role: d.role || '',
        purpose: d.purpose || '',
        departments: Array.isArray(d.departments) ? d.departments : [],
        repos: Array.isArray(d.repos) ? d.repos : [],
        operating_sources: Array.isArray(d.operatingSources) ? d.operatingSources : [],
      };
    }
    return { source: 'mongo', orderKeys: ryanFirst(Object.keys(profiles)), profiles };
  } catch (err) {
    console.error('[team_members_mongo] MongoDB read failed; using config fallback:', err instanceof Error ? err.message : err);
    return configProfiles(companyKey);
  }
}
