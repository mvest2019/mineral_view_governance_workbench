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
};

/** Validate a candidate document for a collection. */
export function validateDocument(collection, doc) {
  const errors = []; const warnings = [];
  const fn = VALIDATORS[collection];
  if (!fn) { errors.push(`no validator for collection ${collection}`); return { ok: false, errors, warnings }; }
  fn(doc, errors, warnings);
  return { ok: errors.length === 0, errors, warnings };
}
