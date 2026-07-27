// Attachment service — business logic for the Attachments module.
// Phase 6: defined but NOT wired to any API route or existing app code. No data
// inserted, no bytes stored (bytes live in the object store; this records metadata).

import { AttachmentRepository } from '@/src/repositories/attachment.repository';
import {
  toAttachmentFields,
  validateCreateAttachmentInput,
  type CreateAttachmentInput,
  type AttachmentDoc,
} from '@/src/models/attachment.model';
import type { ObjectId, WithId } from 'mongodb';

export class AttachmentValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid attachment: ${errors.join('; ')}`); this.name = 'AttachmentValidationError'; this.errors = errors; }
}
export class AttachmentNotFoundError extends Error {
  constructor(id: string) { super(`No attachment found for id "${id}".`); this.name = 'AttachmentNotFoundError'; }
}

export class AttachmentService {
  private readonly repo: AttachmentRepository;
  constructor(repo?: AttachmentRepository) { this.repo = repo ?? new AttachmentRepository(); }

  /** Register a file's metadata (bytes already stored by the caller). */
  async registerAttachment(input: CreateAttachmentInput, actor: string): Promise<AttachmentDoc> {
    const result = validateCreateAttachmentInput(input);
    if (!result.ok) throw new AttachmentValidationError(result.errors);
    return this.repo.create(toAttachmentFields(input), actor);
  }

  async getById(id: string): Promise<WithId<AttachmentDoc> | null> { return this.repo.findById(id); }
  async listByTarget(targetCollection: string, targetId: string | ObjectId): Promise<WithId<AttachmentDoc>[]> {
    return this.repo.listByTarget(targetCollection, targetId);
  }
  async findDuplicates(checksum: string): Promise<WithId<AttachmentDoc>[]> { return this.repo.findByChecksum(checksum); }

  async deleteAttachment(id: string, actor: string): Promise<boolean> {
    const current = await this.repo.findById(id);
    if (!current) throw new AttachmentNotFoundError(id);
    return this.repo.softDelete(id, actor);
  }
}
