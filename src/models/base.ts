// Reusable base model utilities.
//
// Every V1 collection document shares the "base envelope" from
// docs/MONGODB_V1_SPECIFICATION.md §2.2. These types and helpers let later
// phases build each collection's document type on top of a consistent,
// audited, soft-deletable base without repeating the boilerplate.
//
// Phase 1 provides the shapes and pure helpers only. No document is written and
// no collection is created here.

import { ObjectId } from 'mongodb';
import { DEFAULT_COMPANY_KEY } from '@/src/constants/enums';

/**
 * The audit + tenancy envelope present on every business document.
 * `createdBy`/`updatedBy`/`deletedBy` are employeeKey strings in V1 (identity is
 * self-asserted today); they become user references only if a separate users
 * collection is introduced in a future phase.
 */
export interface BaseDocument {
  _id?: ObjectId;
  /** Single-company discriminator (indexed on every collection). */
  companyKey: string;

  createdAt: Date;
  createdBy: string; // employeeKey | "system" | "migration"
  updatedAt: Date;
  updatedBy: string;

  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;

  /** Optimistic-concurrency counter. */
  version: number;

  /** Optional forward-compatible extension bag. */
  metadata?: Record<string, unknown>;
}

/**
 * A polymorphic pointer to any document in any collection — used by cross-cutting
 * collections (attachments.target, auditLogs.target, aiRuns.subject). `id` may be
 * an ObjectId (the usual case) or a natural-key string.
 */
export interface PolymorphicRef {
  collection: string;
  id: ObjectId | string;
  /** Optional sub-location within the target (e.g. a field or section). */
  field?: string;
}

/** Actor performing a write. Defaults to a system actor for jobs/migrations. */
export const SYSTEM_ACTOR = 'system' as const;
export const MIGRATION_ACTOR = 'migration' as const;

/**
 * Build the envelope for a brand-new document. Callers spread this into their
 * collection-specific fields:
 *   const doc = { ...newBaseDocument({ actor }), ...fields };
 */
export function newBaseDocument(opts?: {
  actor?: string;
  companyKey?: string;
  now?: Date;
}): BaseDocument {
  const now = opts?.now ?? new Date();
  const actor = opts?.actor ?? SYSTEM_ACTOR;
  return {
    companyKey: opts?.companyKey ?? DEFAULT_COMPANY_KEY,
    createdAt: now,
    createdBy: actor,
    updatedAt: now,
    updatedBy: actor,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    version: 1,
  };
}

/**
 * Build the `$set`/`$inc` update fragment for an audited update: refresh
 * updatedAt/updatedBy and bump the version. Returns the pieces so the caller can
 * merge them with their own field updates.
 */
export function auditedUpdate(opts?: {
  actor?: string;
  now?: Date;
}): { set: Pick<BaseDocument, 'updatedAt' | 'updatedBy'>; inc: { version: 1 } } {
  const now = opts?.now ?? new Date();
  return {
    set: { updatedAt: now, updatedBy: opts?.actor ?? SYSTEM_ACTOR },
    inc: { version: 1 },
  };
}

/** Build the `$set` fragment that soft-deletes a document. */
export function softDeletePatch(opts?: {
  actor?: string;
  now?: Date;
}): Pick<BaseDocument, 'isDeleted' | 'deletedAt' | 'deletedBy' | 'updatedAt' | 'updatedBy'> {
  const now = opts?.now ?? new Date();
  const actor = opts?.actor ?? SYSTEM_ACTOR;
  return {
    isDeleted: true,
    deletedAt: now,
    deletedBy: actor,
    updatedAt: now,
    updatedBy: actor,
  };
}

/** Standard filter fragment that excludes soft-deleted documents. */
export const NOT_DELETED = { isDeleted: false } as const;
