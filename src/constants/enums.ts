// Shared enum value sets — the single source of truth for validation.
//
// Source: docs/MONGODB_V1_SPECIFICATION.md §2.3. In later phases these feed both
// the edge (Zod/DTO) validators and the database $jsonSchema validators so the
// two never drift. Phase 1 only defines them; nothing consumes them yet.

export const PRIORITY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const QUESTION_STATUS = ['NEW', 'OPEN', 'ANSWERED', 'ACCEPTED', 'CLOSED'] as const;
export const TASK_STATUS = ['DRAFT', 'SUBMITTED', 'REVIEWED'] as const;
export const APPROVAL_STATUS = ['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED'] as const;
export const CONFIDENCE = ['LOW', 'MEDIUM', 'HIGH'] as const;
export const AI_ENGINE = ['CLAUDE', 'OPENAI', 'HEURISTIC'] as const;
export const AI_STATUS = ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED'] as const;
export const ENTITY_STATUS = ['ACTIVE', 'INACTIVE', 'OFFBOARDED'] as const;
export const ROLE_KEY = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'VIEWER'] as const;
export const AUDIT_CATEGORY = ['SECURITY', 'ACTIVITY'] as const;
export const CHANGE_SOURCE = ['UI', 'API', 'MIGRATION', 'AI', 'SYSTEM', 'INTEGRATION'] as const;
// Origin of a question (V1 spec §3.5).
export const QUESTION_SOURCE = ['MANUAL', 'AI_GENERATED', 'FILE', 'MEETING'] as const;
// Which question family an answer/assignment refers to (V1 spec §3.6/§3.7).
export const QUESTION_KIND = ['PRIORITY', 'REPO'] as const;
// How an answer was linked back to its question (V1 spec §3.6 questionMatch).
export const ANSWER_MATCH_STRATEGY = ['QID', 'FUZZY_TITLE', 'MANUAL', 'UNLINKED'] as const;

export type Priority = (typeof PRIORITY)[number];
export type QuestionStatus = (typeof QUESTION_STATUS)[number];
export type TaskStatus = (typeof TASK_STATUS)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUS)[number];
export type Confidence = (typeof CONFIDENCE)[number];
export type AiEngine = (typeof AI_ENGINE)[number];
export type AiStatus = (typeof AI_STATUS)[number];
export type EntityStatus = (typeof ENTITY_STATUS)[number];
export type RoleKey = (typeof ROLE_KEY)[number];
export type AuditCategory = (typeof AUDIT_CATEGORY)[number];
export type ChangeSource = (typeof CHANGE_SOURCE)[number];
export type QuestionSource = (typeof QUESTION_SOURCE)[number];
export type QuestionKind = (typeof QUESTION_KIND)[number];
export type AnswerMatchStrategy = (typeof ANSWER_MATCH_STRATEGY)[number];

/** The one and only company discriminator value in V1 (single-company app). */
export const DEFAULT_COMPANY_KEY = 'MView';
