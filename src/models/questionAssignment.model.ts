// Question Assignment document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.7. One owner record per
// question (unique per questionCode). Extends BaseDocument. Phase 6 defines
// shape + pure validators only; no I/O.

import type { BaseDocument } from '@/src/models/base';
import { QUESTION_KIND, type QuestionKind } from '@/src/constants/enums';

/** A Question Assignment as stored in GovernanceDB.questionAssignments. */
export interface QuestionAssignmentDoc extends BaseDocument {
  /** → priorityQuestions.questionCode or repoQuestions.questionCode. */
  questionCode: string;
  questionKind: QuestionKind;
  /** → employees.memberKey. */
  assigneeKey: string;
  note?: string;
}

export interface CreateQuestionAssignmentInput {
  questionCode: string;
  assigneeKey: string;
  questionKind?: QuestionKind;
  note?: string;
}

export type UpdateQuestionAssignmentInput = Partial<
  Omit<CreateQuestionAssignmentInput, 'questionCode'>
>;

const EMPLOYEE_KEY_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCreateQuestionAssignmentInput(
  input: CreateQuestionAssignmentInput,
): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (typeof input.questionCode !== 'string' || input.questionCode.trim().length === 0) {
    errors.push('questionCode is required and must be a non-empty string');
  }
  if (typeof input.assigneeKey !== 'string' || !EMPLOYEE_KEY_RE.test(input.assigneeKey)) {
    errors.push('assigneeKey is required and must be a lowercase slug');
  }
  if (input.questionKind !== undefined && !QUESTION_KIND.includes(input.questionKind)) {
    errors.push(`questionKind must be one of: ${QUESTION_KIND.join(', ')}`);
  }
  return { ok: errors.length === 0, errors };
}

export function toQuestionAssignmentFields(
  input: CreateQuestionAssignmentInput,
): Omit<QuestionAssignmentDoc, keyof BaseDocument | '_id'> {
  return {
    questionCode: input.questionCode,
    questionKind: input.questionKind ?? 'PRIORITY',
    assigneeKey: input.assigneeKey,
    note: input.note,
  };
}
