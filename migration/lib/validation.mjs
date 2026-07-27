// Validation pipeline. Mirrors the collection $jsonSchema + edge validators so a
// candidate document is checked BEFORE it would ever be inserted. Pure — no I/O.
//
// Each validator returns { ok, errors, warnings }. The dry-run uses only this
// layer (it never connects to MongoDB); the $jsonSchema layer runs during the
// (future) execution phase.

import { ENUMS } from '../config.mjs';

const SLUG_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/;
const QCODE_RE = /^Q-[A-Z0-9-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function req(doc, field, errors) {
  if (doc[field] === undefined || doc[field] === null || doc[field] === '') {
    errors.push(`missing required field: ${field}`);
  }
}
function enumOk(value, allowed, field, errors) {
  if (value !== undefined && !allowed.includes(value)) {
    errors.push(`invalid ${field}: "${value}" (allowed: ${allowed.join('|')})`);
  }
}

const VALIDATORS = {
  employees(doc, errors, warnings) {
    req(doc, 'memberKey', errors); req(doc, 'fullName', errors);
    if (doc.memberKey && !SLUG_RE.test(doc.memberKey)) errors.push(`memberKey not a slug: ${doc.memberKey}`);
    if (doc.email && !EMAIL_RE.test(doc.email)) errors.push(`invalid email: ${doc.email}`);
    enumOk(doc.status, ENUMS.ENTITY_STATUS, 'status', errors);
    if (Array.isArray(doc.roleKeys)) doc.roleKeys.forEach((r) => enumOk(r, ENUMS.ROLE_KEY, 'roleKey', errors));
    if (!doc.departmentKeys || doc.departmentKeys.length === 0) warnings.push(`employee ${doc.memberKey} has no departmentKeys`);
  },
  taskTrackerEntries(doc, errors, warnings) {
    req(doc, 'employeeKey', errors); req(doc, 'entryDate', errors); req(doc, 'title', errors);
    if (doc.employeeKey && !SLUG_RE.test(doc.employeeKey)) errors.push(`employeeKey not a slug: ${doc.employeeKey}`);
    enumOk(doc.status, ENUMS.TASK_STATUS, 'status', errors);
    if (!(doc.entryDate instanceof Date)) errors.push('entryDate is not a Date');
    if (!doc.bodyMarkdown) warnings.push('task entry has empty bodyMarkdown');
  },
  priorityQuestions(doc, errors) {
    req(doc, 'questionCode', errors); req(doc, 'bodyMarkdown', errors);
    if (doc.questionCode && !QCODE_RE.test(doc.questionCode)) errors.push(`questionCode not ^Q-[A-Z0-9-]+$: ${doc.questionCode}`);
    enumOk(doc.priority, ENUMS.PRIORITY, 'priority', errors);
    enumOk(doc.status, ENUMS.QUESTION_STATUS, 'status', errors);
    enumOk(doc.source, ENUMS.QUESTION_SOURCE, 'source', errors);
    if (doc.targetEmployeeKey && !SLUG_RE.test(doc.targetEmployeeKey)) errors.push(`targetEmployeeKey not a slug: ${doc.targetEmployeeKey}`);
  },
  answers(doc, errors) {
    req(doc, 'questionCode', errors); req(doc, 'answerMarkdown', errors); req(doc, 'answeredAt', errors);
    enumOk(doc.questionKind, ENUMS.QUESTION_KIND, 'questionKind', errors);
    if (doc.answeredByKey && !SLUG_RE.test(doc.answeredByKey)) errors.push(`answeredByKey not a slug: ${doc.answeredByKey}`);
    if (doc.questionMatch) {
      enumOk(doc.questionMatch.strategy, ENUMS.ANSWER_MATCH_STRATEGY, 'questionMatch.strategy', errors);
      enumOk(doc.questionMatch.confidence, ENUMS.CONFIDENCE, 'questionMatch.confidence', errors);
    }
  },
  meetings(doc, errors, warnings) {
    req(doc, 'title', errors); req(doc, 'meetingAt', errors); req(doc, 'meetingType', errors);
    if (!(doc.meetingAt instanceof Date)) errors.push('meetingAt is not a Date');
    if (doc.summary) enumOk(doc.summary.status, ENUMS.MEETING_SUMMARY_STATUS, 'summary.status', errors);
    (doc.attendees || []).forEach((a, i) => {
      if (!a.employeeKey && !a.externalName) errors.push(`attendees[${i}] has neither employeeKey nor externalName`);
      if (a.employeeKey && !SLUG_RE.test(a.employeeKey)) warnings.push(`attendees[${i}].employeeKey not a slug: ${a.employeeKey}`);
    });
    (doc.actionItems || []).forEach((it, i) => {
      if (!it.description) errors.push(`actionItems[${i}].description missing`);
      enumOk(it.status, ENUMS.ACTION_ITEM_STATUS, `actionItems[${i}].status`, errors);
    });
  },
  repositories(doc, errors) {
    req(doc, 'name', errors);
    if (doc.classification) {
      enumOk(doc.classification.confidence, ENUMS.CONFIDENCE, 'classification.confidence', errors);
      enumOk(doc.classification.approvalStatus, ENUMS.REPO_APPROVAL_STATUS, 'classification.approvalStatus', errors);
    }
  },
  roles(doc, errors) {
    req(doc, 'key', errors); req(doc, 'name', errors);
    if (doc.key && !/^[A-Z][A-Z0-9_]*$/.test(doc.key)) errors.push(`key not UPPER_SNAKE: ${doc.key}`);
  },
  departments(doc, errors) {
    req(doc, 'key', errors); req(doc, 'name', errors);
    if (doc.key && !/^[A-Z][A-Z0-9_]*$/.test(doc.key)) errors.push(`key not UPPER_SNAKE: ${doc.key}`);
  },
  settings(doc, errors) {
    req(doc, 'scope', errors); req(doc, 'key', errors); req(doc, 'ownerKey', errors);
    if (doc.scope && !['APP', 'USER'].includes(doc.scope)) errors.push(`scope must be APP|USER: ${doc.scope}`);
  },
  findings(doc, errors) {
    req(doc, 'findingCode', errors);
    if (doc.findingCode && !/^F-[0-9-]+$/.test(doc.findingCode)) errors.push(`findingCode not ^F-[0-9-]+$: ${doc.findingCode}`);
    enumOk(doc.decision, ENUMS.FINDING_DECISION, 'decision', errors);
    if (doc.reviewerKey && !SLUG_RE.test(doc.reviewerKey)) errors.push(`reviewerKey not a slug: ${doc.reviewerKey}`);
  },
  repoQuestions(doc, errors) {
    req(doc, 'questionCode', errors); req(doc, 'repoName', errors); req(doc, 'bodyMarkdown', errors);
    enumOk(doc.priority, ENUMS.PRIORITY, 'priority', errors);
    enumOk(doc.status, ENUMS.QUESTION_STATUS, 'status', errors);
    enumOk(doc.source, ENUMS.QUESTION_SOURCE, 'source', errors);
  },
  questionAssignments(doc, errors) {
    req(doc, 'questionCode', errors); req(doc, 'assigneeKey', errors);
    enumOk(doc.questionKind, ENUMS.QUESTION_KIND, 'questionKind', errors);
    if (doc.assigneeKey && !SLUG_RE.test(doc.assigneeKey)) errors.push(`assigneeKey not a slug: ${doc.assigneeKey}`);
  },
  meetingFiles(doc, errors) {
    req(doc, 'meetingId', errors); req(doc, 'originalFilename', errors); req(doc, 'storageRef', errors);
    enumOk(doc.kind, ENUMS.MEETING_FILE_KIND, 'kind', errors);
  },
  intakes(doc, errors) {
    req(doc, 'stage', errors);
    if (doc.employeeKey && !SLUG_RE.test(doc.employeeKey)) errors.push(`employeeKey not a slug: ${doc.employeeKey}`);
    (doc.gates || []).forEach((g, i) => enumOk(g.status, ENUMS.APPROVAL_STATUS, `gates[${i}].status`, errors));
  },
  aiRuns(doc, errors) {
    enumOk(doc.engine, ENUMS.AI_ENGINE, 'engine', errors);
    enumOk(doc.actionType, ENUMS.AI_ACTION_TYPE, 'actionType', errors);
    enumOk(doc.status, ENUMS.AI_STATUS, 'status', errors);
    if (!doc.subject || !doc.subject.collection || doc.subject.id === undefined) errors.push('subject {collection,id} required');
    if (!(doc.startedAt instanceof Date)) errors.push('startedAt is not a Date');
  },
  aiExchanges(doc, errors) {
    req(doc, 'intakeId', errors); req(doc, 'status', errors);
  },
  attachments(doc, errors) {
    if (!doc.target || !doc.target.collection || doc.target.id === undefined) errors.push('target {collection,id} required');
    req(doc, 'originalFilename', errors); req(doc, 'storageRef', errors);
    enumOk(doc.aiPreference, ENUMS.AI_PREFERENCE, 'aiPreference', errors);
  },
  auditLogs(doc, errors) {
    enumOk(doc.category, ENUMS.AUDIT_CATEGORY, 'category', errors);
    req(doc, 'actorKey', errors); req(doc, 'action', errors);
    if (!(doc.at instanceof Date)) errors.push('at is not a Date');
    enumOk(doc.outcome, ENUMS.AUDIT_OUTCOME, 'outcome', errors);
  },
};

/** Validate a candidate document for a collection. */
export function validateDocument(collection, doc) {
  const errors = []; const warnings = [];
  const fn = VALIDATORS[collection];
  if (!fn) { errors.push(`no validator for collection ${collection}`); return { ok: false, errors, warnings }; }
  fn(doc, errors, warnings);
  return { ok: errors.length === 0, errors, warnings };
}
