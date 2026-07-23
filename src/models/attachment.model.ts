// Attachment document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.16. Generic file registry for
// any entity (polymorphic target). Binaries live in an OBJECT STORE; this
// document holds metadata + a storageRef pointer only. Extends BaseDocument.
// Phase 6 defines shape + pure validators only; no I/O.

import { ObjectId } from 'mongodb';
import type { BaseDocument, PolymorphicRef } from '@/src/models/base';
import { AI_PREFERENCE, type AiPreference } from '@/src/constants/enums';

/** An Attachment as stored in GovernanceDB.attachments. */
export interface AttachmentDoc extends BaseDocument {
  /** The entity this file belongs to (polymorphic). */
  target: PolymorphicRef;
  originalFilename: string;
  storageRef: { provider?: string; bucket?: string; key?: string };
  mimeType?: string;
  sizeBytes?: number;
  filePurpose?: string;
  checksum?: string;
  /** → employees.memberKey. */
  uploadedByKey?: string;
  aiPreference?: AiPreference;
  /** → aiRuns._id. */
  analysisRunIds: ObjectId[];
}

export interface CreateAttachmentInput {
  target: { collection: string; id: string | ObjectId; field?: string };
  originalFilename: string;
  storageRef: { provider?: string; bucket?: string; key?: string };
  mimeType?: string;
  sizeBytes?: number;
  filePurpose?: string;
  checksum?: string;
  uploadedByKey?: string;
  aiPreference?: AiPreference;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCreateAttachmentInput(input: CreateAttachmentInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (!input.target || typeof input.target.collection !== 'string' || input.target.id === undefined) {
    errors.push('target is required and must have { collection, id }');
  }
  if (typeof input.originalFilename !== 'string' || input.originalFilename.trim().length === 0) {
    errors.push('originalFilename is required and must be a non-empty string');
  }
  if (!input.storageRef || typeof input.storageRef !== 'object') {
    errors.push('storageRef is required and must be an object');
  }
  if (input.aiPreference !== undefined && !AI_PREFERENCE.includes(input.aiPreference)) {
    errors.push(`aiPreference must be one of: ${AI_PREFERENCE.join(', ')}`);
  }
  if (input.sizeBytes !== undefined && (typeof input.sizeBytes !== 'number' || input.sizeBytes < 0)) {
    errors.push('sizeBytes, when provided, must be a non-negative number');
  }
  return { ok: errors.length === 0, errors };
}

function coerceId(id: string | ObjectId): ObjectId | string {
  if (id instanceof ObjectId) return id;
  return ObjectId.isValid(id) ? new ObjectId(id) : id;
}

export function toAttachmentFields(
  input: CreateAttachmentInput,
): Omit<AttachmentDoc, keyof BaseDocument | '_id'> {
  return {
    target: {
      collection: input.target.collection,
      id: coerceId(input.target.id),
      field: input.target.field,
    },
    originalFilename: input.originalFilename,
    storageRef: input.storageRef,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    filePurpose: input.filePurpose,
    checksum: input.checksum,
    uploadedByKey: input.uploadedByKey,
    aiPreference: input.aiPreference,
    analysisRunIds: [],
  };
}
