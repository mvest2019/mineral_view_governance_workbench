import fs from 'fs';
import os from 'os';
import path from 'path';
import { NextRequest } from 'next/server';
import { json, abort, route, nowIso } from '@/lib/http';
import { getDb } from '@/lib/db';
import {
  list_meetings_for_company,
  extract_member_file_preview,
  pretty_member_name,
} from '@/lib/helpers';
import { slugifyName } from '@/lib/github';
import { mongoEnabled } from '@/lib/mongo_bridge';
import { MeetingRepository } from '@/src/repositories/meeting.repository';
import { MeetingService, MeetingValidationError } from '@/src/services/meeting.service';
import { MeetingFileRepository } from '@/src/repositories/meetingFile.repository';
import { MeetingFileService, MeetingFileValidationError } from '@/src/services/meetingFile.service';
import { generate_meeting_summary_mongo } from './_meeting_helpers';

export const dynamic = 'force-dynamic';

const COMPANY_DEFAULT = 'MView';

// api_meetings (governance_ui.py:5620)
// NOTE: the meetings LIST is still read from SQLite (read-path migration is
// separate). The WRITE path below persists ONLY to MongoDB.
export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const attendee = req.nextUrl.searchParams.get('attendee') || null;
  const db = getDb();
  const rows = list_meetings_for_company(db, company as any, attendee);
  return json({
    company,
    rows,
    count: rows.length,
    roadmap_note:
      'Microsoft Teams direct integration is on the roadmap. For now, upload meeting notes manually; the file and attendees route to each attendee workspace automatically.',
  });
});

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Extract a text preview from an uploaded notes file WITHOUT persisting it. The
// bytes are written to a transient OS temp file only long enough to run the
// existing extractor (handles .txt/.md/.csv/.docx/.pdf), then deleted. No
// Markdown note is generated and nothing is committed to GitHub or a repo dir.
async function extractPreviewFromUpload(
  file: File,
): Promise<{ text: string; mimeType?: string; sizeBytes: number }> {
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || '';
  const tmp = path.join(
    os.tmpdir(),
    `mv_meeting_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`,
  );
  let text = '';
  try {
    fs.writeFileSync(tmp, buf);
    text = extract_member_file_preview(tmp) || '';
  } catch {
    text = '';
  } finally {
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
  return { text, mimeType: file.type || undefined, sizeBytes: buf.length };
}

// api_meetings_create — persists a meeting DIRECTLY and ONLY to MongoDB
// (GovernanceDB.meetings) with the uploaded file's metadata in
// GovernanceDB.meetingFiles. No GitHub token, no GitHub API, no Markdown file or
// commit, no SQLite write, no GitHub fallback. A MongoDB failure is surfaced.
export const POST = route(async (req: NextRequest) => {
  const form = await req.formData();
  const getStr = (k: string): string => {
    const v = form.get(k);
    return typeof v === 'string' ? v : '';
  };
  const company = getStr('company').trim();
  const title = getStr('title').trim();
  const meetingType = getStr('meeting_type').trim() || 'other';
  const meetingDate = getStr('meeting_date').trim() || todayIso();
  const organizer = getStr('organizer').trim();
  const note = getStr('note').trim();
  const attendeesRaw = getStr('attendees_json') || '[]';
  const actionItemsRaw = getStr('action_items_json') || '[]';

  // Input validation only (no GitHub/token checks).
  if (!company || !title) {
    abort(400, 'company and title required');
  }
  let attendeesInput: Array<Record<string, unknown>>;
  try {
    attendeesInput = JSON.parse(attendeesRaw);
  } catch {
    abort(400, 'attendees_json invalid');
  }
  let actionItemsInput: Array<Record<string, unknown>>;
  try {
    actionItemsInput = JSON.parse(actionItemsRaw);
  } catch {
    abort(400, 'action_items_json invalid');
  }

  // MongoDB is the ONLY persistence layer. If it is not configured, surface it.
  const enabled = mongoEnabled();
  console.log(`[meetings] MongoDB enabled: ${enabled}`);
  if (!enabled) {
    console.error('[meetings] MONGODB_URI is not set on the server — cannot persist meeting.');
    abort(503, 'MongoDB is not configured (MONGODB_URI is not set on the server).');
  }

  const companyKey = company || COMPANY_DEFAULT;
  const actor = slugifyName(organizer) || 'system';

  // Uploaded notes file → transcript preview (transient temp file; no persistence).
  let notesText = '';
  let fileMeta: { name: string; mimeType?: string; sizeBytes: number } | null = null;
  const notesFile = form.get('notes_file');
  if (notesFile instanceof File && notesFile.name) {
    const extracted = await extractPreviewFromUpload(notesFile);
    notesText = extracted.text;
    fileMeta = { name: notesFile.name, mimeType: extracted.mimeType, sizeBytes: extracted.sizeBytes };
  }
  if (!notesText) notesText = note;

  // Embedded attendees (→ meeting document). Keys are normalized to lowercase slugs.
  const attendeeLabels: string[] = [];
  const attendees = attendeesInput
    .map((a) => {
      const rawKey = String((a || {}).team_member_key || '').trim();
      const externalName = String((a || {}).external_name || '').trim();
      const externalEmail = String((a || {}).external_email || '').trim();
      if (rawKey) {
        attendeeLabels.push(pretty_member_name(rawKey));
        return { employeeKey: slugifyName(rawKey), attended: true, followUpDone: false };
      }
      if (externalName) {
        attendeeLabels.push(externalName);
        return {
          externalName,
          ...(externalEmail ? { externalEmail } : {}),
          attended: true,
          followUpDone: false,
        };
      }
      return null;
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  // Embedded action items (→ meeting document).
  const actionItems = actionItemsInput
    .map((it) => {
      const description = String((it || {}).description || '').trim();
      if (!description) return null;
      const ownerRaw = String((it || {}).owner_key || '').trim();
      return {
        description,
        status: 'OPEN' as const,
        ...(ownerRaw ? { ownerKey: slugifyName(ownerRaw) } : {}),
      };
    })
    .filter((it): it is NonNullable<typeof it> => it !== null);

  // Best-effort AI summary (no SQLite, no GitHub). Falls back to the heuristic.
  let summary: { text: string; status: 'NONE' | 'DRAFT' | 'FINAL'; engine: 'CLAUDE' | 'OPENAI' | 'HEURISTIC' } | undefined;
  if ((notesText || '').trim()) {
    try {
      const s = await generate_meeting_summary_mongo(company, title, meetingDate, attendeeLabels, notesText);
      if (s.summary) summary = { text: s.summary, status: s.status, engine: s.engine };
    } catch (err) {
      console.error('[meetings] summary generation failed (non-fatal):', err);
    }
  }
  if (!summary && note) {
    summary = { text: note, status: 'FINAL', engine: 'HEURISTIC' };
  }

  const meetingAt = meetingDate && !Number.isNaN(Date.parse(meetingDate)) ? new Date(meetingDate) : new Date();
  const meetingSvc = new MeetingService(new MeetingRepository({ companyKey }));

  console.log(
    `[meetings] MongoDB insert attempted — db=GovernanceDB collection=meetings `
      + `company=${companyKey} title="${title}" attendees=${attendees.length}`,
  );

  let meetingId: string;
  try {
    const saved = await meetingSvc.createMeeting(
      {
        title,
        meetingAt,
        meetingType,
        ...(organizer ? { organizerKey: slugifyName(organizer) } : {}),
        ...(note ? { note } : {}),
        attendees,
        actionItems,
        ...(summary ? { summary } : {}),
      },
      actor,
    );
    meetingId = String((saved as { _id?: unknown })._id);
    console.log(`[meetings] MongoDB insert SUCCEEDED — meetings._id=${meetingId}`);
  } catch (err) {
    // DO NOT swallow — return the actual error.
    if (err instanceof MeetingValidationError) {
      console.error('[meetings] meetings insert FAILED — edge validation:', err.errors);
      return json({ error: err.message, errors: err.errors }, 400);
    }
    const e = err as { name?: string; code?: number; message?: string; errInfo?: unknown };
    console.error(
      `[meetings] meetings insert FAILED — name=${e?.name} code=${e?.code} message=${e?.message}`,
      e?.errInfo ? `errInfo=${JSON.stringify(e.errInfo)}` : '',
    );
    return json(
      { error: e?.message || 'MongoDB insert failed', name: e?.name ?? null, code: e?.code ?? null, errInfo: e?.errInfo ?? null },
      500,
    );
  }

  // Register the uploaded file's metadata in meetingFiles (bytes are not stored —
  // no object store is configured; the extracted transcript text is kept instead).
  let fileId: string | null = null;
  let fileError: string | null = null;
  if (fileMeta) {
    try {
      const fileSvc = new MeetingFileService(
        new MeetingFileRepository({ companyKey }),
        new MeetingRepository({ companyKey }),
      );
      console.log(`[meetings] MongoDB insert attempted — collection=meetingFiles file="${fileMeta.name}"`);
      const savedFile = await fileSvc.registerFile(
        {
          meetingId,
          originalFilename: fileMeta.name,
          storageRef: {},
          kind: 'NOTES',
          ...(fileMeta.mimeType ? { mimeType: fileMeta.mimeType } : {}),
          ...(Number.isFinite(fileMeta.sizeBytes) ? { sizeBytes: fileMeta.sizeBytes } : {}),
          ...(notesText ? { transcriptText: notesText.slice(0, 100000) } : {}),
        },
        actor,
      );
      fileId = String((savedFile as { _id?: unknown })._id);
      console.log(`[meetings] MongoDB insert SUCCEEDED — meetingFiles._id=${fileId}`);
    } catch (err) {
      // The meeting is already saved; surface the file error without discarding it.
      fileError = err instanceof MeetingFileValidationError
        ? err.message
        : ((err as { message?: string })?.message || 'meetingFiles insert failed');
      console.error('[meetings] meetingFiles insert FAILED —', err);
    }
  }

  return json({
    ok: true,
    meeting_id: meetingId,
    file_id: fileId,
    file_error: fileError,
    notes_file_path: '',
    updated_at: nowIso(),
    summary: summary?.text ?? '',
    summary_status: summary ? summary.status.toLowerCase() : 'none',
    questions_created: 0,
    // Extracted transcript text so the analyze step can determine question
    // ownership from the actual conversation (who committed to which work).
    notes_preview: (notesText || '').slice(0, 8000),
    collection: 'meetings',
    database: 'GovernanceDB',
  });
});
