import fs from 'fs';
import { NextRequest } from 'next/server';
import { json, abort, route, nowIso } from '@/lib/http';
import { getDb } from '@/lib/db';
import {
  list_meetings_for_company,
  save_meeting_notes_file,
  extract_member_file_preview,
} from '@/lib/helpers';
import { generate_meeting_intelligence } from './_meeting_helpers';

export const dynamic = 'force-dynamic';

// api_meetings (governance_ui.py:5620)
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

// api_meetings_create (governance_ui.py:5633)
export const POST = route(async (req: NextRequest) => {
  const form = await req.formData();
  const getStr = (k: string): string | null => {
    const v = form.get(k);
    return typeof v === 'string' ? v : null;
  };
  const company = getStr('company');
  const title = (getStr('title') || '').trim();
  const meeting_type = ((getStr('meeting_type') || 'other').trim()) || 'other';
  const meeting_date = (getStr('meeting_date') || todayIso()).trim();
  const organizer = (getStr('organizer') || '').trim();
  const note = (getStr('note') || '').trim();
  const attendees_raw = getStr('attendees_json') || '[]';
  const action_items_raw = getStr('action_items_json') || '[]';
  if (!company || !title) {
    abort(400, 'company and title required');
  }
  let attendees: any[];
  try {
    attendees = JSON.parse(attendees_raw);
  } catch {
    abort(400, 'attendees_json invalid');
  }
  let action_items: any[];
  try {
    action_items = JSON.parse(action_items_raw);
  } catch {
    abort(400, 'action_items_json invalid');
  }
  const notes_file = form.get('notes_file');
  let notes_file_path = '';
  if (notes_file && notes_file instanceof File && notes_file.name) {
    const buf = Buffer.from(await notes_file.arrayBuffer());
    notes_file_path = save_meeting_notes_file(
      company as string,
      {
        filename: notes_file.name,
        save: (p: string) => {
          fs.writeFileSync(p, buf);
        },
      },
      meeting_date,
      title,
    );
  }
  const now = nowIso();
  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO meetings(company, title, meeting_type, organizer, meeting_date, note, notes_file_path, created_at, updated_at)
           VALUES(?,?,?,?,?,?,?,?,?)`,
    )
    .run(company, title, meeting_type, organizer, meeting_date, note, notes_file_path, now, now);
  const meeting_id = Number(info.lastInsertRowid);
  for (const attendee of attendees!) {
    const team_member_key = String((attendee || {}).team_member_key || '').trim() || null;
    const external_name = String((attendee || {}).external_name || '').trim() || null;
    const external_email = String((attendee || {}).external_email || '').trim() || null;
    if (!team_member_key && !external_name) {
      continue;
    }
    db.prepare(
      `INSERT INTO meeting_attendees(meeting_id, team_member_key, external_name, external_email, attended, follow_up_done, follow_up_note, created_at, updated_at)
               VALUES(?,?,?,?,?,?,?,?,?)`,
    ).run(meeting_id, team_member_key, external_name, external_email, 1, 0, '', now, now);
  }
  for (const action_item of action_items!) {
    const description = String((action_item || {}).description || '').trim();
    const owner_key = String((action_item || {}).owner_key || '').trim() || null;
    if (!description) {
      continue;
    }
    db.prepare(
      `INSERT INTO meeting_action_items(meeting_id, owner_key, description, status, created_at, updated_at)
               VALUES(?,?,?,?,?,?)`,
    ).run(meeting_id, owner_key, description, 'open', now, now);
  }
  // Generate an AI meeting summary + per-attendee priority questions from the notes.
  let notes_text = '';
  if (notes_file_path) {
    try {
      notes_text = extract_member_file_preview(notes_file_path) || '';
    } catch {
      notes_text = '';
    }
  }
  if (!notes_text) {
    notes_text = note;
  }
  let summary_payload: any = { summary_status: 'none' };
  if ((notes_text || '').trim()) {
    try {
      summary_payload = await generate_meeting_intelligence(
        db,
        company as string,
        meeting_id,
        title,
        meeting_date,
        now,
        notes_text,
      );
    } catch (exc: any) {
      summary_payload = { summary_status: 'error', error: String(exc?.message ?? exc) };
    }
  }
  return json({
    ok: true,
    meeting_id,
    notes_file_path,
    updated_at: now,
    summary: summary_payload.summary,
    summary_status: summary_payload.summary_status,
    questions_created: summary_payload.questions_created ?? 0,
  });
});
