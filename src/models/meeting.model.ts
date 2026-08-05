// Meeting document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.9. Attendees and action items
// are EMBEDDED arrays (bounded, always read with the meeting). The AI summary is
// an inline snapshot. Binary files live in meetingFiles (referenced by id).
//
// Phase 5 defines the shape and pure validators only. Nothing here connects to
// MongoDB, reads, writes, or migrates any GitHub markdown.

import { ObjectId } from 'mongodb';
import type { BaseDocument } from '@/src/models/base';
import {
  ACTION_ITEM_STATUS,
  MEETING_SUMMARY_STATUS,
  AI_ENGINE,
  type ActionItemStatus,
  type MeetingSummaryStatus,
  type AiEngine,
} from '@/src/constants/enums';

/** An embedded meeting attendee (team member or external guest). */
export interface MeetingAttendee {
  /** → employees.memberKey (internal attendee). */
  employeeKey?: string;
  externalName?: string;
  externalEmail?: string;
  attended: boolean;
  followUpDone: boolean;
  followUpNote?: string;
}

/** An embedded action item captured from the meeting. */
export interface MeetingActionItem {
  /** → employees.memberKey (owner). */
  ownerKey?: string;
  description: string;
  status: ActionItemStatus;
  dueAt?: Date | null;
}

/** Inline snapshot of the meeting's AI-generated summary. */
export interface MeetingSummary {
  text?: string;
  status: MeetingSummaryStatus;
  engine?: AiEngine;
  generatedAt?: Date | null;
}

/** A Meeting as stored in GovernanceDB.meetings. */
export interface MeetingDoc extends BaseDocument {
  title: string;
  /** Free label, default "other" (e.g. standup / review / governance). */
  meetingType: string;
  /** → employees.memberKey (organizer). */
  organizerKey?: string;
  meetingAt: Date;
  note?: string;
  attendees: MeetingAttendee[];
  actionItems: MeetingActionItem[];
  summary?: MeetingSummary;
  /** → priorityQuestions.questionCode (questions generated from the meeting). */
  priorityQuestionCodes: string[];
  /** → meetingFiles._id. */
  fileIds: ObjectId[];
}

/** Fields a caller supplies to create a meeting (envelope added by the repo). */
export interface CreateMeetingInput {
  title: string;
  meetingAt: Date;
  meetingType?: string;
  organizerKey?: string;
  note?: string;
  attendees?: Array<Partial<MeetingAttendee>>;
  actionItems?: Array<Partial<MeetingActionItem> & { description: string }>;
  summary?: Partial<MeetingSummary>;
  priorityQuestionCodes?: string[];
}

/** Mutable fields for an update (never the audit envelope). */
export type UpdateMeetingInput = Partial<CreateMeetingInput>;

// ---------------------------------------------------------------------------
// Pure edge validation + normalizers (no I/O).
// ---------------------------------------------------------------------------

const EMPLOYEE_KEY_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/** Validate a CreateMeetingInput. Pure — performs no I/O. */
export function validateCreateMeetingInput(input: CreateMeetingInput): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['input must be an object'] };
  }
  if (typeof input.title !== 'string' || input.title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string');
  }
  if (!isValidDate(input.meetingAt)) {
    errors.push('meetingAt is required and must be a valid Date');
  }
  if (input.organizerKey !== undefined && !EMPLOYEE_KEY_RE.test(String(input.organizerKey))) {
    errors.push('organizerKey, when provided, must be a lowercase slug');
  }

  (input.attendees ?? []).forEach((a, i) => {
    if (!a || typeof a !== 'object') {
      errors.push(`attendees[${i}] must be an object`);
      return;
    }
    if (!a.employeeKey && !a.externalName) {
      errors.push(`attendees[${i}] must have an employeeKey or an externalName`);
    }
    if (a.employeeKey && !EMPLOYEE_KEY_RE.test(String(a.employeeKey))) {
      errors.push(`attendees[${i}].employeeKey must be a lowercase slug`);
    }
    if (a.externalEmail && !EMAIL_RE.test(String(a.externalEmail))) {
      errors.push(`attendees[${i}].externalEmail must be a valid email`);
    }
  });

  (input.actionItems ?? []).forEach((it, i) => {
    if (!it || typeof it.description !== 'string' || it.description.trim().length === 0) {
      errors.push(`actionItems[${i}].description is required`);
    }
    if (it?.status !== undefined && !ACTION_ITEM_STATUS.includes(it.status)) {
      errors.push(`actionItems[${i}].status must be one of: ${ACTION_ITEM_STATUS.join(', ')}`);
    }
    if (it?.ownerKey && !EMPLOYEE_KEY_RE.test(String(it.ownerKey))) {
      errors.push(`actionItems[${i}].ownerKey must be a lowercase slug`);
    }
  });

  if (input.summary?.status !== undefined && !MEETING_SUMMARY_STATUS.includes(input.summary.status)) {
    errors.push(`summary.status must be one of: ${MEETING_SUMMARY_STATUS.join(', ')}`);
  }
  if (input.summary?.engine !== undefined && !AI_ENGINE.includes(input.summary.engine)) {
    errors.push(`summary.engine must be one of: ${AI_ENGINE.join(', ')}`);
  }

  return { ok: errors.length === 0, errors };
}

function normalizeAttendee(a: Partial<MeetingAttendee>): MeetingAttendee {
  return {
    employeeKey: a.employeeKey,
    externalName: a.externalName,
    externalEmail: a.externalEmail,
    attended: a.attended ?? true,
    followUpDone: a.followUpDone ?? false,
    followUpNote: a.followUpNote,
  };
}

function normalizeActionItem(
  it: Partial<MeetingActionItem> & { description: string },
): MeetingActionItem {
  return {
    ownerKey: it.ownerKey,
    description: it.description,
    status: it.status ?? 'OPEN',
    dueAt: it.dueAt ?? null,
  };
}

/**
 * Normalize into non-envelope document fields, applying V1 defaults
 * (meetingType "other", empty attendees/actionItems/questionCodes/fileIds,
 * attendee/action-item defaults). Pure — the audit envelope is added by the repo.
 */
export function toMeetingFields(
  input: CreateMeetingInput,
): Omit<MeetingDoc, keyof BaseDocument | '_id'> {
  const summary: MeetingSummary | undefined = input.summary
    ? {
        text: input.summary.text,
        status: input.summary.status ?? 'NONE',
        engine: input.summary.engine,
        generatedAt: input.summary.generatedAt ?? null,
      }
    : undefined;

  return {
    title: input.title,
    meetingType: input.meetingType ?? 'other',
    organizerKey: input.organizerKey,
    meetingAt: input.meetingAt,
    note: input.note,
    attendees: (input.attendees ?? []).map(normalizeAttendee),
    actionItems: (input.actionItems ?? []).map(normalizeActionItem),
    summary,
    priorityQuestionCodes: input.priorityQuestionCodes ?? [],
    fileIds: [],
  };
}
