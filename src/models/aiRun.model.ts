// AI Run document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.14. A uniform log of every
// Claude/OpenAI invocation & analysis. Extends BaseDocument. Phase 6 defines
// shape + pure validators only; no I/O.

import { ObjectId } from 'mongodb';
import type { BaseDocument, PolymorphicRef } from '@/src/models/base';
import {
  AI_ENGINE,
  AI_STATUS,
  AI_ACTION_TYPE,
  type AiEngine,
  type AiStatus,
  type AiActionType,
} from '@/src/constants/enums';

/** An AI Run as stored in GovernanceDB.aiRuns. */
export interface AiRunDoc extends BaseDocument {
  engine: AiEngine;
  model?: string;
  actionType: AiActionType;
  /** What the run acted on (polymorphic). */
  subject: PolymorphicRef;
  status: AiStatus;
  startedAt: Date;
  completedAt?: Date | null;
  promptText?: string;
  outputText?: string;
  /** Pointer to offloaded large output in object storage. */
  outputStorageRef?: { provider?: string; bucket?: string; key?: string };
  errorText?: string;
  /** → aiExchanges._id. */
  exchangeId?: ObjectId;
}

export interface CreateAiRunInput {
  engine: AiEngine;
  actionType: AiActionType;
  subject: { collection: string; id: string | ObjectId; field?: string };
  model?: string;
  status?: AiStatus;
  startedAt?: Date;
  completedAt?: Date;
  promptText?: string;
  outputText?: string;
  outputStorageRef?: { provider?: string; bucket?: string; key?: string };
  errorText?: string;
  exchangeId?: string | ObjectId;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCreateAiRunInput(input: CreateAiRunInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (!AI_ENGINE.includes(input.engine)) {
    errors.push(`engine must be one of: ${AI_ENGINE.join(', ')}`);
  }
  if (!AI_ACTION_TYPE.includes(input.actionType)) {
    errors.push(`actionType must be one of: ${AI_ACTION_TYPE.join(', ')}`);
  }
  if (!input.subject || typeof input.subject.collection !== 'string' || input.subject.id === undefined) {
    errors.push('subject is required and must have { collection, id }');
  }
  if (input.status !== undefined && !AI_STATUS.includes(input.status)) {
    errors.push(`status must be one of: ${AI_STATUS.join(', ')}`);
  }
  if (input.exchangeId !== undefined
    && !(input.exchangeId instanceof ObjectId)
    && !ObjectId.isValid(String(input.exchangeId))) {
    errors.push('exchangeId, when provided, must be a valid ObjectId');
  }
  return { ok: errors.length === 0, errors };
}

function coerceId(id: string | ObjectId): ObjectId | string {
  if (id instanceof ObjectId) return id;
  return ObjectId.isValid(id) ? new ObjectId(id) : id;
}

export function toAiRunFields(
  input: CreateAiRunInput,
): Omit<AiRunDoc, keyof BaseDocument | '_id'> {
  return {
    engine: input.engine,
    model: input.model,
    actionType: input.actionType,
    subject: {
      collection: input.subject.collection,
      id: coerceId(input.subject.id),
      field: input.subject.field,
    },
    status: input.status ?? 'PENDING',
    startedAt: input.startedAt ?? new Date(),
    completedAt: input.completedAt ?? null,
    promptText: input.promptText,
    outputText: input.outputText,
    outputStorageRef: input.outputStorageRef,
    errorText: input.errorText,
    exchangeId: input.exchangeId
      ? (input.exchangeId instanceof ObjectId ? input.exchangeId : new ObjectId(String(input.exchangeId)))
      : undefined,
  };
}
