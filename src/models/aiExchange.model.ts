// AI Exchange document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.15. The intake challenge-loop —
// two engines' outputs and their agreement state (kept as its own shape to
// preserve fidelity). Extends BaseDocument. Phase 6 defines shape + pure
// validators only; no I/O.

import { ObjectId } from 'mongodb';
import type { BaseDocument } from '@/src/models/base';

/** An AI Exchange as stored in GovernanceDB.aiExchanges. */
export interface AiExchangeDoc extends BaseDocument {
  /** → intakes._id. */
  intakeId: ObjectId;
  topic?: string;
  sourceEngine?: string;
  targetEngine?: string;
  status: string;
  /** → aiRuns._id. */
  sourceRunId?: ObjectId;
  sourcePrompt?: string;
  sourceOutput?: string;
  targetPrompt?: string;
  targetOutput?: string;
  agreementStatus: string;
  nextAction: string;
  errorText?: string;
}

export interface CreateAiExchangeInput {
  intakeId: string | ObjectId;
  status: string;
  topic?: string;
  sourceEngine?: string;
  targetEngine?: string;
  sourceRunId?: string | ObjectId;
  sourcePrompt?: string;
  sourceOutput?: string;
  targetPrompt?: string;
  targetOutput?: string;
  agreementStatus?: string;
  nextAction?: string;
  errorText?: string;
}

export type UpdateAiExchangeInput = Partial<Omit<CreateAiExchangeInput, 'intakeId'>>;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCreateAiExchangeInput(input: CreateAiExchangeInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (!(input.intakeId instanceof ObjectId) && !ObjectId.isValid(String(input.intakeId))) {
    errors.push('intakeId is required and must be a valid ObjectId');
  }
  if (typeof input.status !== 'string' || input.status.trim().length === 0) {
    errors.push('status is required and must be a non-empty string');
  }
  if (input.sourceRunId !== undefined
    && !(input.sourceRunId instanceof ObjectId)
    && !ObjectId.isValid(String(input.sourceRunId))) {
    errors.push('sourceRunId, when provided, must be a valid ObjectId');
  }
  return { ok: errors.length === 0, errors };
}

export function toAiExchangeFields(
  input: CreateAiExchangeInput,
): Omit<AiExchangeDoc, keyof BaseDocument | '_id'> {
  return {
    intakeId: input.intakeId instanceof ObjectId ? input.intakeId : new ObjectId(String(input.intakeId)),
    topic: input.topic,
    sourceEngine: input.sourceEngine,
    targetEngine: input.targetEngine,
    status: input.status,
    sourceRunId: input.sourceRunId
      ? (input.sourceRunId instanceof ObjectId ? input.sourceRunId : new ObjectId(String(input.sourceRunId)))
      : undefined,
    sourcePrompt: input.sourcePrompt,
    sourceOutput: input.sourceOutput,
    targetPrompt: input.targetPrompt,
    targetOutput: input.targetOutput,
    agreementStatus: input.agreementStatus ?? 'Needs review',
    nextAction: input.nextAction ?? 'Hold',
    errorText: input.errorText,
  };
}
