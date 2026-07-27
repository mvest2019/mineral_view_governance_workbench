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
// Meeting embedded action-item status (V1 spec §3.9).
export const ACTION_ITEM_STATUS = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const;
// Inline meeting AI-summary status (V1 spec §3.9 summary).
export const MEETING_SUMMARY_STATUS = ['NONE', 'DRAFT', 'FINAL'] as const;
// Meeting file kind (V1 spec §3.10).
export const MEETING_FILE_KIND = ['NOTES', 'TRANSCRIPT', 'AUDIO', 'OTHER'] as const;
// Suggested meeting types (free label — NOT enforced as an enum; default "other").
export const MEETING_TYPES = ['standup', 'review', 'governance', 'one_on_one', 'other'] as const;
// AI run action types (V1 spec §3.14).
export const AI_ACTION_TYPE = [
  'SUMMARY', 'ANALYSIS', 'GENERATE_QUESTIONS', 'PARSE_ANSWERS', 'CHAT', 'CLASSIFY', 'FOLLOW_UP',
] as const;
// Repository classification approval status (V1 spec §3.11).
export const REPO_APPROVAL_STATUS = ['PENDING', 'APPROVED', 'REJECTED'] as const;
// Finding review decision (V1 spec §3.12).
export const FINDING_DECISION = ['OPEN', 'REVIEWED', 'ACCEPTED', 'REJECTED'] as const;
// Preferred AI engine for an attachment's analysis (V1 spec §3.16).
export const AI_PREFERENCE = ['CLAUDE', 'OPENAI'] as const;
// Audit log outcome (V1 spec §3.17).
export const AUDIT_OUTCOME = ['SUCCESS', 'DENIED', 'ERROR'] as const;
// Repository categories (reference list from lib/config REPO_CATEGORIES — free
// label, NOT enum-enforced since categories are config-driven and evolve).
export const REPO_CATEGORIES = [
  'Pricing', 'Vendor Feeds', 'Payments / Finance', 'Tax / Compliance', 'Orders / Checkout',
  'Shipping / Fulfillment', 'Notifications / Email', 'Customer / CRM / Marketing', 'Web / Storefront',
  'Mobile', 'Analytics / ML', 'Admin / Ops', 'Governance / Legal', 'Unknown',
] as const;

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
export type ActionItemStatus = (typeof ACTION_ITEM_STATUS)[number];
export type MeetingSummaryStatus = (typeof MEETING_SUMMARY_STATUS)[number];
export type MeetingFileKind = (typeof MEETING_FILE_KIND)[number];
export type AiActionType = (typeof AI_ACTION_TYPE)[number];
export type RepoApprovalStatus = (typeof REPO_APPROVAL_STATUS)[number];
export type FindingDecision = (typeof FINDING_DECISION)[number];
export type AiPreference = (typeof AI_PREFERENCE)[number];
export type AuditOutcome = (typeof AUDIT_OUTCOME)[number];

/** The one and only company discriminator value in V1 (single-company app). */
export const DEFAULT_COMPANY_KEY = 'MView';
