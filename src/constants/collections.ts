// Canonical collection names for the Version 1 specification.
//
// This is a NAME REGISTRY only — declaring a name here does not create anything
// in MongoDB. Collections are created lazily on first write in later phases as
// each V1 collection is implemented. Centralizing the names here avoids magic
// strings and gives one place to see the full V1 surface.
//
// Source of truth: docs/MONGODB_V1_SPECIFICATION.md §1.

export const COLLECTIONS = {
  EMPLOYEES: 'employees',
  ROLES: 'roles',
  DEPARTMENTS: 'departments',
  TASK_TRACKER_ENTRIES: 'taskTrackerEntries',
  PRIORITY_QUESTIONS: 'priorityQuestions',
  ANSWERS: 'answers',
  QUESTION_ASSIGNMENTS: 'questionAssignments',
  REPO_QUESTIONS: 'repoQuestions',
  MEETINGS: 'meetings',
  MEETING_FILES: 'meetingFiles',
  REPOSITORIES: 'repositories',
  FINDINGS: 'findings',
  INTAKES: 'intakes',
  AI_RUNS: 'aiRuns',
  AI_EXCHANGES: 'aiExchanges',
  ATTACHMENTS: 'attachments',
  AUDIT_LOGS: 'auditLogs',
  SETTINGS: 'settings',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** All V1 collection names as an array (useful for future provisioning). */
export const ALL_COLLECTION_NAMES: CollectionName[] = Object.values(COLLECTIONS);
