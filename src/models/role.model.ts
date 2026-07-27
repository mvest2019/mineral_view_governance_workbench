// Role document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.2. Roles bundle permission keys
// (permissions themselves are a code constant in V1, not a collection). Extends
// BaseDocument. Phase 6 defines shape + pure validators only; no I/O.

import type { BaseDocument } from '@/src/models/base';

/** A Role as stored in GovernanceDB.roles. */
export interface RoleDoc extends BaseDocument {
  /** Uppercase role key, unique per company (e.g. "ADMIN"). */
  key: string;
  name: string;
  description?: string;
  /** Permission keys this role grants (e.g. "tasks:create"). */
  permissionKeys: string[];
  /** Built-in system role (protected from deletion). */
  isSystem: boolean;
}

export interface CreateRoleInput {
  key: string;
  name: string;
  description?: string;
  permissionKeys?: string[];
  isSystem?: boolean;
}

export type UpdateRoleInput = Partial<Omit<CreateRoleInput, 'key'>>;

const ROLE_KEY_RE = /^[A-Z][A-Z0-9_]*$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCreateRoleInput(input: CreateRoleInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (typeof input.key !== 'string' || !ROLE_KEY_RE.test(input.key)) {
    errors.push('key is required and must be UPPER_SNAKE (e.g. "ADMIN")');
  }
  if (typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  }
  if (input.permissionKeys !== undefined
    && (!Array.isArray(input.permissionKeys) || input.permissionKeys.some((k) => typeof k !== 'string'))) {
    errors.push('permissionKeys, when provided, must be an array of strings');
  }
  return { ok: errors.length === 0, errors };
}

export function toRoleFields(input: CreateRoleInput): Omit<RoleDoc, keyof BaseDocument | '_id'> {
  return {
    key: input.key,
    name: input.name,
    description: input.description,
    permissionKeys: input.permissionKeys ?? [],
    isSystem: input.isSystem ?? false,
  };
}
