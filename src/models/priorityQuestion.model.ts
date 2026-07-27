// Priority Question document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.5. Priority questions are posed
// to team members (manual or AI-generated). The document extends BaseDocument.
//
// Phase 4 defines the shape and pure validators only. Nothing here connects to
// MongoDB, reads, writes, or migrates any GitHub markdown.

import type { BaseDocument } from '@/src/models/base';
import {
  PRIORITY,
  QUESTION_STATUS,
  QUESTION_SOURCE,
  type Priority,
  type QuestionStatus,
  type QuestionSource,
} from '@/src/constants/enums';

/** Polymorphic pointer to the origin of an AI/file/meeting-sourced question. */
export interface QuestionSourceRef {
  collection?: string;
  id?: string;
  section?: string;
}

/** A Priority Question as stored in GovernanceDB.priorityQuestions. */
export interface PriorityQuestionDoc extends BaseDocument {
  /** Stable code, unique per company (e.g. "Q-AI-0039"). Dedupe key. */
  questionCode: string;
  /** Normalized dedupe key (lowercased, whitespace-collapsed title). */
  normalizedTitle?: string;
  title?: string;
  bodyMarkdown: string;
  shortQuestion?: string;
  /** → employees.memberKey (who the question is for). */
  targetEmployeeKey?: string;
  priority: Priority;
  status: QuestionStatus;
  source: QuestionSource;
  sourceRef?: QuestionSourceRef;
  /** "claude" | "openai" | "manual" — free label for provenance. */
  generatedBy?: string;
  /** Denormalized rollup, maintained on answer create/delete. */
  answerCount: number;
}

/** Fields a caller supplies to create a question (envelope added by the repo). */
export interface CreatePriorityQuestionInput {
  questionCode: string;
  bodyMarkdown: string;
  title?: string;
  shortQuestion?: string;
  normalizedTitle?: string;
  targetEmployeeKey?: string;
  priority?: Priority;
  status?: QuestionStatus;
  source?: QuestionSource;
  sourceRef?: QuestionSourceRef;
  generatedBy?: string;
}

/** Mutable fields for an update (never the questionCode or the audit envelope). */
export type UpdatePriorityQuestionInput = Partial<
  Omit<CreatePriorityQuestionInput, 'questionCode'>
>;

// ---------------------------------------------------------------------------
// Pure edge validation + helpers (no I/O). The database $jsonSchema validator
// is the authoritative second layer.
// ---------------------------------------------------------------------------

const QUESTION_CODE_RE = /^Q-[A-Z0-9-]+$/;
const EMPLOYEE_KEY_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Normalize a title into the dedupe key: lowercase, collapse whitespace, trim. */
export function normalizeTitle(text: string | undefined): string {
  return String(text ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Validate a CreatePriorityQuestionInput. Pure — performs no I/O. */
export function validateCreatePriorityQuestionInput(
  input: CreatePriorityQuestionInput,
): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['input must be an object'] };
  }
  if (typeof input.questionCode !== 'string' || !QUESTION_CODE_RE.test(input.questionCode)) {
    errors.push('questionCode is required and must match ^Q-[A-Z0-9-]+$ (e.g. "Q-AI-0039")');
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
  if (
    input.targetEmployeeKey !== undefined
    && !EMPLOYEE_KEY_RE.test(String(input.targetEmployeeKey))
  ) {
    errors.push('targetEmployeeKey, when provided, must be a lowercase slug');
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Normalize into non-envelope document fields, applying V1 defaults (priority
 * MEDIUM, status OPEN, source MANUAL, answerCount 0, derived normalizedTitle).
 * Pure — the audit envelope is added later by the repository.
 */
export function toPriorityQuestionFields(
  input: CreatePriorityQuestionInput,
): Omit<PriorityQuestionDoc, keyof BaseDocument | '_id'> {
  return {
    questionCode: input.questionCode,
    normalizedTitle:
      input.normalizedTitle ?? normalizeTitle(input.title ?? input.shortQuestion),
    title: input.title,
    bodyMarkdown: input.bodyMarkdown,
    shortQuestion: input.shortQuestion,
    targetEmployeeKey: input.targetEmployeeKey,
    priority: input.priority ?? 'MEDIUM',
    status: input.status ?? 'OPEN',
    source: input.source ?? 'MANUAL',
    sourceRef: input.sourceRef,
    generatedBy: input.generatedBy,
    answerCount: 0,
  };
}
