// Audit Log document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.17. Append-only audit trail AND
// user-facing activity feed in one collection, distinguished by `category`.
// Extends BaseDocument. Phase 6 defines shape + pure validators only; no I/O.

import type { BaseDocument, PolymorphicRef } from '@/src/models/base';
import {
  AUDIT_CATEGORY,
  AUDIT_OUTCOME,
  type AuditCategory,
  type AuditOutcome,
} from '@/src/constants/enums';

/** An Audit Log entry as stored in GovernanceDB.auditLogs (append-only). */
export interface AuditLogDoc extends BaseDocument {
  category: AuditCategory;
  /** employeeKey | "system". */
  actorKey: string;
  action: string;
  /** Human-readable verb for the activity feed (e.g. "answered"). */
  verb?: string;
  target?: PolymorphicRef;
  summary?: string;
  outcome?: AuditOutcome;
  context?: Record<string, unknown>;
  /** The event time (distinct from createdAt, which is the write time). */
  at: Date;
}

export interface CreateAuditLogInput {
  category: AuditCategory;
  actorKey: string;
  action: string;
  verb?: string;
  target?: { collection: string; id: string; field?: string };
  summary?: string;
  outcome?: AuditOutcome;
  context?: Record<string, unknown>;
  at?: Date;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCreateAuditLogInput(input: CreateAuditLogInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (!AUDIT_CATEGORY.includes(input.category)) {
    errors.push(`category must be one of: ${AUDIT_CATEGORY.join(', ')}`);
  }
  if (typeof input.actorKey !== 'string' || input.actorKey.trim().length === 0) {
    errors.push('actorKey is required and must be a non-empty string');
  }
  if (typeof input.action !== 'string' || input.action.trim().length === 0) {
    errors.push('action is required and must be a non-empty string');
  }
  if (input.outcome !== undefined && !AUDIT_OUTCOME.includes(input.outcome)) {
    errors.push(`outcome must be one of: ${AUDIT_OUTCOME.join(', ')}`);
  }
  return { ok: errors.length === 0, errors };
}

export function toAuditLogFields(
  input: CreateAuditLogInput,
): Omit<AuditLogDoc, keyof BaseDocument | '_id'> {
  return {
    category: input.category,
    actorKey: input.actorKey,
    action: input.action,
    verb: input.verb,
    target: input.target,
    summary: input.summary,
    outcome: input.outcome,
    context: input.context,
    at: input.at ?? new Date(),
  };
}
