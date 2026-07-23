// Meeting File document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.10. Binary content (notes,
// transcripts, .webm voice memos) lives in an OBJECT STORE; this document only
// holds metadata + a storageRef pointer (never the bytes — 16 MB doc cap).
//
// Phase 5 defines the shape and pure validators only. No I/O here.

import { ObjectId } from 'mongodb';
import type { BaseDocument } from '@/src/models/base';
import { MEETING_FILE_KIND, type MeetingFileKind } from '@/src/constants/enums';

/** Pointer to the binary in the object store (never the bytes themselves). */
export interface StorageRef {
  provider?: string; // e.g. "s3" | "gcs" | "atlas"
  bucket?: string;
  key?: string;
}

/** A Meeting File as stored in GovernanceDB.meetingFiles. */
export interface MeetingFileDoc extends BaseDocument {
  /** → meetings._id. */
  meetingId: ObjectId;
  originalFilename: string;
  storageRef: StorageRef;
  mimeType?: string;
  sizeBytes?: number;
  kind: MeetingFileKind;
  transcriptText?: string;
  /** → aiRuns._id (analysis of this file). */
  analysisRunId?: ObjectId;
}

/** Fields a caller supplies to register a meeting file (envelope added by repo). */
export interface CreateMeetingFileInput {
  meetingId: string | ObjectId;
  originalFilename: string;
  storageRef: StorageRef;
  kind?: MeetingFileKind;
  mimeType?: string;
  sizeBytes?: number;
  transcriptText?: string;
  analysisRunId?: string | ObjectId;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Validate a CreateMeetingFileInput. Pure — performs no I/O. */
export function validateCreateMeetingFileInput(input: CreateMeetingFileInput): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['input must be an object'] };
  }
  if (!(input.meetingId instanceof ObjectId) && !ObjectId.isValid(String(input.meetingId))) {
    errors.push('meetingId is required and must be a valid ObjectId');
  }
  if (typeof input.originalFilename !== 'string' || input.originalFilename.trim().length === 0) {
    errors.push('originalFilename is required and must be a non-empty string');
  }
  if (!input.storageRef || typeof input.storageRef !== 'object') {
    errors.push('storageRef is required and must be an object');
  }
  if (input.kind !== undefined && !MEETING_FILE_KIND.includes(input.kind)) {
    errors.push(`kind must be one of: ${MEETING_FILE_KIND.join(', ')}`);
  }
  if (input.sizeBytes !== undefined && (typeof input.sizeBytes !== 'number' || input.sizeBytes < 0)) {
    errors.push('sizeBytes, when provided, must be a non-negative number');
  }
  if (
    input.analysisRunId !== undefined
    && !(input.analysisRunId instanceof ObjectId)
    && !ObjectId.isValid(String(input.analysisRunId))
  ) {
    errors.push('analysisRunId, when provided, must be a valid ObjectId');
  }

  return { ok: errors.length === 0, errors };
}

/** Normalize into non-envelope document fields (defaults: kind OTHER). Pure. */
export function toMeetingFileFields(
  input: CreateMeetingFileInput,
): Omit<MeetingFileDoc, keyof BaseDocument | '_id'> {
  const meetingId = input.meetingId instanceof ObjectId
    ? input.meetingId
    : new ObjectId(String(input.meetingId));
  const analysisRunId = input.analysisRunId
    ? (input.analysisRunId instanceof ObjectId ? input.analysisRunId : new ObjectId(String(input.analysisRunId)))
    : undefined;
  return {
    meetingId,
    originalFilename: input.originalFilename,
    storageRef: input.storageRef,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    kind: input.kind ?? 'OTHER',
    transcriptText: input.transcriptText,
    analysisRunId,
  };
}
