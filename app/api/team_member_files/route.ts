import fs from 'fs';
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { abort, json, nowIso, route } from '@/lib/http';
import {
  append_team_member_correspondence_event,
  file_size_safe,
  list_team_member_files,
  normalize_team_member_file_purpose,
  team_member_file_storage_path,
} from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const member_key = req.nextUrl.searchParams.get('member');
  if (!company || !member_key) {
    abort(400, 'company and member required');
  }
  const db = getDb();
  const rows = list_team_member_files(db, company as string, member_key as string);
  return json({
    company,
    member_key,
    rows,
    count: rows.length,
  });
});

export const POST = route(async (req: NextRequest) => {
  const form = await req.formData();
  const company = form.get('company') as string | null;
  const member_key = form.get('member_key') as string | null;
  const source_type = ((form.get('source_type') as string | null) || 'document').trim() || 'document';
  const ai_preference = ((form.get('ai_engines') as string | null) || 'Claude').trim() || 'Claude';
  const note = ((form.get('note') as string | null) || '').trim();
  const file_purpose = normalize_team_member_file_purpose(
    (form.get('file_purpose') as string | null) || 'other',
  );
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (!company || !member_key) {
    abort(400, 'company and member_key required');
  }
  if (!files.length) {
    abort(400, 'no files attached');
  }
  const now = nowIso();
  const db = getDb();
  const created: any[] = [];
  for (const handle of files) {
    if (!handle || !handle.name) {
      continue;
    }
    const safe_name = handle.name.replace(/\//g, '_').replace(/\\/g, '_');
    const output_path = team_member_file_storage_path(
      company as string,
      member_key as string,
      safe_name,
      file_purpose,
    );
    fs.writeFileSync(output_path, Buffer.from(await handle.arrayBuffer()));
    const info = db
      .prepare(
        `INSERT INTO team_member_files(
                   company, member_key, original_filename, saved_path, source_type, note,
                   ai_preference, size_bytes, uploaded_at, uploaded_by, file_purpose,
                   linked_question_packet_id, parsed_answer_count, generated_question_count
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        company,
        member_key,
        safe_name,
        String(output_path),
        source_type,
        note,
        ai_preference,
        file_size_safe(output_path),
        now,
        'user',
        file_purpose,
        null,
        0,
        0,
      );
    const lastId = Number(info.lastInsertRowid);
    created.push({
      id: lastId,
      original_filename: safe_name,
      saved_path: String(output_path),
      size_bytes: file_size_safe(output_path),
      file_purpose,
    });
    append_team_member_correspondence_event(
      db,
      company as string,
      member_key as string,
      'file_uploaded',
      `Uploaded ${safe_name} as ${file_purpose}.`,
      'Ryan',
      lastId,
    );
  }
  return json({
    ok: true,
    company,
    member_key,
    rows: created,
    count: created.length,
  });
});
