// Department document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.3. Moves the config-driven
// DEPARTMENT_ARCHITECTURE into data. Extends BaseDocument. Phase 6 defines shape
// + pure validators only; no I/O.

import type { BaseDocument } from '@/src/models/base';

/** A Department as stored in GovernanceDB.departments. */
export interface DepartmentDoc extends BaseDocument {
  /** Uppercase key, unique per company (e.g. "DATA_SCIENCE"). */
  key: string;
  name: string;
  description?: string;
  /** → employees.memberKey (department lead). */
  leadEmployeeKey?: string;
  /** → departments.key (parent for hierarchy). */
  parentKey?: string;
  repoScopes: string[];
}

export interface CreateDepartmentInput {
  key: string;
  name: string;
  description?: string;
  leadEmployeeKey?: string;
  parentKey?: string;
  repoScopes?: string[];
}

export type UpdateDepartmentInput = Partial<Omit<CreateDepartmentInput, 'key'>>;

const DEPT_KEY_RE = /^[A-Z][A-Z0-9_]*$/;
const EMPLOYEE_KEY_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCreateDepartmentInput(input: CreateDepartmentInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (typeof input.key !== 'string' || !DEPT_KEY_RE.test(input.key)) {
    errors.push('key is required and must be UPPER_SNAKE (e.g. "DATA_SCIENCE")');
  }
  if (typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  }
  if (input.leadEmployeeKey !== undefined && !EMPLOYEE_KEY_RE.test(String(input.leadEmployeeKey))) {
    errors.push('leadEmployeeKey, when provided, must be a lowercase slug');
  }
  if (input.parentKey !== undefined && !DEPT_KEY_RE.test(String(input.parentKey))) {
    errors.push('parentKey, when provided, must be UPPER_SNAKE');
  }
  if (input.repoScopes !== undefined
    && (!Array.isArray(input.repoScopes) || input.repoScopes.some((r) => typeof r !== 'string'))) {
    errors.push('repoScopes, when provided, must be an array of strings');
  }
  return { ok: errors.length === 0, errors };
}

export function toDepartmentFields(
  input: CreateDepartmentInput,
): Omit<DepartmentDoc, keyof BaseDocument | '_id'> {
  return {
    key: input.key,
    name: input.name,
    description: input.description,
    leadEmployeeKey: input.leadEmployeeKey,
    parentKey: input.parentKey,
    repoScopes: input.repoScopes ?? [],
  };
}
