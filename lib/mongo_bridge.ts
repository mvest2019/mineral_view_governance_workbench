// MongoDB dual-write + read-fallback bridge (Phase 2 application integration).
//
// This is the ONLY seam between the existing application and the new MongoDB
// persistence layer (src/**). Design guarantees:
//
//   • GUARDED   — every operation is a no-op unless MONGODB_URI is set. When
//                 MongoDB is not configured, the app behaves EXACTLY as before.
//   • NON-FATAL — every Mongo call is wrapped in try/catch and never throws.
//                 A Mongo failure never affects the existing GitHub/SQLite flow
//                 or the HTTP response. GitHub markdown stays authoritative.
//   • ADDITIVE  — writes are dual-writes (Mongo alongside GitHub). Reads are
//                 Mongo-first with fallback to the existing source.
//   • LAZY      — the src/** services + the mongodb driver are dynamically
//                 imported only when Mongo is enabled, so the non-Mongo path
//                 loads nothing extra.
//
// Nothing here changes route URLs, request/response shapes, UI, business logic,
// validations, permissions, or the Claude/OpenAI integrations. It only changes
// where data is additionally saved/loaded.

import { slugifyName } from '@/lib/github';

const COMPANY_DEFAULT = 'MView';

/** True only when a MongoDB connection string is configured. */
export function mongoEnabled(): boolean {
  return Boolean((process.env.MONGODB_URI || '').trim());
}

function companyKeyOf(company?: string | null): string {
  return (company && String(company).trim()) || COMPANY_DEFAULT;
}

// ---------------------------------------------------------------------------
// Phase A — Employees (read Mongo-first, fallback to config)
// ---------------------------------------------------------------------------

/**
 * Return the employee key list from MongoDB, preserving the exact shape and
 * ordering of lib/helpers.list_employees (Ryan_Cochran first, then sorted), or
 * `null` to signal the caller should fall back to the existing source.
 */
