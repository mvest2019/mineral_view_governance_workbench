// Source Material service — business logic for the Source Material upload.
//
// Validates the edge input, stamps uploadedAt/uploadedBy, and persists one
// document per uploaded Markdown file. Isolated: it uses only the
// SourceMaterialRepository and never touches other modules.

import { SourceMaterialRepository } from '@/src/repositories/source_material.repository';
import {
  toSourceMaterialFields,
  validateCreateSourceMaterialInput,
  type CreateSourceMaterialInput,
  type SourceMaterialDoc,
} from '@/src/models/source_material.model';
import type { WithId } from 'mongodb';

/** Raised when input fails edge validation. */
export class SourceMaterialValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid source material input: ${errors.join('; ')}`);
    this.name = 'SourceMaterialValidationError';
    this.errors = errors;
  }
}

export class SourceMaterialService {
  private readonly repo: SourceMaterialRepository;

  constructor(repo?: SourceMaterialRepository) {
    this.repo = repo ?? new SourceMaterialRepository();
  }

  /** Validate + persist one uploaded Markdown file. Returns the stored document. */
  async createSourceMaterial(input: CreateSourceMaterialInput, actor: string): Promise<SourceMaterialDoc> {
    const result = validateCreateSourceMaterialInput(input);
    if (!result.ok) throw new SourceMaterialValidationError(result.errors);
    const fields = toSourceMaterialFields(input, new Date(), actor);
    return this.repo.create(fields, actor);
  }

  /** List recent uploads for the company (newest first). */
  async listRecent(limit = 50): Promise<WithId<SourceMaterialDoc>[]> {
    return this.repo.listRecent(limit);
  }
}
