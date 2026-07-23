// Employee document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.1. The document extends the
// shared BaseDocument envelope (companyKey + audit + soft delete + version).
//
// Phase 2 defines the shape and pure validators only. Nothing here connects to
// MongoDB, reads, or writes.

import type { BaseDocument } from '@/src/models/base';
import {
  ENTITY_STATUS,
  ROLE_KEY,
  type EntityStatus,
  type RoleKey,
} from '@/src/constants/enums';

/** Narrative profile carried inline on the employee (bounded, always co-read). */
export interface EmployeeProfile {
  snapshot?: string;
  priorities?: string[];
  workCompleted?: string;
  primarySurfaces?: string[];
  reviewCadence?: string;
  [key: string]: unknown; // forward-compatible profile fields
}

/** Auth block — present only once login is enabled (soft-launch, later phase). */
export interface EmployeeAuth {
  passwordHash?: string;
  lastLoginAt?: Date | null;
  failedLoginCount?: number;
  mfaEnabled?: boolean;
}

/** An Employee document as stored in GovernanceDB.employees. */
export interface EmployeeDoc extends BaseDocument {
  /** Canonical slug natural key, unique per company (e.g. "ajay_landge"). */
  memberKey: string;
  /** Alternate key forms (e.g. "Ajay_Landge") reconciled to memberKey. */
  aliases: string[];
  fullName: string;
  email?: string;
  title?: string;
  purpose?: string;
  /** → departments.key (many-to-many). */
  departmentKeys: string[];
  /** → employees.memberKey (self-reference). */
  reportsToKey?: string;
  repoScopes: string[];
  status: EntityStatus;
  profile: EmployeeProfile;
  /** → roles.key (RBAC). Defaults to ["EMPLOYEE"]. */
  roleKeys: RoleKey[];
  auth?: EmployeeAuth;
}

/** Fields a caller supplies to create an employee (envelope is added by the repo). */
export interface CreateEmployeeInput {
  memberKey: string;
  fullName: string;
  aliases?: string[];
  email?: string;
  title?: string;
  purpose?: string;
  departmentKeys?: string[];
  reportsToKey?: string;
  repoScopes?: string[];
  status?: EntityStatus;
  profile?: EmployeeProfile;
  roleKeys?: RoleKey[];
}

/** Partial, mutable fields for an update (never touches the audit envelope). */
export type UpdateEmployeeInput = Partial<
  Omit<CreateEmployeeInput, 'memberKey'>
>;

// ---------------------------------------------------------------------------
// Pure edge validation. No dependency on a validation library — a small,
// explicit validator keeps the footprint minimal and matches the project's
// existing hand-rolled validation style. The database $jsonSchema validator
// (src/db/validators/employees.validator.ts) is the authoritative second layer.
// ---------------------------------------------------------------------------

const MEMBER_KEY_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Validate a CreateEmployeeInput. Pure — performs no I/O. */
export function validateCreateEmployeeInput(input: CreateEmployeeInput): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['input must be an object'] };
  }
  if (typeof input.memberKey !== 'string' || !MEMBER_KEY_RE.test(input.memberKey)) {
    errors.push('memberKey is required and must be a lowercase slug (e.g. "ajay_landge")');
  }
  if (typeof input.fullName !== 'string' || input.fullName.trim().length === 0) {
    errors.push('fullName is required and must be a non-empty string');
  }
  if (input.email !== undefined && !EMAIL_RE.test(String(input.email))) {
    errors.push('email, when provided, must be a valid email address');
  }
  if (input.status !== undefined && !ENTITY_STATUS.includes(input.status)) {
    errors.push(`status must be one of: ${ENTITY_STATUS.join(', ')}`);
  }
  if (input.roleKeys !== undefined) {
    if (!Array.isArray(input.roleKeys) || input.roleKeys.length === 0) {
      errors.push('roleKeys, when provided, must be a non-empty array');
    } else {
      const bad = input.roleKeys.filter((r) => !ROLE_KEY.includes(r));
      if (bad.length) errors.push(`roleKeys contains invalid values: ${bad.join(', ')}`);
    }
  }
  for (const arrField of ['aliases', 'departmentKeys', 'repoScopes'] as const) {
    const v = input[arrField];
    if (v !== undefined && (!Array.isArray(v) || v.some((x) => typeof x !== 'string'))) {
      errors.push(`${arrField}, when provided, must be an array of strings`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Normalize a CreateEmployeeInput into the full set of non-envelope document
 * fields, applying V1 defaults (status ACTIVE, roleKeys [EMPLOYEE], empty
 * arrays/objects). Pure — the audit envelope is added later by the repository.
 */
export function toEmployeeFields(
  input: CreateEmployeeInput,
): Omit<EmployeeDoc, keyof BaseDocument | '_id'> {
  return {
    memberKey: input.memberKey,
    aliases: input.aliases ?? [],
    fullName: input.fullName,
    email: input.email,
    title: input.title,
    purpose: input.purpose,
    departmentKeys: input.departmentKeys ?? [],
    reportsToKey: input.reportsToKey,
    repoScopes: input.repoScopes ?? [],
    status: input.status ?? 'ACTIVE',
    profile: input.profile ?? {},
    roleKeys: input.roleKeys ?? ['EMPLOYEE'],
  };
}
