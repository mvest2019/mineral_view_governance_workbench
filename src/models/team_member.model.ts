// Team Member document type + edge validation.
//
// Backs the Team Members page. Each document is the MongoDB representation of a
// governed team-member profile that previously lived as a Markdown file in
// Governance_Files/_GOVERNANCE/team_members/*.md, PLUS the condensed profile
// fields the page renders today (formerly TEAM_MEMBER_PROFILES in lib/config).
//
// Design goals:
//   - PARITY: the page-facing fields (role, purpose, departments, repos,
//     operatingSources, fullName) reproduce exactly what the UI shows today.
//   - FIDELITY: the full Markdown is preserved — every parsed section in
//     `sections[]` and the untouched source in `rawMarkdown` — so no governance
//     information is lost in the migration.
//   - ARCHITECTURE: extends the shared BaseDocument envelope (companyKey + audit
//     + soft delete + version), exactly like EmployeeDoc.

import type { BaseDocument } from '@/src/models/base';
import { ENTITY_STATUS, type EntityStatus } from '@/src/constants/enums';

/** One parsed Markdown section (e.g. "## 1. Member identity"). */
export interface TeamMemberSection {
  /** Section number when the heading is numbered (1..21); null otherwise. */
  number: number | null;
  /** Heading text without the leading number (e.g. "Member identity"). */
  title: string;
  /** Verbatim Markdown body of the section (tables, lists, prose preserved). */
  markdown: string;
}

/** Skills block parsed from §11 (best-effort; all optional). */
export interface TeamMemberSkills {
  languages?: string;
  tools?: string;
  domainKnowledge?: string;
  [key: string]: unknown;
}

/** A Team Member document as stored in GovernanceDB.team_members. */
export interface TeamMemberDoc extends BaseDocument {
  /**
   * Natural key exactly as the application addresses a member (the former
   * TEAM_MEMBER_PROFILES key), e.g. "Aboli_Mundralkar". Unique per company.
   */
  memberKey: string;
  /** Filename slug of the source Markdown ("aboli-mundralkar"); null if none. */
  slug?: string | null;
  /** Human display name, e.g. "Aboli Mundralkar". */
  fullName: string;

  // --- Page-facing fields (parity with the old config; drive the UI) ---
  role: string;
  purpose: string;
  departments: string[];
  repos: string[];
  operatingSources: string[];

  // --- Enriched fields parsed from the Markdown header / §1 / §2 ---
  title?: string;
  departmentLabel?: string;
  reportsTo?: string;
  experience?: string;
  finalAuthority?: string;
  primarySurfaces?: string[];
  focus?: string;
  priorities?: string[];
  skills?: TeamMemberSkills;
  reviewCadence?: string;
  lastUpdatedLabel?: string;
  sourceNote?: string;

  // --- Full-fidelity Markdown preservation ---
  /** Every parsed section, in document order. Empty when there was no file. */
  sections: TeamMemberSection[];
  /** The complete, untouched Markdown source. Empty when there was no file. */
  rawMarkdown: string;
  /** Repo-relative path of the source Markdown, when one existed. */
  sourcePath?: string | null;
  /** True when a team-member-*.md file backed this profile. */
  hasProfileDoc: boolean;

  status: EntityStatus;
}

/** Fields a caller supplies to create a team member (envelope added by the repo). */
export interface CreateTeamMemberInput {
  memberKey: string;
  fullName: string;
  slug?: string | null;
  role?: string;
  purpose?: string;
  departments?: string[];
  repos?: string[];
  operatingSources?: string[];
  title?: string;
  departmentLabel?: string;
  reportsTo?: string;
  experience?: string;
  finalAuthority?: string;
  primarySurfaces?: string[];
  focus?: string;
  priorities?: string[];
  skills?: TeamMemberSkills;
  reviewCadence?: string;
  lastUpdatedLabel?: string;
  sourceNote?: string;
  sections?: TeamMemberSection[];
  rawMarkdown?: string;
  sourcePath?: string | null;
  hasProfileDoc?: boolean;
  status?: EntityStatus;
}

/** Partial, mutable fields for an update (never touches the audit envelope or key). */
export type UpdateTeamMemberInput = Partial<Omit<CreateTeamMemberInput, 'memberKey'>>;

// ---------------------------------------------------------------------------
// Pure edge validation — mirrors the hand-rolled style of employee.model.ts.
// The database $jsonSchema validator is the authoritative second layer.
// ---------------------------------------------------------------------------

/** Member keys are the app profile keys, e.g. "Aboli_Mundralkar" (allows mixed case). */
const MEMBER_KEY_RE = /^[A-Za-z0-9]+(_[A-Za-z0-9]+)*$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Validate a CreateTeamMemberInput. Pure — performs no I/O. */
export function validateCreateTeamMemberInput(input: CreateTeamMemberInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['input must be an object'] };
  }
  if (typeof input.memberKey !== 'string' || !MEMBER_KEY_RE.test(input.memberKey)) {
    errors.push('memberKey is required and must match ^[A-Za-z0-9]+(_[A-Za-z0-9]+)*$ (e.g. "Aboli_Mundralkar")');
  }
  if (typeof input.fullName !== 'string' || input.fullName.trim().length === 0) {
    errors.push('fullName is required and must be a non-empty string');
  }
  if (input.status !== undefined && !ENTITY_STATUS.includes(input.status)) {
    errors.push(`status must be one of: ${ENTITY_STATUS.join(', ')}`);
  }
  for (const arrField of ['departments', 'repos', 'operatingSources', 'primarySurfaces', 'priorities'] as const) {
    const v = input[arrField];
    if (v !== undefined && (!Array.isArray(v) || v.some((x) => typeof x !== 'string'))) {
      errors.push(`${arrField}, when provided, must be an array of strings`);
    }
  }
  if (input.sections !== undefined && !Array.isArray(input.sections)) {
    errors.push('sections, when provided, must be an array');
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Normalize a CreateTeamMemberInput into the full set of non-envelope document
 * fields, applying defaults (status ACTIVE, empty arrays/strings). Pure — the
 * audit envelope is added later by the repository.
 */
export function toTeamMemberFields(
  input: CreateTeamMemberInput,
): Omit<TeamMemberDoc, keyof BaseDocument | '_id'> {
  return {
    memberKey: input.memberKey,
    slug: input.slug ?? null,
    fullName: input.fullName,
    role: input.role ?? '',
    purpose: input.purpose ?? '',
    departments: input.departments ?? [],
    repos: input.repos ?? [],
    operatingSources: input.operatingSources ?? [],
    title: input.title,
    departmentLabel: input.departmentLabel,
    reportsTo: input.reportsTo,
    experience: input.experience,
    finalAuthority: input.finalAuthority,
    primarySurfaces: input.primarySurfaces,
    focus: input.focus,
    priorities: input.priorities,
    skills: input.skills,
    reviewCadence: input.reviewCadence,
    lastUpdatedLabel: input.lastUpdatedLabel,
    sourceNote: input.sourceNote,
    sections: input.sections ?? [],
    rawMarkdown: input.rawMarkdown ?? '',
    sourcePath: input.sourcePath ?? null,
    hasProfileDoc: input.hasProfileDoc ?? false,
    status: input.status ?? 'ACTIVE',
  };
}
