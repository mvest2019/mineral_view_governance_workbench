// Answer document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.6. Answers are authored over
// time and accepted independently, so they are a separate collection referenced
// by questionCode (not embedded). Extends BaseDocument.
//
// Phase 4 defines the shape and pure validators only. Nothing here connects to
// MongoDB, reads, writes, or migrates any GitHub markdown.

import { ObjectId } from 'mongodb';
import type { BaseDocument } from '@/src/models/base';
import {
  QUESTION_KIND,
  CONFIDENCE,
  ANSWER_MATCH_STRATEGY,
  type QuestionKind,
  type Confidence,
  type AnswerMatchStrategy,
} from '@/src/constants/enums';

/** Records HOW an answer was linked to its question (links can be lossy). */
export interface QuestionMatch {
  strategy: AnswerMatchStrategy;
  confidence: Confidence;
}

/** Optional pointer to committed markdown (reconciliation anchor). */
export interface AnswerGithubRef {
  path?: string;
  sha?: string;
  commitUrl?: string;
}

/** An Answer as stored in GovernanceDB.answers. */
export interface AnswerDoc extends BaseDocument {
  /** → priorityQuestions.questionCode or repoQuestions.questionCode. */
  questionCode: string;
  questionKind: QuestionKind;
  answerMarkdown: string;
  /** → employees.memberKey (author). */
  answeredByKey?: string;
  /** Denormalized author name for display (optional snapshot). */
  answeredByName?: string;
  answeredAt: Date;
  /** How this answer was matched to its question. */
  questionMatch?: QuestionMatch;
  /** → employees.memberKey (who accepted). */
  acceptedByKey?: string;
  acceptedAt?: Date | null;
  /** → attachments (source file the answer was parsed from). */
  sourceFileId?: ObjectId;
  githubRef?: AnswerGithubRef;
}

/** Fields a caller supplies to create an answer (envelope added by the repo). */
export interface CreateAnswerInput {
  questionCode: string;
  answerMarkdown: string;
  questionKind?: QuestionKind;
  answeredByKey?: string;
  answeredByName?: string;
  answeredAt?: Date;
  questionMatch?: QuestionMatch;
  sourceFileId?: string | ObjectId;
  githubRef?: AnswerGithubRef;
}

// ---------------------------------------------------------------------------
// Pure edge validation. The database $jsonSchema validator is the second layer.
// ---------------------------------------------------------------------------

const EMPLOYEE_KEY_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Validate a CreateAnswerInput. Pure — performs no I/O. */
export function validateCreateAnswerInput(input: CreateAnswerInput): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['input must be an object'] };
  }
  if (typeof input.questionCode !== 'string' || input.questionCode.trim().length === 0) {
    errors.push('questionCode is required and must be a non-empty string');
  }
  if (typeof input.answerMarkdown !== 'string' || input.answerMarkdown.trim().length === 0) {
    errors.push('answerMarkdown is required and must be a non-empty string');
  }
  if (input.questionKind !== undefined && !QUESTION_KIND.includes(input.questionKind)) {
    errors.push(`questionKind must be one of: ${QUESTION_KIND.join(', ')}`);
  }
  if (input.answeredByKey !== undefined && !EMPLOYEE_KEY_RE.test(String(input.answeredByKey))) {
    errors.push('answeredByKey, when provided, must be a lowercase slug');
  }
  if (input.answeredAt !== undefined && !(input.answeredAt instanceof Date && !Number.isNaN(input.answeredAt.getTime()))) {
    errors.push('answeredAt, when provided, must be a valid Date');
  }
  if (input.questionMatch !== undefined) {
    const m = input.questionMatch;
    if (!m || typeof m !== 'object'
      || !ANSWER_MATCH_STRATEGY.includes(m.strategy)
      || !CONFIDENCE.includes(m.confidence)) {
      errors.push(
        `questionMatch must be { strategy: ${ANSWER_MATCH_STRATEGY.join('|')}, `
          + `confidence: ${CONFIDENCE.join('|')} }`,
      );
    }
  }
  if (input.sourceFileId !== undefined
    && !(input.sourceFileId instanceof ObjectId)
    && !ObjectId.isValid(String(input.sourceFileId))) {
    errors.push('sourceFileId, when provided, must be a valid ObjectId');
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Normalize into non-envelope document fields, applying V1 defaults
 * (questionKind PRIORITY, answeredAt now). Coerces sourceFileId to ObjectId.
 * Pure aside from `new Date()` default — the audit envelope is added by the repo.
 */
export function toAnswerFields(
  input: CreateAnswerInput,
): Omit<AnswerDoc, keyof BaseDocument | '_id'> {
  const sourceFileId = input.sourceFileId
    ? (input.sourceFileId instanceof ObjectId ? input.sourceFileId : new ObjectId(String(input.sourceFileId)))
    : undefined;
  return {
    questionCode: input.questionCode,
    questionKind: input.questionKind ?? 'PRIORITY',
    answerMarkdown: input.answerMarkdown,
    answeredByKey: input.answeredByKey,
    answeredByName: input.answeredByName,
    answeredAt: input.answeredAt ?? new Date(),
    questionMatch: input.questionMatch,
    acceptedByKey: undefined,
    acceptedAt: null,
    sourceFileId,
    githubRef: input.githubRef,
  };
}