export async function mongoListEmployees(company?: string | null): Promise<string[] | null> {
  if (!mongoEnabled()) return null;
  try {
    const { EmployeeRepository } = await import('@/src/repositories/employee.repository');
    const repo = new EmployeeRepository({ companyKey: companyKeyOf(company) });
    const docs = await repo.listByStatus('ACTIVE');
    if (!docs.length) return null; // nothing migrated yet → fall back

    const appKey = (d: { aliases?: string[]; fullName?: string; memberKey: string }): string => {
      const alias = (d.aliases || []).find((a) => /^[A-Za-z]+(_[A-Za-z]+)+$/.test(a));
      if (alias) return alias;
      if (d.fullName && d.fullName.trim()) return d.fullName.trim().split(/\s+/).join('_');
      return d.memberKey;
    };

    let list = [...new Set(docs.map(appKey))].sort();
    if (!list.length) return ['Ryan_Cochran'];
    if (list.includes('Ryan_Cochran')) list = ['Ryan_Cochran', ...list.filter((e) => e !== 'Ryan_Cochran')];
    else list.unshift('Ryan_Cochran');
    return list;
  } catch (err) {
    console.error('[mongo_bridge] mongoListEmployees failed (falling back):', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Task Tracker is NOT handled here anymore.
//
// Task Tracker persists DIRECTLY and ONLY to MongoDB from app/api/task_tracker
// (via TaskTrackerService), where insert errors are surfaced to the caller. The
// previous best-effort dual-write helper (mongoSaveTaskTracker) has been removed
// because MongoDB is now the single source of truth for Task Tracker.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Phase C — Priority Questions (dual-write generated questions)
// ---------------------------------------------------------------------------

export interface GeneratedQuestion {
  question_code?: string;
  title?: string;
  body?: string;
  priority?: string;
  member_key?: string;
}

/** Save Claude-generated Priority Questions into priorityQuestions. */
export async function mongoSaveGeneratedQuestions(
  company: string | null | undefined,
  created: GeneratedQuestion[] | undefined,
): Promise<void> {
  if (!mongoEnabled() || !Array.isArray(created) || !created.length) return;
  try {
    const companyKey = companyKeyOf(company);
    const { PriorityQuestionRepository } = await import('@/src/repositories/priorityQuestion.repository');
    const { PriorityQuestionService, PriorityQuestionConflictError } = await import('@/src/services/priorityQuestion.service');
    const svc = new PriorityQuestionService(new PriorityQuestionRepository({ companyKey }));
    for (const q of created) {
      const questionCode = String(q.question_code || '').trim();
      const title = String(q.title || '').trim();
      if (!questionCode || !title) continue;
      const priority = String(q.priority || 'MEDIUM').toUpperCase();
      try {
        await svc.createQuestion(
          {
            questionCode,
            title,
            bodyMarkdown: q.body || title,
            shortQuestion: title,
            targetEmployeeKey: q.member_key ? slugifyName(q.member_key) : undefined,
            priority: (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority) ? priority : 'MEDIUM') as never,
            status: 'OPEN',
            source: 'AI_GENERATED',
            generatedBy: 'claude',
          },
          'claude',
        );
      } catch (err) {
        // A duplicate code just means it is already stored — that is idempotent,
        // not an error. Anything else is logged and skipped (non-fatal).
        if (!(err instanceof PriorityQuestionConflictError)) {
          console.error(`[mongo_bridge] save generated question ${questionCode} failed:`, err);
        }
      }
    }
  } catch (err) {
    console.error('[mongo_bridge] mongoSaveGeneratedQuestions failed (non-fatal):', err);
  }
}

// ---------------------------------------------------------------------------
// Phase D — Answers (dual-write + answerCount + question status)
// ---------------------------------------------------------------------------

export interface AnswerWrite {
  company?: string | null;
  employee: string;
  question?: string;
  answer: string;
  qid?: string;
  answeredBy?: string;
}

/** Create an answers document and maintain the question's rollup + status. */
export async function mongoSaveAnswer(p: AnswerWrite): Promise<void> {
  if (!mongoEnabled()) return;
  try {
    const companyKey = companyKeyOf(p.company);
    const { AnswerRepository } = await import('@/src/repositories/answer.repository');
    const { PriorityQuestionRepository } = await import('@/src/repositories/priorityQuestion.repository');
    const { AnswerService } = await import('@/src/services/answer.service');
    const { PriorityQuestionService } = await import('@/src/services/priorityQuestion.service');

    const questionRepo = new PriorityQuestionRepository({ companyKey });
    const answerSvc = new AnswerService(new AnswerRepository({ companyKey }), questionRepo);
    const qid = String(p.qid || '').trim();
    const answeredByKey = slugifyName(p.answeredBy || p.employee || '') || undefined;

    // Link by qid when present (QID/HIGH); otherwise record as MANUAL/MEDIUM so
    // the linkage confidence is explicit (per the V1 answers spec).
    const questionCode = qid || `Q-UI-${slugifyName(p.employee)}`;
    await answerSvc.createAnswer(
      {
        questionCode,
        answerMarkdown: p.answer,
        questionKind: 'PRIORITY',
        answeredByKey,
        answeredByName: p.answeredBy || p.employee,
        questionMatch: { strategy: qid ? 'QID' : 'MANUAL', confidence: qid ? 'HIGH' : 'MEDIUM' },
      },
      answeredByKey || 'system',
    );

    // Mark the question ANSWERED (accepted-answer state) when we can resolve it.
    if (qid) {
      try {
        const q = await questionRepo.findByCode(qid);
        if (q && q.status !== 'ANSWERED' && q.status !== 'ACCEPTED') {
          const qSvc = new PriorityQuestionService(questionRepo);
          await qSvc.updateQuestion(qid, q.version, { status: 'ANSWERED' }, answeredByKey || 'system');
        }
      } catch (err) {
        console.error('[mongo_bridge] update question status failed (non-fatal):', err);
      }
    }
  } catch (err) {
    console.error('[mongo_bridge] mongoSaveAnswer failed (non-fatal):', err);
  }
}

// ---------------------------------------------------------------------------
// Phase E — Meetings (dual-write meeting + meeting file)
// ---------------------------------------------------------------------------

export interface MeetingAttendeeInput {
  team_member_key?: string;
  external_name?: string;
}

export interface MeetingWrite {
  company?: string | null;
  title: string;
  meetingDate?: string;
  uploadedBy?: string;
  summary?: string;
  claudeSummary?: string;
  additionalDetails?: string;
  uploadedFile?: string;
  attendees?: MeetingAttendeeInput[];
  githubRef?: { path?: string; sha?: string };
}

/** Create a meetings document (embedded attendees) and a meetingFiles record. */
export async function mongoSaveMeeting(p: MeetingWrite): Promise<void> {
  if (!mongoEnabled()) return;
  try {
    const companyKey = companyKeyOf(p.company);
    const { MeetingRepository } = await import('@/src/repositories/meeting.repository');
    const { MeetingFileRepository } = await import('@/src/repositories/meetingFile.repository');
    const { MeetingService } = await import('@/src/services/meeting.service');
    const { MeetingFileService } = await import('@/src/services/meetingFile.service');

    const meetingRepo = new MeetingRepository({ companyKey });
    const meetingSvc = new MeetingService(meetingRepo);
    const actor = slugifyName(p.uploadedBy || '') || 'system';

    const attendees = (p.attendees || []).map((a) => {
      const key = a.team_member_key ? slugifyName(a.team_member_key) : '';
      return key
        ? { employeeKey: key, attended: true, followUpDone: false }
        : { externalName: String(a.external_name || '').trim(), attended: true, followUpDone: false };
    }).filter((a) => a.employeeKey || a.externalName);

    const summaryText = (p.claudeSummary || p.summary || '').trim();
    const meetingAt = p.meetingDate && !Number.isNaN(Date.parse(p.meetingDate))
      ? new Date(p.meetingDate)
      : new Date();

    const meeting = await meetingSvc.createMeeting(
      {
        title: p.title,
        meetingAt,
        meetingType: 'other',
        organizerKey: p.uploadedBy ? slugifyName(p.uploadedBy) : undefined,
        note: p.additionalDetails || undefined,
        attendees,
        summary: summaryText ? { text: summaryText, status: 'FINAL', engine: 'CLAUDE' } : undefined,
      },
      actor,
    );

    // Register the uploaded file's metadata (bytes remain in GitHub/source; only
    // a reference is stored — no object store in this phase).
    if (p.uploadedFile && meeting._id) {
      try {
        const fileSvc = new MeetingFileService(
          new MeetingFileRepository({ companyKey }),
          meetingRepo,
        );
        await fileSvc.registerFile(
          {
            meetingId: meeting._id,
            originalFilename: p.uploadedFile,
            storageRef: p.githubRef ? { provider: 'github', key: p.githubRef.path } : {},
            kind: 'NOTES',
          },
          actor,
        );
      } catch (err) {
        console.error('[mongo_bridge] register meeting file failed (non-fatal):', err);
      }
    }
  } catch (err) {
    console.error('[mongo_bridge] mongoSaveMeeting failed (non-fatal):', err);
  }
}
