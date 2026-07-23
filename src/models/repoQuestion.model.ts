// Repo Question document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.8. Repository-scoped questions,
// same family as priority questions but keyed to a repo. Extends BaseDocument.
// Phase 6 defines shape + pure validators only; no I/O.

import type { BaseDocument } from '@/src/models/base';
import {
  PRIORITY,
  QUESTION_STATUS,
  QUESTION_SOURCE,
  type Priority,
  type QuestionStatus,
  type QuestionSource,
} from '@/src/constants/enums';

/** A Repo Question as stored in GovernanceDB.repoQuestions. */
export interface RepoQuestionDoc extends BaseDocument {
  /** Stable code, unique per company. */
  questionCode: string;
  /** → repositories.name. */
  repoName: string;
  title?: string;
  bodyMarkdown: string;
  shortQuestion?: string;
  sourceExcerpt?: string;
  priority: Priority;
  status: QuestionStatus;
  source: QuestionSource;
  sourceRef?: string;
  /** → employees.memberKey. */
  primaryAssigneeKey?: string;
  /** Last accepted answer text (repo questions keep the answer inline). */
  answerMarkdown?: string;
  reviewNote?: string;
  reviewedByKey?: string;
}

export interface CreateRepoQuestionInput {
  questionCode: string;
  repoName: string;
  bodyMarkdown: string;
  title?: string;
  shortQuestion?: string;
  sourceExcerpt?: string;
  priority?: Priority;
  status?: QuestionStatus;
  source?: QuestionSource;
  sourceRef?: string;
  primaryAssigneeKey?: string;
  answerMarkdown?: string;
  reviewNote?: string;
  reviewedByKey?: string;
}

export type UpdateRepoQuestionInput = Partial<Omit<CreateRepoQuestionInput, 'questionCode'>>;

const EMPLOYEE_KEY_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCreateRepoQuestionInput(input: CreateRepoQuestionInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (typeof input.questionCode !== 'string' || input.questionCode.trim().length === 0) {
    errors.push('questionCode is required and must be a non-empty string');
  }
  if (typeof input.repoName !== 'string' || input.repoName.trim().length === 0) {
    errors.push('repoName is required and must be a non-empty string');
  }
  if (typeof input.bodyMarkdown !== 'string' || input.bodyMarkdown.trim().length === 0) {
    errors.push('bodyMarkdown is required and must be a non-empty string');
  }
  if (input.priority !== undefined && !PRIORITY.includes(input.priority)) {
    errors.push(`priority must be one of: ${PRIORITY.join(', ')}`);
  }
  if (input.status !== undefined && !QUESTION_STATUS.includes(input.status)) {
    errors.push(`status must be one of: ${QUESTION_STATUS.join(', ')}`);
  }
  if (input.source !== undefined && !QUESTION_SOURCE.includes(input.source)) {
    errors.push(`source must be one of: ${QUESTION_SOURCE.join(', ')}`);
  }
  if (input.primaryAssigneeKey !== undefined && !EMPLOYEE_KEY_RE.test(String(input.primaryAssigneeKey))) {
    errors.push('primaryAssigneeKey, when provided, must be a lowercase slug');
  }
  return { ok: errors.length === 0, errors };
}

export function toRepoQuestionFields(
  input: CreateRepoQuestionInput,
): Omit<RepoQuestionDoc, keyof BaseDocument | '_id'> {
  return {
    questionCode: input.questionCode,
    repoName: input.repoName,
    title: input.title,
    bodyMarkdown: input.bodyMarkdown,
    shortQuestion: input.shortQuestion,
    sourceExcerpt: input.sourceExcerpt,
    priority: input.priority ?? 'MEDIUM',
    status: input.status ?? 'OPEN',
    source: input.source ?? 'MANUAL',
    sourceRef: input.sourceRef,
    primaryAssigneeKey: input.primaryAssigneeKey,
    answerMarkdown: input.answerMarkdown,
    reviewNote: input.reviewNote,
    reviewedByKey: input.reviewedByKey,
  };
}
