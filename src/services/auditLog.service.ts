// Audit Log service — business logic for the Audit Logs module (append-only).
// Phase 6: defined but NOT wired to any API route or existing app code. No data
// inserted. Exposes append + read only — never update or delete (immutable trail).

import { AuditLogRepository } from '@/src/repositories/auditLog.repository';
import {
  toAuditLogFields,
  validateCreateAuditLogInput,
  type CreateAuditLogInput,
  type AuditLogDoc,
} from '@/src/models/auditLog.model';
import type { AuditCategory } from '@/src/constants/enums';
import type { ObjectId, WithId } from 'mongodb';

export class AuditLogValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) { super(`Invalid audit log: ${errors.join('; ')}`); this.name = 'AuditLogValidationError'; this.errors = errors; }
}

export class AuditLogService {
  private readonly repo: AuditLogRepository;
  constructor(repo?: AuditLogRepository) { this.repo = repo ?? new AuditLogRepository(); }

  /** Append an audit/activity entry (validate + insert). (Not called in Phase 6.) */
  async record(input: CreateAuditLogInput, actor: string): Promise<AuditLogDoc> {
    const result = validateCreateAuditLogInput(input);
    if (!result.ok) throw new AuditLogValidationError(result.errors);
    return this.repo.create(toAuditLogFields(input), actor);
  }

  async listRecent(limit?: number): Promise<WithId<AuditLogDoc>[]> { return this.repo.listRecent(limit); }
  async listByTarget(targetCollection: string, targetId: string | ObjectId): Promise<WithId<AuditLogDoc>[]> {
    return this.repo.listByTarget(targetCollection, targetId);
  }
  async listByActor(actorKey: string, limit?: number): Promise<WithId<AuditLogDoc>[]> { return this.repo.listByActor(actorKey, limit); }
  async listByCategory(category: AuditCategory, limit?: number): Promise<WithId<AuditLogDoc>[]> { return this.repo.listByCategory(category, limit); }
}
