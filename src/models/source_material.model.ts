// Source Material document type + edge validation.
//
// Backs the "Source Material" upload feature: one document per uploaded Markdown
// (.md) file, storing the complete file content in GovernanceDB.sourceMaterials.
// Extends the shared BaseDocument envelope (companyKey + audit + soft delete +
// version), exactly like the other V1 collections. Fully isolated — nothing
// here reads or writes any other collection.

import type { BaseDocument } from '@/src/models/base';

/** Lifecycle status for an uploaded source-material document. */
export const SOURCE_MATERIAL_STATUS = ['active', 'archived', 'deleted'] as const;
export type SourceMaterialStatus = (typeof SOURCE_MATERIAL_STATUS)[number];

/** A Source Material document as stored in GovernanceDB.sourceMaterials. */
export interface SourceMaterialDoc extends BaseDocument {
  /** App member key of the selected employee, e.g. "Aboli_Mundralkar". */
  employeeKey: string;
  /** Human display name of the selected employee. */
  employeeName: string;
  /** Stored file name (normalized, always ends in .md). */
  fileName: string;
  /** The file name exactly as the user uploaded it. */
  originalFileName: string;
  /** The entire Markdown file content. */
  content: string;
  /** Byte length of the content (UTF-8). */
  contentBytes: number;
  /** When the file was uploaded. */
  uploadedAt: Date;
  /** Who uploaded it (actor). */
  uploadedBy: string;
  status: SourceMaterialStatus;
}

/** Fields a caller supplies to create a source material (envelope added by the repo). */
export interface CreateSourceMaterialInput {
  employeeKey: string;
  employeeName: string;
  fileName: string;
  originalFileName?: string;
  content: string;
  uploadedBy?: string;
  status?: SourceMaterialStatus;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/** Validate a CreateSourceMaterialInput. Pure — performs no I/O. */
export function validateCreateSourceMaterialInput(input: CreateSourceMaterialInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['input must be an object'] };
  }
  if (typeof input.employeeKey !== 'string' || input.employeeKey.trim().length === 0) {
    errors.push('employeeKey is required (select an employee)');
  }
  if (typeof input.employeeName !== 'string' || input.employeeName.trim().length === 0) {
    errors.push('employeeName is required');
  }
  if (typeof input.fileName !== 'string' || !/\.md$/i.test(input.fileName.trim())) {
    errors.push('fileName is required and must be a Markdown (.md) file');
  }
  if (typeof input.content !== 'string' || input.content.length === 0) {
    errors.push('content is required and must be the full Markdown file content');
  }
  if (input.status !== undefined && !SOURCE_MATERIAL_STATUS.includes(input.status)) {
    errors.push(`status must be one of: ${SOURCE_MATERIAL_STATUS.join(', ')}`);
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Normalize a CreateSourceMaterialInput into the full set of non-envelope
 * document fields, applying defaults. Pure — the audit envelope + uploadedAt are
 * added by the service/repository at persist time.
 */
export function toSourceMaterialFields(
  input: CreateSourceMaterialInput,
  uploadedAt: Date,
  actor: string,
): Omit<SourceMaterialDoc, keyof BaseDocument | '_id'> {
  const fileName = input.fileName.trim();
  return {
    employeeKey: input.employeeKey.trim(),
    employeeName: input.employeeName.trim(),
    fileName,
    originalFileName: (input.originalFileName || input.fileName).trim(),
    content: input.content,
    contentBytes: Buffer.byteLength(input.content, 'utf8'),
    uploadedAt,
    uploadedBy: input.uploadedBy?.trim() || actor,
    status: input.status ?? 'active',
  };
}
