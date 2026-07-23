// Finding document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.12. Review findings / repo
// understanding (the F-#### register + review decisions). Extends BaseDocument.
// Phase 6 defines shape + pure validators only; no I/O.

import type { BaseDocument } from '@/src/models/base';
import { FINDING_DECISION, type FindingDecision } from '@/src/constants/enums';

/** A Finding as stored in GovernanceDB.findings. */
export interface FindingDoc extends BaseDocument {
  /** Stable finding code, unique per company (e.g. "F-0042"). */
  findingCode: string;
  /** → repositories.name. */
  repoName?: string;
  departmentKey?: string;
  title?: string;
  bodyMarkdown?: string;
  severity?: string;
  decision: FindingDecision;
  /** → employees.memberKey. */
  reviewerKey?: string;
  reviewedAt?: Date | null;
  reviewNote?: string;
  nextQuestionsNote?: string;
  /** → repoQuestions/priorityQuestions.questionCode. */
  questionCode?: string;
}

export interface CreateFindingInput {
  findingCode: string;
  repoName?: string;
  departmentKey?: string;
  title?: string;
  bodyMarkdown?: string;
  severity?: string;
  decision?: FindingDecision;
  reviewerKey?: string;
  reviewedAt?: Date;
  reviewNote?: string;
  nextQuestionsNote?: string;
  questionCode?: string;
}

export type UpdateFindingInput = Partial<Omit<CreateFindingInput, 'findingCode'>>;

const FINDING_CODE_RE = /^F-[0-9-]+$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCreateFindingInput(input: CreateFindingInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (typeof input.findingCode !== 'string' || !FINDING_CODE_RE.test(input.findingCode)) {
    errors.push('findingCode is required and must match ^F-[0-9-]+$ (e.g. "F-0042")');
  }
  if (input.decision !== undefined && !FINDING_DECISION.includes(input.decision)) {
    errors.push(`decision must be one of: ${FINDING_DECISION.join(', ')}`);
  }
  return { ok: errors.length === 0, errors };
}

export function toFindingFields(
  input: CreateFindingInput,
): Omit<FindingDoc, keyof BaseDocument | '_id'> {
  return {
    findingCode: input.findingCode,
    repoName: input.repoName,
    departmentKey: input.departmentKey,
    title: input.title,
    bodyMarkdown: input.bodyMarkdown,
    severity: input.severity,
    decision: input.decision ?? 'OPEN',
    reviewerKey: input.reviewerKey,
    reviewedAt: input.reviewedAt ?? null,
    reviewNote: input.reviewNote,
    nextQuestionsNote: input.nextQuestionsNote,
    questionCode: input.questionCode,
  };
}
