// Repository document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.11. Canonical repo registry with
// an EMBEDDED classification (strict 1:1 — no separate collection). Extends
// BaseDocument. Phase 6 defines shape + pure validators only; no I/O.

import type { BaseDocument } from '@/src/models/base';
import {
  CONFIDENCE,
  REPO_APPROVAL_STATUS,
  type Confidence,
  type RepoApprovalStatus,
} from '@/src/constants/enums';

/** Embedded classification of a repository (strict 1:1). */
export interface RepoClassification {
  observedPurpose?: string;
  proposedCategory?: string; // free label from REPO_CATEGORIES
  confidence?: Confidence;
  canonicalStatus?: string;
  evidence?: string;
  approvalStatus: RepoApprovalStatus;
  /** → findings.findingCode. */
  findingCode?: string;
  /** → repoQuestions.questionCode. */
  questionCode?: string;
  updatedAt?: Date | null;
}

/** A Repository as stored in GovernanceDB.repositories. */
export interface RepositoryDoc extends BaseDocument {
  /** Repo name, unique per company. */
  name: string;
  owner?: string;
  defaultBranch?: string;
  aspectGroup?: string;
  departmentKeys: string[];
  classification?: RepoClassification;
  isArchived: boolean;
}

export interface CreateRepositoryInput {
  name: string;
  owner?: string;
  defaultBranch?: string;
  aspectGroup?: string;
  departmentKeys?: string[];
  classification?: Partial<RepoClassification>;
  isArchived?: boolean;
}

export type UpdateRepositoryInput = Partial<Omit<CreateRepositoryInput, 'name'>>;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateClassification(c: Partial<RepoClassification> | undefined, errors: string[]): void {
  if (c === undefined) return;
  if (c.confidence !== undefined && !CONFIDENCE.includes(c.confidence)) {
    errors.push(`classification.confidence must be one of: ${CONFIDENCE.join(', ')}`);
  }
  if (c.approvalStatus !== undefined && !REPO_APPROVAL_STATUS.includes(c.approvalStatus)) {
    errors.push(`classification.approvalStatus must be one of: ${REPO_APPROVAL_STATUS.join(', ')}`);
  }
}

export function validateCreateRepositoryInput(input: CreateRepositoryInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  }
  if (input.departmentKeys !== undefined
    && (!Array.isArray(input.departmentKeys) || input.departmentKeys.some((d) => typeof d !== 'string'))) {
    errors.push('departmentKeys, when provided, must be an array of strings');
  }
  validateClassification(input.classification, errors);
  return { ok: errors.length === 0, errors };
}

function normalizeClassification(c: Partial<RepoClassification> | undefined): RepoClassification | undefined {
  if (c === undefined) return undefined;
  return {
    observedPurpose: c.observedPurpose,
    proposedCategory: c.proposedCategory,
    confidence: c.confidence,
    canonicalStatus: c.canonicalStatus,
    evidence: c.evidence,
    approvalStatus: c.approvalStatus ?? 'PENDING',
    findingCode: c.findingCode,
    questionCode: c.questionCode,
    updatedAt: c.updatedAt ?? null,
  };
}

export function toRepositoryFields(
  input: CreateRepositoryInput,
): Omit<RepositoryDoc, keyof BaseDocument | '_id'> {
  return {
    name: input.name,
    owner: input.owner,
    defaultBranch: input.defaultBranch,
    aspectGroup: input.aspectGroup,
    departmentKeys: input.departmentKeys ?? [],
    classification: normalizeClassification(input.classification),
    isArchived: input.isArchived ?? false,
  };
}
